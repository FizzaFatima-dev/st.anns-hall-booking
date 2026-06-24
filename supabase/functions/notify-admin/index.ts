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
    const adminEmail = Deno.env.get('ADMIN_EMAIL')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL secret is not configured in Supabase.')
    }

    let subject = `[St. Ann's Booking] Alert`
    if (type === 'NEW_REQUEST') subject = `🚨 New Booking Request: ${detail.event_name}`
    if (type === 'MODIFICATION') subject = `✏️ Reschedule Request: ${detail.event_name}`
    if (type === 'CANCELLATION') subject = `🗑️ Cancellation Request: ${detail.event_name}`

    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; color: #334155;">
        <h2 style="color: #059669;">Venue Schedule Update</h2>
        <p><strong>Action Type:</strong> ${type}</p>
        <p><strong>Venue Location:</strong> ${hallName}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <h3>Reservation Details:</h3>
        <ul>
          <li><strong>Event Title:</strong> ${detail.event_name}</li>
          <li><strong>Host Name:</strong> ${detail.user_name || 'N/A'}</li>
          <li><strong>Host Email:</strong> ${detail.user_email || 'N/A'}</li>
          <li><strong>Department:</strong> ${detail.department}</li>
          <li><strong>Date:</strong> ${detail.booking_date}</li>
          <li><strong>Hours Window:</strong> ${detail.start_time} - ${detail.end_time}</li>
        </ul>
        <p style="font-size: 12px; color: #64748b; margin-top: 30px;">This is an automated operational notice from the St. Ann's Portal system.</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "St. Ann's Portal <onboarding@resend.dev>",
        to: [adminEmail],
        subject: subject,
        html: htmlContent,
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
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