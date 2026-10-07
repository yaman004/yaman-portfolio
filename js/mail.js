/* Sends a message through EmailJS' REST API (no SDK needed). */
const MAIL_KEY = 'ls-last-mail'
const mailConfigured = () => !!(EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.templateId && !/^YOUR_/.test(EMAILJS.publicKey + EMAILJS.serviceId + EMAILJS.templateId))
function mailCooldownLeft() {
  try { const t = Number(localStorage.getItem(MAIL_KEY) || 0); return Math.max(0, Math.ceil((t + EMAILJS.cooldownSeconds * 1000 - Date.now()) / 1000)) } catch (e) { return 0 }
}
async function emailjsPost(templateId, params) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
      body: JSON.stringify({ service_id: EMAILJS.serviceId, template_id: templateId, user_id: EMAILJS.publicKey, template_params: params }),
    })
    const text = await r.text()
    return { ok: r.ok, status: r.status, text }
  } finally { clearTimeout(timer) }
}
// returns { ok:true } or { ok:false, reason:'notconfigured'|'cooldown'|'network'|'rejected', detail }
async function sendMail(f) {
  if (!mailConfigured()) return { ok: false, reason: 'notconfigured' }
  const wait = mailCooldownLeft()
  if (wait) return { ok: false, reason: 'cooldown', detail: wait }
  const params = {
    to_name: 'Yaman', from_name: f.name, from_email: f.email, reply_to: f.email,
    subject: f.subject || 'New message from your portfolio', message: f.message,
    sent_at: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), site: location.href.split('#')[0],
  }
  try {
    const r = await emailjsPost(EMAILJS.templateId, params)
    if (!r.ok) { console.warn('EmailJS rejected the request:', r.status, r.text); return { ok: false, reason: 'rejected', detail: r.text } }
    try { localStorage.setItem(MAIL_KEY, String(Date.now())) } catch (e) {}
    if (EMAILJS.autoReplyTemplateId) setTimeout(() => emailjsPost(EMAILJS.autoReplyTemplateId, params).catch(() => {}), 1300) // API allows 1 request / second
    return { ok: true }
  } catch (e) {
    console.warn('EmailJS network error:', e)
    return { ok: false, reason: 'network', detail: String(e && e.message) }
  }
}
