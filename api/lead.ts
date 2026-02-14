const RESEND_API_BASE = 'https://api.resend.com';
const DEFAULT_GUIDE_PATH = '/guides/post-cholecystectomy-nutrition-guide.pdf';

type LeadPayload = {
  email?: string;
  source?: string;
  page?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getOrigin(req: any): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const host = req.headers.host;

  if (forwardedProto && host) {
    return `${forwardedProto}://${host}`;
  }

  return 'https://askdrliu.com';
}

async function resendRequest(path: string, payload: Record<string, unknown>, apiKey: string) {
  const response = await fetch(`${RESEND_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { response, data };
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, source, page } = (req.body || {}) as LeadPayload;
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    res.status(400).json({ error: '请输入有效邮箱地址。' });
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendAudienceId = process.env.RESEND_AUDIENCE_ID;
  const fromEmail = process.env.FROM_EMAIL || 'askdrliu@askdrliu.com';
  const notifyEmail = process.env.NOTIFY_EMAIL || 'askdrliu@askdrliu.com';

  if (!resendApiKey || !resendAudienceId) {
    res.status(500).json({
      error: '服务暂未配置完成，请稍后重试。',
    });
    return;
  }

  const origin = getOrigin(req);
  const guideUrl = process.env.FREE_GUIDE_URL || `${origin}${DEFAULT_GUIDE_PATH}`;

  try {
    const contactResult = await resendRequest(
      `/audiences/${resendAudienceId}/contacts`,
      {
        email: normalizedEmail,
        unsubscribed: false,
      },
      resendApiKey
    );

    const contactExists =
      contactResult.response.status === 409 ||
      (contactResult.data?.message && String(contactResult.data.message).includes('already exists'));

    if (!contactResult.response.ok && !contactExists) {
      throw new Error(contactResult.data?.message || 'Failed to add contact');
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.7;">
        <h2 style="margin: 0 0 12px;">《胆囊切除术后营养注意要点》已为您准备好</h2>
        <p>您好，感谢领取资料。</p>
        <p>
          点击下方链接下载 PDF：
          <br />
          <a href="${guideUrl}" target="_blank" rel="noopener noreferrer">${guideUrl}</a>
        </p>
        <p>祝您恢复顺利。</p>
        <p style="margin-top: 24px;">刘波医生团队</p>
      </div>
    `;

    const sendResult = await resendRequest(
      '/emails',
      {
        from: fromEmail,
        to: [normalizedEmail],
        subject: '您的免费资料：《胆囊切除术后营养注意要点》',
        html: emailHtml,
      },
      resendApiKey
    );

    if (!sendResult.response.ok) {
      throw new Error(sendResult.data?.message || 'Failed to send email');
    }

    // Internal notification so you have a real-time lead inbox as backup.
    await resendRequest(
      '/emails',
      {
        from: fromEmail,
        to: [notifyEmail],
        subject: `新线索: ${normalizedEmail}`,
        html: `
          <p>新用户提交了免费资料表单：</p>
          <ul>
            <li>Email: ${normalizedEmail}</li>
            <li>Source: ${source || 'direct'}</li>
            <li>Page: ${page || '/free-guide'}</li>
            <li>Time: ${new Date().toISOString()}</li>
          </ul>
        `,
      },
      resendApiKey
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('lead handler failed', error);
    res.status(500).json({ error: '提交成功前发生错误，请稍后重试。' });
  }
}
