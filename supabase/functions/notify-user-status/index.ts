// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const SMTP_USER = Deno.env.get('SMTP_USER')
const SMTP_PASS = Deno.env.get('SMTP_PASS')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking, status } = await req.json()
    const userEmail = booking.user_email
    const venueName = booking.halls?.name || "Requested Venue"

    const subject = `Booking Update: Your request has been ${status}`
    const statusColor = status === 'Confirmed' ? '#10b981' : '#f43f5e'
    
    let htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px; background: #ffffff;">
        <h2 style="color: ${statusColor}; margin-top:0;">Booking ${status}</h2>
        <p>Dear ${booking.user_name},</p>
        <p>The status of your venue reservation request for <strong>${booking.event_name}</strong> has been updated.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; color: #475569;">Venue:</td><td style="padding: 10px;">${venueName}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Date:</td><td style="padding: 10px;">${booking.booking_date}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; color: #475569;">Time Windows:</td><td style="padding: 10px;">${booking.start_time} - ${booking.end_time}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Status:</td><td style="padding: 10px; color: ${statusColor}; font-weight: bold;">${status}</td></tr>
        </table>

        <p style="font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          This is an automated notification from the St. Ann's Venue Management Portal.
        </p>
      </div>
    `

    // Initialize the SMTP Client to securely route directly through Google Mail servers
    const client = new SmtpClient()
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: SMTP_USER,
      password: SMTP_PASS,
    })

    await client.send({
      from: `St. Ann's Booking Portal <${SMTP_USER}>`,
      to: userEmail,
      subject: subject,
      content: htmlContent,
      html: htmlContent,
    })

    await client.close()

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