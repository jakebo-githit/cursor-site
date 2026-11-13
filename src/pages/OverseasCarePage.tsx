import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Languages, Clock3, FileQuestion, Plane, ShieldCheck, BookOpen, Stethoscope, ArrowRight } from 'lucide-react';

const concerns = [
  { icon: Languages, title: '语言沟通困难', detail: '医生说的医学术语听不懂，担心自己没有理解治疗建议。' },
  { icon: Clock3, title: '专科候诊漫长', detail: '检查、转诊或择期治疗需要等待，不知道下一步怎么安排。' },
  { icon: FileQuestion, title: '治疗选择复杂', detail: '面对检查报告和多种治疗方案，希望知道该向医生问什么。' },
  { icon: Plane, title: '考虑来华就医', detail: '不清楚就诊材料、费用、行程与返程后的医疗衔接。' },
];
const topics = [
  { name: '胆囊结石', detail: '什么时候需要治疗？哪些情况可以观察？' },
  { name: '胆总管结石', detail: '认识ERCP、胆道镜和手术的不同适用场景。' },
  { name: '复杂肝内胆管结石', detail: '理解复发、胆管狭窄与长期随访。' },
  { name: '胆道镜与无射线相关技术', detail: '技术原理、适应证、证据及限制。' },
];
export default function OverseasCarePage() {
  const { i18n } = useTranslation();
  const english = i18n.language === 'en';
  return <div className="bg-white text-gray-800">
    <section className="bg-primary-800 text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <p className="uppercase tracking-widest text-secondary-200 text-sm mb-5">{english ? 'AskDrLiu · Overseas Health Guide' : 'AskDrLiu · 海外华人健康指南'}</p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight max-w-4xl">身在海外，看病遇到困难，<span className="text-secondary-200">你该怎么办？</span></h1>
        <p className="max-w-3xl text-lg md:text-xl text-gray-200 mt-8 leading-relaxed">语言不通、等待时间长、医疗信息难以理解。这里用清晰的中文，帮助你认识疾病、理解医疗选择，并了解合法的第二医疗意见和来华就医路径。</p>
        <div className="mt-8 flex flex-wrap gap-3"><a href="#difficulties" className="rounded-md bg-secondary text-white font-medium hover:bg-secondary-600 px-6 py-3">先了解常见困境</a><a href="#opinions" className="rounded-md border border-white/50 text-white px-6 py-3">第二医疗意见是什么？</a></div>
        <a href="#how-to-start" className="inline-flex mt-4 rounded-md bg-white text-primary-900 font-semibold px-6 py-3 hover:bg-primary-50">了解服务、费用与联系方式 →</a>
        <p className="mt-8 text-sm text-gray-300">医学教育信息，不替代当地医生诊疗。遇到急症，请立即联系所在地急救服务。</p>
      </div>
    </section>
    <section id="difficulties" className="py-12 md:py-16 container mx-auto px-4 md:px-6 max-w-6xl">
      <p className="text-secondary-600 font-semibold">从真实问题开始</p><h2 className="text-2xl md:text-3xl font-serif font-semibold mt-2 mb-8">海外华人常见的四种就医困境</h2>
      <div className="grid md:grid-cols-2 gap-5">{concerns.map(c => <div key={c.title} className="rounded-lg border border-gray-200 p-7 bg-gray-50"><c.icon className="text-secondary-600 mb-4" size={30}/><h3 className="text-xl font-serif font-semibold mb-2">{c.title}</h3><p className="text-gray-600 leading-7">{c.detail}</p></div>)}</div>
    </section>
    <section id="opinions" className="py-12 md:py-16 bg-primary-50"><div className="container mx-auto px-4 md:px-6 max-w-6xl grid lg:grid-cols-2 gap-12">
      <div><p className="text-secondary-600 font-semibold">第二医疗意见 · Medical Second Opinion</p><h2 className="text-2xl md:text-3xl font-serif font-semibold mt-3">理解更多，决定更从容</h2><p className="mt-6 text-gray-700 leading-8">第二医疗意见，是在已有诊疗基础上，由另一位具备适当执业资质的医生对病情和治疗选择作独立评估。它可能帮助患者向当地医生提出更具体的问题，但不保证得到不同的结论。</p><p className="mt-4 text-gray-700 leading-8">AskDrLiu现阶段提供公开医学知识与就医流程教育。针对个人影像、病历进行诊断或提出个体化治疗意见，应当通过符合患者所在地和医疗机构要求的合法渠道进行。</p></div>
      <div className="bg-white rounded-lg shadow-soft p-8"><ShieldCheck size={32} className="text-secondary-600 mb-5"/><h3 className="font-bold text-xl mb-5">正式第二意见服务：筹备中</h3><p className="text-gray-600 leading-7">本网站当前不接受线上付费诊断，不收集医学影像或病历，不承诺远程诊疗，也不代理医院收取医疗费用。</p><div className="border-t mt-6 pt-6 text-sm text-gray-500">目前可先阅读本站专业科普、整理问题，并向所在地有资质的医生咨询。正式服务上线需另行完成合规审核。</div></div>
    </div></section>
    <section className="py-12 md:py-16 container mx-auto px-4 md:px-6 max-w-6xl"><p className="text-secondary-600 font-semibold">刘医生的专业领域</p><h2 className="text-2xl md:text-3xl font-serif font-semibold mt-2 mb-8">聚焦胆结石与复杂胆道疾病</h2><div className="grid md:grid-cols-2 gap-5">{topics.map(t=><article key={t.name} className="border border-gray-200 rounded-xl p-6"><Stethoscope size={25} className="text-secondary-600 mb-3"/><h3 className="font-bold text-xl">{t.name}</h3><p className="text-gray-600 mt-3">{t.detail}</p></article>)}</div><p className="mt-6 text-sm text-gray-500">治疗方式须根据病情、检查结果和临床指南选择；不以器械来源、技术名称或无射线操作保证疗效。</p></section>
    <section className="py-12 md:py-16 bg-gray-50"><div className="container mx-auto px-4 md:px-6 max-w-6xl grid lg:grid-cols-2 gap-12"><div><p className="text-secondary-600 font-semibold">来华就医指南</p><h2 className="text-2xl md:text-3xl font-serif font-semibold mt-2">如果考虑回中国治疗</h2><p className="text-gray-700 mt-5 leading-8">建议先与所在地医生确认旅行安全性，并了解自己的医保是否覆盖跨境治疗。来华就诊通常需要准备既往病历、检查报告、影像资料、药物清单以及回程后的复诊安排。</p><p className="text-gray-700 mt-4 leading-8">医院接诊、住院、手术安排和医疗收费均由相应医疗机构按正式规定办理。本个人网站不承诺床位、手术时间或治疗结果。</p></div><div className="bg-white border rounded-lg p-8"><Plane className="text-secondary-600 mb-4" size={32}/><h3 className="text-xl font-serif font-semibold mb-4">出发前检查清单</h3><ol className="list-decimal pl-5 space-y-3 text-gray-700"><li>确认本地诊断和治疗选择</li><li>请当地医生评估是否适合旅行</li><li>提前联系医院官方渠道核实接诊及费用</li><li>准备中英文病历与药物清单</li><li>安排术后随访及返程计划</li></ol></div></div></section>
    <section className="py-12 md:py-16 container mx-auto px-4 md:px-6 max-w-6xl"><div className="rounded-lg bg-primary-900 text-white p-8 md:p-12"><BookOpen className="text-secondary-200 mb-5" size={30}/><h2 className="text-2xl md:text-3xl font-serif font-semibold">关于刘医生</h2><p className="text-gray-200 leading-8 mt-5 max-w-3xl">刘波医生长期从事肝胆外科临床工作，曾在德国接受专业培训，并在美国耶鲁大学开展医学研究。AskDrLiu希望把复杂的医学知识用更容易理解的中文讲清楚，帮助海外华人做出知情的健康决定。</p><Link to="/about" className="inline-flex items-center gap-2 mt-7 text-secondary-200 font-semibold">了解专业经历 <ArrowRight size={18}/></Link></div></section>

    <section id="how-to-start" className="py-12 md:py-16 bg-primary-50 border-y border-primary-100">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <p className="text-secondary-600 font-semibold">如何获得帮助 / How to get started</p>
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-primary-900 mt-2">知道下一步该怎么做</h2>
        <p className="mt-4 text-gray-700 max-w-3xl leading-8">根据需要选择知识阅读、一般就医流程导航，或了解由合规医疗机构提供的正式第二医疗意见。各类服务的性质与收费主体不同，请先确认后再作决定。</p>
        <div className="grid lg:grid-cols-3 gap-5 mt-8">
          <article className="rounded-lg bg-white border border-primary-100 p-6 shadow-soft">
            <p className="text-secondary-600 text-sm font-semibold">01 · 免费</p>
            <h3 className="text-xl font-serif font-semibold text-primary-900 mt-2">医学科普与来华就医指南</h3>
            <p className="mt-3 text-gray-600 leading-7">了解胆结石、胆总管结石、ERCP、POCS，以及预约、费用和出行前准备的通用知识。</p>
            <p className="font-semibold mt-5 text-primary-800">费用：¥0</p>
            <a href="#difficulties" className="inline-block mt-4 text-secondary-600 font-medium underline">阅读指南 →</a>
          </article>
          <article className="rounded-lg bg-white border border-primary-100 p-6 shadow-soft">
            <p className="text-secondary-600 text-sm font-semibold">02 · 服务方案验证中</p>
            <h3 className="text-xl font-serif font-semibold text-primary-900 mt-2">海外就医信息导航</h3>
            <p className="mt-3 text-gray-600 leading-7">拟包括医疗制度与预约流程说明、通用医疗术语教育、来华就医准备清单。不包括个人诊断、报告判读或治疗方案制定。</p>
            <p className="font-semibold mt-5 text-primary-800">费用：尚未定价 / 暂未开通</p>
            <p className="text-xs text-gray-500 mt-2">服务范围、收费主体、价格、付款及退款规则确认后，才能正式开放。</p>
            <a href="#contact-overseas" className="inline-block mt-4 text-secondary-600 font-medium underline">先了解咨询方式 →</a>
          </article>
          <article className="rounded-lg bg-white border border-primary-100 p-6 shadow-soft">
            <p className="text-secondary-600 text-sm font-semibold">03 · 正式医疗服务</p>
            <h3 className="text-xl font-serif font-semibold text-primary-900 mt-2">第二医疗意见</h3>
            <p className="mt-3 text-gray-600 leading-7">如果需要医生针对个人病历、影像或治疗方案作医学判断，须由具备相应资质并符合所在地法规的医疗机构受理。</p>
            <p className="font-semibold mt-5 text-primary-800">费用：由受理医疗机构正式报价</p>
            <p className="text-xs text-gray-500 mt-2">个人网站当前不接受付费远程诊疗、医疗资料上传及医疗服务收款。</p>
            <a href="#contact-overseas" className="inline-block mt-4 text-secondary-600 font-medium underline">了解申请前的准备 →</a>
          </article>
        </div>
      </div>
    </section>

    <section id="doctor-platforms" className="py-12 md:py-16 bg-white border-y border-gray-200">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <p className="text-secondary-600 font-semibold">医生身份与公开信息</p>
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-primary-900 mt-2">在这些平台核对刘医生的公开资料</h2>
        <p className="mt-4 text-gray-700 leading-8 max-w-3xl">刘医生确认，在小荷健康、好大夫在线与百度健康均设有本人医生账号。为了方便核对信息，您可以通过平台站内搜索医生姓名及机构。不同平台的服务范围和适用地区各不相同。</p>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          <article className="rounded-lg bg-gray-50 border border-gray-200 p-6">
            <h3 className="text-xl font-serif font-semibold text-primary-900">小荷健康 / 抖音</h3>
            <p className="text-gray-700 mt-3 leading-7">在平台内搜索“微创取石刘波主任”并核对医生认证信息。</p>
            <a href="https://www.douyin.com/" target="_blank" rel="noopener noreferrer" className="inline-flex mt-4 text-secondary-600 font-medium underline">打开抖音，在应用中搜索医生 ↗</a><a href="https://www.xiaohe.cn/home/studio" target="_blank" rel="noopener noreferrer" className="block mt-3 text-secondary-600 font-medium underline">了解小荷健康医生工作室 ↗</a><p className="text-sm text-gray-500 mt-3">以上是官方平台链接，并非刘医生个人主页直达链接。进入抖音后搜索“微创取石刘波主任”，核对认证资料，再从医生主页进入小荷健康（如该入口已开放）。</p>
          </article>
          <article className="rounded-lg bg-gray-50 border border-gray-200 p-6">
            <h3 className="text-xl font-serif font-semibold text-primary-900">好大夫在线</h3>
            <p className="text-gray-700 mt-3 leading-7">可在该平台核对“刘波｜中山大学附属第三医院”的医生认证和公开资料。具体咨询类别、价格与可否面向所在国家的患者提供服务，以平台和当地适用法规为准。</p>
            <a href="https://www.haodf.com/doctor/242059.html" target="_blank" rel="noopener noreferrer" className="inline-flex mt-4 text-secondary-600 font-medium underline">查看医生公开资料 ↗</a>
          </article>
          <article className="rounded-lg bg-gray-50 border border-gray-200 p-6">
            <h3 className="text-xl font-serif font-semibold text-primary-900">百度健康</h3>
            <p className="text-gray-700 mt-3 leading-7">搜索“刘波主任 胆结石 中山三院”，注意核对身份与执业机构。</p>
            <a href="https://health.baidu.com/m/detail/sv_3229457928399422351" target="_blank" rel="noopener noreferrer" className="inline-flex mt-4 text-secondary-600 font-medium underline">查看刘医生发布的百度健康科普内容 ↗</a><p className="text-sm text-gray-500 mt-3">已核实作者署名为“微创取石刘波主任”。这是科普内容链接，并非个人问诊或支付入口。</p>
          </article>
        </div>
        <p className="mt-6 text-sm text-gray-600">此处仅作为身份核对与公开资料导航，不代表已获准在海外开展远程诊疗。是否存在具体咨询项目、费用和付款方式，请以平台当时公示及当地适用法规为准。</p>
      </div>
    </section>

    <section id="contact-overseas" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl grid lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-primary-900">如何联系 AskDrLiu？</h2>
          <p className="text-gray-700 leading-8 mt-4">目前先通过网站已公布的电子邮箱，了解通用健康教育和就医流程信息。请说明所在国家和希望了解的服务类型，我们会根据实际开通的服务范围确认能否提供帮助。</p>
          <p className="text-primary-900 text-lg font-semibold mt-6">askdrliu@askdrliu.com</p>
          <a href="mailto:askdrliu@askdrliu.com?subject=AskDrLiu%EF%BD%9C%E6%B5%B7%E5%A4%96%E5%8D%8E%E4%BA%BA%E5%B0%B1%E5%8C%BB%E4%BF%A1%E6%81%AF%E5%92%A8%E8%AF%A2&body=%E6%82%A8%E5%A5%BD%EF%BC%8C%E6%88%91%E5%B8%8C%E6%9C%9B%E4%BA%86%E8%A7%A3%E6%B5%B7%E5%A4%96%E5%8D%8E%E4%BA%BA%E5%81%A5%E5%BA%B7%E4%BF%A1%E6%81%AF%E6%9C%8D%E5%8A%A1%E3%80%82%0A%E6%89%80%E5%9C%A8%E5%9B%BD%E5%AE%B6%2F%E5%9C%B0%E5%8C%BA%EF%BC%9A%0A%E9%9C%80%E8%A6%81%E4%BA%86%E8%A7%A3%E7%9A%84%E6%9C%8D%E5%8A%A1%EF%BC%9A%E5%B0%B1%E5%8C%BB%E6%B5%81%E7%A8%8B%20%2F%20%E5%8C%BB%E5%AD%A6%E6%9C%AF%E8%AF%AD%E6%95%99%E8%82%B2%20%2F%20%E6%9D%A5%E5%8D%8E%E5%B0%B1%E5%8C%BB%E5%87%86%E5%A4%87%0A%E6%96%B9%E4%BE%BF%E8%81%94%E7%B3%BB%E7%9A%84%E6%96%B9%E5%BC%8F%EF%BC%9A%0A%0A%E8%AF%B7%E5%8B%BF%E9%80%9A%E8%BF%87%E6%99%AE%E9%80%9A%E7%94%B5%E5%AD%90%E9%82%AE%E4%BB%B6%E5%8F%91%E9%80%81%E7%97%85%E5%8E%86%E3%80%81%E6%A3%80%E6%9F%A5%E5%BD%B1%E5%83%8F%E3%80%81%E8%BA%AB%E4%BB%BD%E8%AF%81%E6%98%8E%E6%88%96%E6%95%8F%E6%84%9F%E5%8C%BB%E7%96%97%E4%BF%A1%E6%81%AF%E3%80%82" className="inline-flex mt-4 items-center justify-center px-6 py-3 rounded-md bg-secondary text-white font-medium hover:bg-secondary-600">发送咨询邮件 →</a>
          <p className="text-sm text-gray-500 mt-4">邮箱地址来自本站现有联系页面；尚未验证回复时效，不保证即时回复。</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-7 border border-gray-200">
          <h3 className="text-xl font-serif font-semibold text-primary-900">联系时只需提供三项信息</h3>
          <ol className="list-decimal pl-5 text-gray-700 mt-5 space-y-3 leading-7">
            <li>你所在的国家或地区</li>
            <li>希望了解的类别：语言沟通、候诊流程、就医指南或正规第二意见申请路径</li>
            <li>方便联系的电子邮箱</li>
          </ol>
          <p className="mt-6 text-sm text-primary-800 border-l-4 border-secondary pl-4">请不要通过普通邮件或公开表单发送检查报告、影像、详细病史、身份证件或支付信息。正式医疗资料应使用受理医疗机构批准的安全渠道。</p>
          <p className="mt-4 text-sm text-gray-600">目前无网站在线付款，也不承诺预约、接诊或诊疗结果。正式服务开启后将公示服务条款、收费主体和退款规则。</p>
        </div>
      </div>
    </section>

    <section className="py-10 border-t"><div className="container mx-auto px-4 md:px-6 max-w-6xl text-sm text-gray-500 leading-7"><strong className="text-gray-700">使用说明：</strong>本页面仅提供一般医学教育和就医信息，不构成医患关系、诊断、处方或个体化治疗建议。不同国家和地区的远程医疗执业规定不同。急症请及时就近就医。网站不代表任何医疗机构官方预约、收费或医疗广告渠道。</div></section>
  </div>;
}
