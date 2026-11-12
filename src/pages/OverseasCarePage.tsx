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
    <section className="py-10 border-t"><div className="container mx-auto px-4 md:px-6 max-w-6xl text-sm text-gray-500 leading-7"><strong className="text-gray-700">使用说明：</strong>本页面仅提供一般医学教育和就医信息，不构成医患关系、诊断、处方或个体化治疗建议。不同国家和地区的远程医疗执业规定不同。急症请及时就近就医。网站不代表任何医疗机构官方预约、收费或医疗广告渠道。</div></section>
  </div>;
}
