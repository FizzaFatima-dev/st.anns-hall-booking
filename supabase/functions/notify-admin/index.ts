// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'fizzafatima343@gmail.com'

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

    let subject = `[St. Ann's Booking] Alert`
    if (type === 'NEW_REQUEST') subject = `🚨 New Booking Request: ${detail.event_name}`
    if (type === 'MODIFICATION') subject = `✏️ Reschedule Request: ${detail.event_name}`
    if (type === 'CANCELLATION') subject = `🗑️ Cancellation Request: ${detail.event_name}`

    // Clean, responsive HTML layout matching your confirmation email style
    let htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px;">
        <h2 style="color: #0f172a; margin-bottom: 4px;">Venue Schedule Update Notice</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 0;">Action Type: <span style="font-weight: bold; color: #0284c7;">${type}</span></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; color: #475569;">Venue Location:</td><td style="padding: 10px; font-weight: 500;">${hallName}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Event Title:</td><td style="padding: 10px; font-weight: 500;">${detail.event_name || 'N/A'}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; color: #475569;">Host Name:</td><td style="padding: 10px;">${detail.user_name || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Host Email:</td><td style="padding: 10px;">${detail.user_email || 'N/A'}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; color: #475569;">Department:</td><td style="padding: 10px;">${detail.department || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Date:</td><td style="padding: 10px; font-weight: 500;">${detail.booking_date || 'N/A'}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; color: #475569;">Schedule Window:</td><td style="padding: 10px; font-weight: 500;">${detail.start_time || 'N/A'} - ${detail.end_time || 'N/A'}</td></tr>
        </table>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://st-anns-hall-booking.vercel.app/admin" style="background:#10b981; color:white; padding:12px 24px; text-decoration:none; border-radius:10px; font-weight:bold; font-size: 14px; display: inline-block;">Open Admin Control Panel</a>
        </div>
      </div>
    `

    // Directly invoking Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "St. Ann's Booking <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: subject,
        html: htmlContent,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify({ success: true, data }), {
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