import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Droplet } from 'lucide-react';
import { Link } from 'react-router-dom';

const GallstonePrevention = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link 
        to="/articles" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = '/articles';
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('common.back_to_articles')}
      </Link>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="relative h-80 overflow-hidden">
          <img
            src="/images/gallstone-prevention.jpg"
            alt={t('articles.gallstone_prevention.title')}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium flex items-center">
            <Droplet className="w-4 h-4 mr-1" />
            {t('categories.gallstone_prevention')}
          </div>
        </div>
        
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentLanguage === 'en' ? 'Causes of Gallstone Formation and Preventive Measures' : '胆结石形成的原因及预防措施'}
          </h1>
          <p className="text-gray-600 mb-4">
            {t('common.published_date', { date: '2025-03-15' })}
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-md">
            {currentLanguage === 'en' ? (
              <p className="font-medium text-lg text-gray-800">
                Gallstones are a common digestive system disease related to cholesterol metabolism, bile stagnation, and infection. Understanding the formation mechanisms and implementing effective prevention methods can significantly reduce your risk.
              </p>
            ) : (
              <p className="font-medium text-lg text-gray-800">
                胆结石是常见的消化系统疾病，其形成与胆固醇代谢异常、胆汁淤滞和感染等因素密切相关。了解其形成机制并采取有效的预防措施，可以显著降低患病风险。
              </p>
            )}
          </div>
          
          <div className="prose prose-lg max-w-none mt-8">
            {currentLanguage === 'en' ? (
              <>
                <h2 className="text-2xl font-serif font-semibold text-primary-900 mt-8 mb-4">
                  What Are Gallstones?
                </h2>
                <p className="mb-4">
                  Gallstones are solid particles that form in the gallbladder from bile components. The two main types are:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2"><strong>Cholesterol stones</strong> - Accounting for about 80% of cases, these form when there's too much cholesterol in bile.</li>
                  <li className="mb-2"><strong>Pigment stones</strong> - These develop when bile contains too much bilirubin, often due to liver conditions or blood disorders.</li>
                </ul>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-blue-800 font-medium">Did you know? Up to 20% of adults develop gallstones by age 65, but many never experience symptoms.</p>
                </div>
                
                <h2 className="text-2xl font-serif font-semibold text-primary-900 mt-8 mb-4">
                  Risk Factors for Gallstone Formation
                </h2>
                <p className="mb-4">
                  Several factors can increase your likelihood of developing gallstones:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2"><strong>Female gender</strong> - Women are twice as likely to develop gallstones</li>
                  <li className="mb-2"><strong>Age</strong> - Risk increases after age 40</li>
                  <li className="mb-2"><strong>Obesity</strong> - Excess weight increases cholesterol production</li>
                  <li className="mb-2"><strong>Rapid weight loss</strong> - Can cause the liver to secrete extra cholesterol</li>
                  <li className="mb-2"><strong>Diet high in fat and cholesterol</strong> - Contributes to bile imbalance</li>
                  <li className="mb-2"><strong>Family history</strong> - Genetic factors can play a role</li>
                  <li className="mb-2"><strong>Certain medications</strong> - Including some cholesterol-lowering drugs</li>
                </ul>
                
                <h2 className="text-2xl font-serif font-semibold text-primary-900 mt-8 mb-4">
                  Preventive Measures
                </h2>
                
                <h3 className="text-xl font-medium text-primary-800 mt-6 mb-3">
                  1. Dietary Adjustments
                </h3>
                <p className="mb-4">
                  Modifying your diet is one of the most effective ways to prevent gallstones:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2">Reduce saturated fat intake from red meat, dairy products, and fried foods</li>
                  <li className="mb-2">Increase fiber consumption through whole grains, fruits, and vegetables</li>
                  <li className="mb-2">Incorporate healthy fats like olive oil and fatty fish (omega-3s)</li>
                  <li className="mb-2">Reduce refined carbohydrates and sugar</li>
                  <li className="mb-2">Moderate alcohol consumption</li>
                </ul>
                
                <h3 className="text-xl font-medium text-primary-800 mt-6 mb-3">
                  2. Maintain a Healthy Weight
                </h3>
                <p className="mb-4">
                  Obesity is a significant risk factor for gallstones. However, rapid weight loss can also trigger their formation. The key recommendations are:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2">Aim for gradual, sustainable weight loss (no more than 1-2 pounds per week)</li>
                  <li className="mb-2">Avoid crash diets or extended fasting</li>
                  <li className="mb-2">Combine diet modifications with regular exercise</li>
                </ul>
                
                <h3 className="text-xl font-medium text-primary-800 mt-6 mb-3">
                  3. Regular Physical Activity
                </h3>
                <p className="mb-4">
                  Exercise helps prevent gallstones by:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2">Improving cholesterol levels</li>
                  <li className="mb-2">Aiding weight management</li>
                  <li className="mb-2">Enhancing gallbladder function and bile flow</li>
                  <li className="mb-2">Reducing inflammation throughout the body</li>
                </ul>
                <p className="mb-4">
                  Aim for at least 150 minutes of moderate-intensity activity per week.
                </p>
                
                <h2 className="text-2xl font-serif font-semibold text-primary-900 mt-8 mb-4">
                  When to Seek Medical Attention
                </h2>
                <p className="mb-4">
                  If you experience any of these symptoms, consult with a healthcare provider promptly:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2">Sudden, intense pain in the upper right abdomen</li>
                  <li className="mb-2">Pain radiating to your back or right shoulder</li>
                  <li className="mb-2">Nausea or vomiting</li>
                  <li className="mb-2">Fever or chills</li>
                  <li className="mb-2">Yellowing of skin or eyes (jaundice)</li>
                </ul>
                
                <p className="bg-primary-50 p-4 rounded-lg border-l-4 border-primary-600 mt-8">
                  <strong>Early detection matters:</strong> Regular health check-ups can identify gallstones before they cause complications. If you have risk factors, discuss preventive strategies with your doctor.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-serif font-semibold text-primary-900 mt-8 mb-4">
                  什么是胆结石？
                </h2>
                <p className="mb-4">
                  胆结石是在胆囊中由胆汁成分形成的固体颗粒。主要分为两种类型：
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2"><strong>胆固醇结石</strong> - 约占80%的病例，当胆汁中胆固醇过多时形成。</li>
                  <li className="mb-2"><strong>色素结石</strong> - 当胆汁中胆红素过多时形成，通常与肝脏疾病或血液疾病有关。</li>
                </ul>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-blue-800 font-medium">您知道吗？高达20%的成年人在65岁前会形成胆结石，但许多人终身不会出现症状。</p>
                </div>
                
                <h2 className="text-2xl font-serif font-semibold text-primary-900 mt-8 mb-4">
                  胆结石形成的风险因素
                </h2>
                <p className="mb-4">
                  以下因素会增加您形成胆结石的可能性：
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2"><strong>女性</strong> - 女性患胆结石的几率是男性的两倍</li>
                  <li className="mb-2"><strong>年龄</strong> - 40岁后风险增加</li>
                  <li className="mb-2"><strong>肥胖</strong> - 超重会增加胆固醇的产生</li>
                  <li className="mb-2"><strong>快速减重</strong> - 可能导致肝脏分泌过多胆固醇</li>
                  <li className="mb-2"><strong>高脂高胆固醇饮食</strong> - 导致胆汁成分失衡</li>
                  <li className="mb-2"><strong>家族史</strong> - 遗传因素可能起作用</li>
                  <li className="mb-2"><strong>某些药物</strong> - 包括一些降胆固醇药物</li>
                </ul>
                
                <h2 className="text-2xl font-serif font-semibold text-primary-900 mt-8 mb-4">
                  预防措施
                </h2>
                
                <h3 className="text-xl font-medium text-primary-800 mt-6 mb-3">
                  1. 饮食调整
                </h3>
                <p className="mb-4">
                  调整饮食是预防胆结石最有效的方法之一：
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2">减少来自红肉、乳制品和油炸食品的饱和脂肪摄入</li>
                  <li className="mb-2">通过全谷物、水果和蔬菜增加纤维摄入</li>
                  <li className="mb-2">摄入健康脂肪，如橄榄油和富含ω-3脂肪酸的鱼类</li>
                  <li className="mb-2">减少精制碳水化合物和糖的摄入</li>
                  <li className="mb-2">适量饮酒</li>
                </ul>
                
                <h3 className="text-xl font-medium text-primary-800 mt-6 mb-3">
                  2. 保持健康体重
                </h3>
                <p className="mb-4">
                  肥胖是胆结石的重要风险因素。然而，快速减重也可能触发结石形成。关键建议是：
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2">追求渐进、可持续的减重（每周不超过0.5-1公斤）</li>
                  <li className="mb-2">避免极端节食或长时间禁食</li>
                  <li className="mb-2">将饮食调整与规律运动相结合</li>
                </ul>
                
                <h3 className="text-xl font-medium text-primary-800 mt-6 mb-3">
                  3. 定期身体活动
                </h3>
                <p className="mb-4">
                  运动有助于预防胆结石的原因：
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2">改善胆固醇水平</li>
                  <li className="mb-2">帮助体重管理</li>
                  <li className="mb-2">增强胆囊功能和胆汁流动</li>
                  <li className="mb-2">减少全身炎症</li>
                </ul>
                <p className="mb-4">
                  建议每周进行至少150分钟的中等强度活动。
                </p>
                
                <h2 className="text-2xl font-serif font-semibold text-primary-900 mt-8 mb-4">
                  何时寻求医疗帮助
                </h2>
                <p className="mb-4">
                  如果您出现以下任何症状，请立即咨询医疗专业人员：
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li className="mb-2">上腹部右侧突然剧烈疼痛</li>
                  <li className="mb-2">向背部或右肩放射的疼痛</li>
                  <li className="mb-2">恶心或呕吐</li>
                  <li className="mb-2">发热或寒战</li>
                  <li className="mb-2">皮肤或眼睛发黄（黄疸）</li>
                </ul>
                
                <p className="bg-primary-50 p-4 rounded-lg border-l-4 border-primary-600 mt-8">
                  <strong>早期发现很重要：</strong>定期体检可以在胆结石引起并发症前发现它们。如果您有风险因素，请与医生讨论预防策略。
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GallstonePrevention; 