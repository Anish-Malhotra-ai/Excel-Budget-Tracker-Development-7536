import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

serve(async (req) => {
  const { email, password, fullName } = await req.json()

  const client = new SmtpClient()

  await client.connect({
    hostname: Deno.env.get('SMTP_HOSTNAME'),
    port: Number(Deno.env.get('SMTP_PORT')),
    username: Deno.env.get('SMTP_USERNAME'),
    password: Deno.env.get('SMTP_PASSWORD'),
  })

  await client.send({
    from: Deno.env.get('SMTP_FROM'),
    to: email,
    subject: 'Welcome to Financial Wealth Builder - Your Account Credentials',
    content: `
      <h1>Welcome to Financial Wealth Builder, ${fullName}!</h1>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please log in at <a href="${Deno.env.get('APP_URL')}">${Deno.env.get('APP_URL')}</a></p>
      <p>For security reasons, we recommend changing your password after your first login.</p>
      <p>Best regards,<br>Financial Wealth Builder Team</p>
    `,
    html: true,
  })

  await client.close()

  return new Response(
    JSON.stringify({ message: 'Credentials sent successfully' }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})