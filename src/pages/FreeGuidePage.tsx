import { FormEvent, useMemo, useState } from 'react';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

function FreeGuidePage() {
  const [email, setEmail] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');

  const source = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'direct';
    }

    const params = new URLSearchParams(window.location.search);
    return params.get('utm_source') || 'direct';
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState('loading');
    setMessage('');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source,
          page: '/free-guide',
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || '提交失败，请稍后重试。');
      }

      setSubmitState('success');
      setMessage('已发送，请到邮箱查收《胆囊切除术后营养注意要点》。');
      setEmail('');
    } catch (error) {
      setSubmitState('error');
      setMessage(error instanceof Error ? error.message : '系统繁忙，请稍后重试。');
    }
  };

  return (
    <>
      <div className="pt-24 pb-12 bg-primary-800 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-center">
            免费指南
          </h1>
          <p className="text-xl text-gray-200 text-center mt-4 max-w-3xl mx-auto">
            领取《胆囊切除术后营养注意要点》PDF
          </p>
        </div>
      </div>

      <section className="bg-gradient-to-br from-primary-50 via-white to-blue-50 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-primary-200 bg-white p-6 shadow-soft md:p-8">
              <p className="mb-3 inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
                免费领取
              </p>
              <h2 className="mb-4 text-3xl font-bold text-primary-900 md:text-4xl">
                《胆囊切除术后营养注意要点》
              </h2>
              <p className="mb-6 text-base leading-relaxed text-gray-700">
                留下邮箱，系统会自动发送 PDF。内容包括术后饮食阶段、常见误区、复查提醒和恢复建议，帮助你更稳妥地恢复。
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="rounded-lg bg-gray-50 p-3">1. 术后 1-7 天饮食安排</li>
                <li className="rounded-lg bg-gray-50 p-3">2. 术后 1-3 个月过渡建议</li>
                <li className="rounded-lg bg-gray-50 p-3">3. 腹胀、腹泻等不适处理思路</li>
                <li className="rounded-lg bg-gray-50 p-3">4. 复查与复诊时间建议</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-primary-200 bg-white p-6 shadow-soft md:p-8">
              <h2 className="mb-2 text-2xl font-semibold text-primary-900">填写邮箱立即获取</h2>
              <p className="mb-6 text-sm text-gray-600">提交后 1 分钟内发送，请留意垃圾邮件箱。</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-gray-800" htmlFor="lead-email">
                  邮箱地址
                </label>
                <input
                  id="lead-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />

                <button
                  type="submit"
                  disabled={submitState === 'loading'}
                  className="w-full rounded-lg bg-primary-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitState === 'loading' ? '发送中...' : '免费获取 PDF'}
                </button>
              </form>

              {message && (
                <p
                  className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                    submitState === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default FreeGuidePage;
