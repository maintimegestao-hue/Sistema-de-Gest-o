import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { clientId, accessCode } = await req.json();

    if (!clientId) {
      return new Response(
        JSON.stringify({ error: 'Missing clientId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate access if an accessCode is provided
    if (accessCode) {
      const { data: clientAuth } = await supabase.rpc('authenticate_client', {
        input_access_code: accessCode,
      });

      if (!clientAuth || clientAuth.length === 0 || clientAuth[0].client_id !== clientId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized access' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch client name for legacy equipment records (stored by name)
    const { data: clientRow } = await supabase
      .from('clients')
      .select('name')
      .eq('id', clientId)
      .maybeSingle();

    let query = supabase
      .from('equipments')
      .select('id, name, installation_location, brand, model, serial_number, status, qr_code, client_id')
      .order('name', { ascending: true });

    if (clientRow?.name) {
      query = query.or(`client_id.eq.${clientId},client.eq.${clientRow.name}`);
    } else {
      query = query.eq('client_id', clientId);
    }

    const { data: equipments, error } = await query;

    if (error) {
      console.error('Error fetching client equipments:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch equipments' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, equipments: equipments || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Unexpected error:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
