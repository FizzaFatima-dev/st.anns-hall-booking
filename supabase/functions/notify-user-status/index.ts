// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SMTP_USER = Deno.env.get('SMTP_USER')
const SMTP_PASS = Deno.env.get('SMTP_PASS')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record, old_record } = await req.json()

    // 1. Safety check: Break early if the status hasn't actually changed
    if (record.status === old_record.status) {
      return new Response(JSON.stringify({ message: "No status change detected." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const userEmail = record.user_email
    const status = record.status 
    let venueName = "Requested Venue"

    // 2. Fetch the true venue name from the 'halls' table using the relational hall_id
    if (record.hall_id && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      const { data: hallData } = await supabase
        .from('halls')
        .select('name')
        .eq('id', record.hall_id)
        .single()
      
      if (hallData?.name) {
        venueName = hallData.name
      }
    }

    // 3. Set up the dynamic branding and text
    const subject = `Booking Update: Your request has been ${status}`
    const isApproved = status.toLowerCase() === 'approved' || status.toLowerCase() === 'confirmed'
    const statusColor = isApproved ? '#10b981' : '#f43f5e'
    
    // 4. Your custom-styled layout
    let htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px; background: #ffffff;">
        <h2 style="color: ${statusColor}; margin-top:0;">Booking ${status}</h2>
        <p>Dear ${record.user_name || 'User'},</p>
        <p>The status of your venue reservation request for <strong>${record.event_name || 'Event'}</strong> has been updated.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; color: #475569;">Venue:</td><td style="padding: 10px;">${venueName}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Date:</td><td style="padding: 10px;">${record.booking_date}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; color: #475569;">Time Windows:</td><td style="padding: 10px;">${record.start_time} - ${record.end_time}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Status:</td><td style="padding: 10px; color: ${statusColor}; font-weight: bold;">${status}</td></tr>
        </table>

        <p style="font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          This is an automated notification from the St. Ann's Venue Management Portal.
        </p>
      </div>
    `

    // 5. Connect and send directly through Google's SMTP network
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