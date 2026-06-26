// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, detail, hallName } = await req.json()
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'fizzafatima343@gmail.com'

    let subject = `[St. Ann's Booking] Alert`
    if (type === 'NEW_REQUEST') subject = `🚨 New Booking Request: ${detail.event_name}`
    if (type === 'MODIFICATION') subject = `✏️ Reschedule Request: ${detail.event_name}`
    if (type === 'CANCELLATION') subject = `🗑️ Cancellation Request: ${detail.event_name}`

    const messageText = `
      Venue Schedule Update Notice
      ---------------------------
      Action Type: ${type}
      Venue Location: ${hallName}
      
      Reservation Details:
      - Event Title: ${detail.event_name || 'N/A'}
      - Host Name: ${detail.user_name || 'N/A'}
      - Host Email: ${detail.user_email || 'N/A'}
      - Department: ${detail.department || 'N/A'}
      - Date: ${detail.booking_date || 'N/A'}
      - Schedule Window: ${detail.start_time || 'N/A'} - ${detail.end_time || 'N/A'}
    `

    const response = await fetch('https://formspree.io/f/xanypwyb', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _to: adminEmail,
        subject: subject,
        message: messageText,
      }),
    })

    const resData = await response.json()

    return new Response(JSON.stringify({ success: true, data: resData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})