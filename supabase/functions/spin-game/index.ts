import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import { generateGrid, evaluateGrid } from "./slotEngine.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error("Missing Authorization header")

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) throw new Error("Unauthorized")

    const { bet } = await req.json()
    if (!bet || bet <= 0) throw new Error("Invalid bet amount")

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('crystals, is_banned')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) throw new Error("Profile not found")
    if (profile.is_banned) throw new Error("Account is banned")
    if (profile.crystals < bet) throw new Error("Insufficient balance")

    const { data: items } = await supabaseAdmin.from('gacha_items').select('*')
    if (!items || items.length === 0) throw new Error("Game items not configured")

    const dynamicPaytable: any = {}
    items.forEach((item: any) => {
      dynamicPaytable[item.name] = { 3: item.payout_3 || 0, 4: item.payout_4 || 0, 5: item.payout_5 || 0 }
    })

    const finalGrid = generateGrid(items)
    const { totalWin, winTileSet, lineResults } = evaluateGrid(finalGrid, bet, dynamicPaytable)

    const newBalance = (profile.crystals - bet) + totalWin
    await supabaseAdmin.from('profiles').update({ crystals: newBalance }).eq('id', user.id)

    await supabaseAdmin.from('spin_logs').insert({
      user_id: user.id,
      bet_amount: bet,
      win_amount: totalWin,
      grid_result: finalGrid
    })

    return new Response(
      JSON.stringify({ 
        finalGrid, 
        totalWin, 
        newBalance, 
        lineResults, 
        winTileSet: Array.from(winTileSet) 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})