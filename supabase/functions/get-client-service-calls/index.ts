import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { clientId, accessCode, limit = 50 } = await req.json()

    if (!clientId) {
      return new Response(JSON.stringify({ error: 'Missing clientId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate access when accessCode provided
    if (accessCode) {
      const { data: clientAuth } = await supabase.rpc('authenticate_client', {
        input_access_code: accessCode,
      })
      if (!clientAuth || clientAuth.length === 0 || clientAuth[0].client_id !== clientId) {
        return new Response(JSON.stringify({ error: 'Unauthorized access' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const { data, error } = await supabase
      .from('service_calls')
      .select(`
        id, 
        call_number, 
        status, 
        priority, 
        created_at, 
        equipments:equipment_id(name, client),
        clients:client_id(name)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(Math.min(100, Math.max(1, Number(limit) || 50)))

    if (error) {
      console.error('Error fetching client service calls:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch service calls' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
