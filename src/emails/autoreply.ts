const LOGO_URL = 'https://rodrigorey.info/projects/icons/rr-transparent.png';

const copy = {
  en: {
    title: 'Message received',
    role: 'Web &amp; Software Developer',
    greeting: (name: string) => `Hey ${name},`,
    intro: "Thanks for reaching out! I've received your message and will get back to you as soon as possible. I typically respond within 24–48 hours.",
    about: 'Your message was about',
    closing: 'In the meantime, feel free to check out my work or connect with me online.',
    portfolio: 'Portfolio',
    talkSoon: 'Talk soon,',
    footer: (url: string) => `You received this because you contacted me at <a href="${url}" style="color:#7c3aed;text-decoration:none;">rodrigorey.info</a>`,
  },
  es: {
    title: 'Mensaje recibido',
    role: 'Desarrollador Web &amp; Software',
    greeting: (name: string) => `Hey ${name},`,
    intro: '¡Gracias por escribirme! Recibí tu mensaje y te responderé a la brevedad. Normalmente respondo en 24–48 horas.',
    about: 'Tu mensaje fue sobre',
    closing: 'Mientras tanto, podés ver mi trabajo o conectarte conmigo online.',
    portfolio: 'Portfolio',
    talkSoon: 'Hasta pronto,',
    footer: (url: string) => `Recibiste esto porque me contactaste en <a href="${url}" style="color:#7c3aed;text-decoration:none;">rodrigorey.info</a>`,
  },
};

export function autoReplyEmail({
  name,
  subject,
  lang = 'en',
}: {
  name: string;
  subject: string;
  lang?: 'en' | 'es';
}) {
  const c = copy[lang ?? 'en'];
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${c.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background-color:#0f172a;padding:36px 40px;border-bottom:3px solid #7c3aed;text-align:center;">
            <img src="${LOGO_URL}" alt="RR" width="52" height="52" style="display:block;margin:0 auto 16px auto;"/>
            <p style="margin:0 0 4px 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">Rodrigo Rey</p>
            <p style="margin:0;font-size:12px;color:#64748b;letter-spacing:1px;text-transform:uppercase;">${c.role}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background-color:#ffffff;padding:40px;">

            <p style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#0f172a;">${c.greeting(name)}</p>
            <p style="margin:0 0 32px 0;font-size:15px;color:#475569;line-height:1.7;">${c.intro}</p>

            <!-- Summary box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;background-color:#f8fafc;border-left:3px solid #7c3aed;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 6px 0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${c.about}</p>
                  <p style="margin:0;font-size:16px;color:#1e293b;font-weight:600;">${subject}</p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 28px 0;font-size:15px;color:#475569;line-height:1.7;">${c.closing}</p>

            <!-- Links -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
              <tr>
                <td style="padding-right:10px;">
                  <a href="https://rodrigorey.info" style="display:inline-block;background-color:#0f172a;color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;text-decoration:none;padding:10px 20px;">${c.portfolio}</a>
                </td>
                <td style="padding-right:10px;">
                  <a href="https://github.com/RodReBer" style="display:inline-block;background-color:#ffffff;color:#0f172a;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;text-decoration:none;padding:10px 20px;border:1px solid #e2e8f0;">GitHub</a>
                </td>
                <td>
                  <a href="https://www.linkedin.com/in/rodrigo-rey-bereijo/" style="display:inline-block;background-color:#ffffff;color:#0f172a;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;text-decoration:none;padding:10px 20px;border:1px solid #e2e8f0;">LinkedIn</a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 4px 0;font-size:14px;color:#64748b;">${c.talkSoon}</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:#0f172a;">Rodrigo Rey</p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#0f172a;padding:20px 40px;">
            <p style="margin:0;font-size:12px;color:#475569;">${c.footer('https://rodrigorey.info')}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}
