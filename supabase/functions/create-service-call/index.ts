import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const requestBody = await req.json()
    const { 
      clientId, 
      equipmentId, 
      problemTypes, 
      description, 
      photos,
      clientNotes,
      accessCode 
    } = requestBody

    console.log('Creating service call with data:', {
      clientId,
      equipmentId,
      problemTypes,
      description: description?.substring(0, 50) + '...',
      photosCount: photos?.length || 0,
      hasAccessCode: !!accessCode
    })

    // Validar dados obrigatórios
    if (!clientId || !equipmentId || !problemTypes || !Array.isArray(problemTypes)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: clientId, equipmentId, problemTypes' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar se o cliente tem acesso (se accessCode foi fornecido)
    if (accessCode) {
      const { data: clientAuth } = await supabase.rpc('authenticate_client', {
        input_access_code: accessCode
      })

      if (!clientAuth || clientAuth.length === 0 || clientAuth[0].client_id !== clientId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized access' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Verificar se o equipamento existe e pertence ao cliente
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipments')
      .select('id, client_id, name, installation_location')
      .eq('id', equipmentId)
      .eq('client_id', clientId)
      .single()

    if (equipmentError || !equipment) {
      console.error('Equipment not found:', equipmentError)
      return new Response(
        JSON.stringify({ error: 'Equipment not found or not accessible' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Criar o chamado usando a função do banco
    const { data: serviceCall, error: callError } = await supabase.rpc('create_service_call', {
      p_client_id: clientId,
      p_equipment_id: equipmentId,
      p_problem_types: problemTypes,
      p_description: description || null,
      p_photos: photos || [],
      p_client_notes: clientNotes || null
    })

    if (callError || !serviceCall || serviceCall.length === 0) {
      console.error('Error creating service call:', callError)
      return new Response(
        JSON.stringify({ error: 'Failed to create service call' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const callData = serviceCall[0]
    
    console.log('Service call created successfully:', {
      callId: callData.call_id,
      callNumber: callData.call_number,
      equipmentName: equipment.name
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          callId: callData.call_id,
          callNumber: callData.call_number,
          status: callData.status,
          equipment: {
            name: equipment.name,
            location: equipment.installation_location
          }
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})