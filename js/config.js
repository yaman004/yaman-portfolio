/* EmailJS settings — fill these in after following EMAILJS_SETUP.md.
   All three values are safe to be public (they are meant to live in front-end code);
   lock them to your domain in the EmailJS dashboard (Account → Security). */
const EMAILJS = {
  publicKey: 'knQDrfKOZxtNuE_2U',          // Account → General → Public Key
  serviceId: 'service_vppsssa',          // Email Services → your Gmail service
  templateId: 'template_bhyob6a',        // Email Templates → the "new message" template (sent to YOU)
  autoReplyTemplateId: '',               // optional: template that thanks the visitor (leave '' to skip)
  cooldownSeconds: 30,                   // minimum gap between two messages from one browser
  maxMessageLength: 1500,
}
