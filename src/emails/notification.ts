const LOGO_URL = 'https://rodrigorey.info/projects/icons/rr-transparent.png';

const copy = {
  en: {
    badge: 'New Message',
    subtitle: 'Portfolio · Contact Form',
    heading: 'Someone reached out',
    labelName: 'Name',
    labelEmail: 'Email',
    labelSubject: 'Subject',
    labelMessage: 'Message',
    reply: (name: string) => `Reply to ${name}`,
    footer: 'rodrigorey.info · This notification was sent automatically.',
  },
  es: {
    badge: 'Nuevo Mensaje',
    subtitle: 'Portfolio · Formulario de Contacto',
    heading: 'Alguien se puso en contacto',
    labelName: 'Nombre',
    labelEmail: 'Email',
    labelSubject: 'Asunto',
    labelMessage: 'Mensaje',
    reply: (name: string) => `Responder a ${name}`,
    footer: 'rodrigorey.info · Esta notificación fue enviada automáticamente.',
  },
};

export function notificationEmail({
  name,
  email,
  subject,
  message,
  lang = 'en',
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
  lang?: 'en' | 'es';
}) {
  const c = copy[lang ?? 'en'];
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${c.badge}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background-color:#0f172a;padding:28px 40px;border-bottom:3px solid #7c3aed;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <img src="${LOGO_URL}" alt="RR" width="40" height="40" style="display:block;"/>
                </td>
                <td style="padding-left:14px;">
                  <p style="margin:0;font-size:17px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">Rodrigo Rey</p>
                  <p style="margin:2px 0 0 0;font-size:12px;color:#64748b;letter-spacing:0.5px;text-transform:uppercase;">${c.subtitle}</p>
                </td>
                <td align="right">
                  <span style="display:inline-block;background-color:#7c3aed;color:#ffffff;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;padding:4px 10px;">${c.badge}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background-color:#ffffff;padding:40px;">

            <h1 style="margin:0 0 28px 0;font-size:22px;font-weight:700;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:20px;">
              ${c.heading}
            </h1>

            <!-- Sender block -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;background-color:#f8fafc;border-left:3px solid #7c3aed;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:50%;padding-bottom:12px;vertical-align:top;">
                        <p style="margin:0 0 4px 0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${c.labelName}</p>
                        <p style="margin:0;font-size:15px;color:#1e293b;font-weight:600;">${name}</p>
                      </td>
                      <td style="width:50%;padding-bottom:12px;vertical-align:top;">
                        <p style="margin:0 0 4px 0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${c.labelEmail}</p>
                        <a href="mailto:${email}" style="margin:0;font-size:15px;color:#7c3aed;text-decoration:none;font-weight:500;">${email}</a>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2">
                        <p style="margin:0 0 4px 0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${c.labelSubject}</p>
                        <p style="margin:0;font-size:15px;color:#1e293b;font-weight:600;">${subject}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Message -->
            <p style="margin:0 0 12px 0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${c.labelMessage}</p>
            <div style="background-color:#f8fafc;border:1px solid #e2e8f0;padding:20px 24px;">
              <p style="margin:0;font-size:15px;color:#334155;line-height:1.8;white-space:pre-wrap;">${message}</p>
            </div>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
              <tr>
                <td>
                  <a href="mailto:${email}?subject=Re: ${subject}" style="display:inline-block;background-color:#7c3aed;color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;text-decoration:none;padding:12px 28px;">
                    ${c.reply(name)}
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#0f172a;padding:20px 40px;">
            <p style="margin:0;font-size:12px;color:#475569;">${c.footer}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}
