import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function twilioSmsPlugin(env) {
  return {
    name: 'twilio-sms-api',
    configureServer(server) {
      server.middlewares.use('/api/sms', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        const respond = (status, payload) => {
          res.statusCode = status
          res.end(JSON.stringify(payload))
        }

        if (req.method !== 'POST') {
          return respond(405, { success: false, error: 'Method not allowed.' })
        }

        let rawBody = ''
        for await (const chunk of req) {
          rawBody += chunk
          if (Buffer.byteLength(rawBody) > 16_384) {
            return respond(413, { success: false, error: 'Request is too large.' })
          }
        }

        let payload
        try {
          payload = JSON.parse(rawBody)
        } catch {
          return respond(400, { success: false, error: 'Invalid JSON request.' })
        }

        const to = typeof payload.to === 'string' ? payload.to.trim() : ''
        const message = typeof payload.message === 'string' ? payload.message.trim() : ''
        if (!/^\+[1-9]\d{7,14}$/.test(to) || !message || message.length > 1600) {
          return respond(400, { success: false, error: 'Enter a valid international phone number and message.' })
        }

        const accountSid = env.TWILIO_ACCOUNT_SID?.trim()
        const authToken = env.TWILIO_AUTH_TOKEN?.trim()
        const messagingServiceSid = env.TWILIO_MESSAGING_SERVICE_SID?.trim()
        const fromNumber = env.TWILIO_FROM_NUMBER?.trim()
        if (!accountSid || !authToken || (!messagingServiceSid && !fromNumber)) {
          return respond(503, {
            success: false,
            error: 'Twilio is not configured. Set account credentials and a sender number or Messaging Service SID.',
          })
        }

        const form = new URLSearchParams({ To: to, Body: message })
        if (messagingServiceSid) form.set('MessagingServiceSid', messagingServiceSid)
        else form.set('From', fromNumber)

        try {
          const twilioResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
            {
              method: 'POST',
              headers: {
                Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: form,
            },
          )
          const result = await twilioResponse.json()
          if (!twilioResponse.ok) {
            return respond(502, { success: false, error: result.message || 'Twilio rejected the SMS.' })
          }

          return respond(200, { success: true, sid: result.sid, status: result.status })
        } catch {
          return respond(502, { success: false, error: 'Could not reach the Twilio API.' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  return {
    plugins: [react(), twilioSmsPlugin(env)],
  }
})
