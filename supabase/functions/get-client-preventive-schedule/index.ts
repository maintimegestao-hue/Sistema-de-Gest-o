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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { clientId, year } = await req.json()

    console.log('🔍 Buscando cronograma preventivo para cliente:', clientId, 'ano:', year)

    // Buscar equipamentos do cliente
    const { data: equipments, error: equipError } = await supabaseClient
      .from('equipments')
      .select('id, user_id')
      .eq('client_id', clientId)
      .in('status', ['operational', 'active', 'maintenance'])

    if (equipError) {
      console.error('❌ Erro ao buscar equipamentos:', equipError)
      throw equipError
    }

    if (!equipments || equipments.length === 0) {
      console.log('⚠️ Nenhum equipamento encontrado para o cliente')
      return new Response(
        JSON.stringify({ data: [], message: 'Nenhum equipamento encontrado para este cliente' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const equipmentIds = equipments.map(eq => eq.id)
    console.log('📋 Equipamentos encontrados:', equipmentIds.length)

    // Buscar cronograma preventivo para esses equipamentos
    const { data: schedule, error: scheduleError } = await supabaseClient
      .from('annual_preventive_schedule')
      .select(`
        *,
        equipment:equipments(
          name,
          installation_location,
          client,
          preventive_periodicity,
          status
        )
      `)
      .in('equipment_id', equipmentIds)
      .eq('year', year)
      .order('month', { ascending: true })

    if (scheduleError) {
      console.error('❌ Erro ao buscar cronograma:', scheduleError)
      throw scheduleError
    }

    console.log('✅ Cronograma encontrado:', schedule?.length || 0, 'registros')

    return new Response(
      JSON.stringify({ data: schedule || [], count: schedule?.length || 0 }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erro interno do servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})