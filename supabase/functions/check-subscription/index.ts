
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("No Stripe key found, checking trial period only");
      
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("No authorization header provided");
      
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError) throw new Error(`Authentication error: ${userError.message}`);
      const user = userData.user;
      if (!user?.email) throw new Error("User not authenticated or email not available");
      
      // Verificar período de teste
      const { data: subscriber } = await supabaseClient
        .from("subscribers")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (!subscriber) {
        // Criar período de teste se não existir
        const trialStart = new Date();
        const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        await supabaseClient.from("subscribers").insert({
          user_id: user.id,
          email: user.email,
          subscribed: false,
          subscription_tier: "trial",
          trial_start: trialStart.toISOString(),
          trial_end: trialEnd.toISOString(),
        });
        
        return new Response(JSON.stringify({
          subscribed: false,
          subscription_tier: "trial",
          trial_end: trialEnd.toISOString(),
          days_remaining: 7,
          trial_expired: false
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      const now = new Date();
      const trialEnd = new Date(subscriber.trial_end);
      const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      return new Response(JSON.stringify({
        subscribed: subscriber.subscribed,
        subscription_tier: subscriber.subscription_tier,
        trial_end: subscriber.trial_end,
        days_remaining: daysRemaining,
        trial_expired: daysRemaining === 0 && !subscriber.subscribed
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, checking trial period");
      
      const { data: subscriber } = await supabaseClient
        .from("subscribers")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      const now = new Date();
      const trialEnd = subscriber ? new Date(subscriber.trial_end) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      await supabaseClient.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: "trial",
        trial_end: trialEnd.toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({
        subscribed: false,
        subscription_tier: "trial",
        trial_end: trialEnd.toISOString(),
        days_remaining: daysRemaining,
        trial_expired: daysRemaining === 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data.length > 0 ? customers.data[0].id : null;
    logStep("Customer check completed", { customerId });

    let hasActiveSub = false;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let stripeSubscriptionId = null;

    if (customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      
      hasActiveSub = subscriptions.data.length > 0;

      if (hasActiveSub) {
        const subscription = subscriptions.data[0];
        stripeSubscriptionId = subscription.id;
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
        
        // Determine subscription tier from price
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        if (amount <= 999) {
          subscriptionTier = "Basic";
        } else if (amount <= 1999) {
          subscriptionTier = "Premium";
        } else {
          subscriptionTier = "Enterprise";
        }
        logStep("Determined subscription tier", { priceId, amount, subscriptionTier });

        // Update subscription in subscribers table
        await supabaseClient.from("subscribers").upsert({
          user_id: user.id,
          email: user.email,
          stripe_customer_id: customerId,
          subscribed: true,
          subscription_tier: subscriptionTier,
          subscription_end: subscriptionEnd,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      } else {
        logStep("No active subscription found");
        // Update subscribers table to show no active subscription
        await supabaseClient.from("subscribers").upsert({
          user_id: user.id,
          email: user.email,
          stripe_customer_id: customerId,
          subscribed: false,
          subscription_tier: "trial",
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      }
    }

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
