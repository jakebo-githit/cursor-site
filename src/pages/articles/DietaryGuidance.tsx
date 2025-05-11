import React from 'react';
import { useTranslation } from 'react-i18next';
import { Utensils, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DietaryGuidance = () => {
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
            src="/images/dietary-guidance.jpg"
            alt={t('articles.dietary_guidance.title')}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium flex items-center">
            <Utensils className="w-4 h-4 mr-1" />
            {t('categories.dietary_guidance')}
          </div>
        </div>
        
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('articles.dietary_guidance.title')}
          </h1>
          
          <p className="text-gray-500 mb-8">
            {t('common.published_date', { date: '2025-02-22' })}
          </p>
          
          <div className="prose prose-lg max-w-none">
            {currentLanguage === 'zh' ? (
              <>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-8 rounded-r">
                  <p className="text-blue-800 text-lg">
                    胆囊结石经过POCS（经口胆道镜）手术治疗后，合理的饮食指导对患者康复至关重要。
                    手术后的饮食调整不仅能帮助伤口愈合，还能减轻消化系统负担，预防结石复发。
                    本文将为POCS手术患者提供全面的饮食指南，帮助患者尽快恢复健康。
                  </p>
                </div>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  手术后第一阶段（1-3天）：清淡流质饮食
                </h2>
                <p>
                  POCS手术后的头1-3天是恢复的关键期，此阶段建议：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>以温热流质食物为主，如米汤、蔬菜汤、清鸡汤等</li>
                  <li>少量多餐，每次进食量控制在100-150ml</li>
                  <li>避免冷饮和刺激性食物</li>
                  <li>保证充足的水分摄入，每日不少于1500ml</li>
                </ul>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  手术后第二阶段（4-7天）：软质饮食过渡期
                </h2>
                <p>
                  随着消化功能逐渐恢复，可以逐步过渡到软质饮食：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>可添加软烂的面条、粥、蒸蛋等易消化食物</li>
                  <li>适量添加蒸煮蔬菜，如胡萝卜、南瓜、西兰花等</li>
                  <li>少量优质蛋白质，如豆腐、鱼肉、瘦肉等</li>
                  <li>继续避免油炸、辛辣食物和高脂肪食品</li>
                </ul>
                
                <div className="my-8 flex justify-center">
                  <div className="bg-green-50 rounded-lg py-4 px-6 max-w-xl">
                    <h3 className="text-green-800 font-semibold mb-2">饮食小贴士</h3>
                    <p className="text-green-700">
                      食物温度应适中，不宜过冷或过热；进食速度要缓慢，细嚼慢咽有助于减轻消化系统负担。
                    </p>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  手术后第三阶段（1-4周）：均衡膳食建立期
                </h2>
                <p>
                  在术后1-4周，患者可以逐步建立规律的饮食习惯：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>增加膳食纤维摄入，如全谷物、新鲜蔬果</li>
                  <li>控制脂肪摄入，选择植物油，避免动物脂肪</li>
                  <li>优质蛋白质食物，如鱼、禽肉、豆制品等</li>
                  <li>少量多餐，定时定量</li>
                </ul>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  长期饮食指导与建议
                </h2>
                <p>
                  POCS手术后，为预防胆石复发，应长期保持科学饮食习惯：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>控制总热量，保持理想体重</li>
                  <li>限制高胆固醇食物摄入</li>
                  <li>增加水溶性膳食纤维摄入</li>
                  <li>规律三餐，避免暴饮暴食</li>
                  <li>多饮水，保持每日2000ml以上水分摄入</li>
                </ul>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  需要避免的食物
                </h2>
                <p>
                  以下食物可能增加胆汁分泌或刺激胆囊收缩，应当避免或限制：
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-bold text-red-700 mb-2">高脂肪食物</h4>
                    <p>油炸食品、肥肉、奶油、动物内脏等</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-bold text-orange-700 mb-2">刺激性食物</h4>
                    <p>辣椒、咖喱、酒精、浓咖啡等</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-700 mb-2">高胆固醇食物</h4>
                    <p>蛋黄（每周不超过3个）、动物脑等</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-700 mb-2">加工食品</h4>
                    <p>含防腐剂、添加剂的加工食品</p>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  推荐的营养补充
                </h2>
                <p>
                  某些营养素对POCS术后恢复特别有益：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>维生素C：</strong>促进伤口愈合，增强免疫力</li>
                  <li><strong>维生素D和钙：</strong>维持骨骼健康</li>
                  <li><strong>益生菌：</strong>调节肠道菌群，改善消化</li>
                  <li><strong>镁：</strong>有助于预防胆结石形成</li>
                </ul>
                
                <div className="mt-10 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">总结</h2>
                  <p className="text-gray-700">
                    POCS手术后的饮食调整是一个渐进的过程，需要患者耐心配合。通过科学的饮食管理，
                    可以显著加快康复进程，减少并发症，预防结石复发。如有任何不适或饮食相关问题，
                    建议及时咨询医生或营养师，获取个性化的饮食建议。
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-8 rounded-r">
                  <p className="text-blue-800 text-lg">
                    After treating gallstones with POCS (Peroral Cholangioscopy) surgery, 
                    proper dietary guidance is crucial for patient recovery. Post-surgical 
                    dietary adjustments not only help wound healing but also reduce the 
                    burden on the digestive system and prevent stone recurrence. This article 
                    provides comprehensive dietary guidelines for POCS surgery patients to help 
                    them recover quickly.
                  </p>
                </div>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  First Stage After Surgery (Days 1-3): Light Liquid Diet
                </h2>
                <p>
                  The first 1-3 days after POCS surgery are critical for recovery. During this stage, it is recommended to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Focus on warm liquid foods such as rice soup, vegetable broth, and clear chicken soup</li>
                  <li>Eat small portions frequently, controlling each intake to 100-150ml</li>
                  <li>Avoid cold drinks and irritating foods</li>
                  <li>Ensure adequate fluid intake, no less than 1500ml daily</li>
                </ul>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  Second Stage After Surgery (Days 4-7): Transitional Soft Diet
                </h2>
                <p>
                  As digestive function gradually recovers, you can transition to a soft diet:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Add easily digestible foods such as soft noodles, porridge, and steamed eggs</li>
                  <li>Incorporate moderate amounts of steamed vegetables like carrots, pumpkin, and broccoli</li>
                  <li>Include small amounts of quality protein such as tofu, fish, and lean meat</li>
                  <li>Continue to avoid fried, spicy foods and high-fat products</li>
                </ul>
                
                <div className="my-8 flex justify-center">
                  <div className="bg-green-50 rounded-lg py-4 px-6 max-w-xl">
                    <h3 className="text-green-800 font-semibold mb-2">Dietary Tips</h3>
                    <p className="text-green-700">
                      Food temperature should be moderate, neither too cold nor too hot; eat slowly and chew thoroughly to reduce the burden on your digestive system.
                    </p>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  Third Stage After Surgery (Weeks 1-4): Establishing a Balanced Diet
                </h2>
                <p>
                  During weeks 1-4 after surgery, patients can gradually establish regular eating habits:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Increase dietary fiber intake, such as whole grains and fresh fruits and vegetables</li>
                  <li>Control fat intake, choose plant oils and avoid animal fats</li>
                  <li>Consume quality protein foods such as fish, poultry, and soy products</li>
                  <li>Eat small, frequent meals at regular times and in controlled portions</li>
                </ul>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  Long-term Dietary Guidance and Recommendations
                </h2>
                <p>
                  After POCS surgery, maintain scientific eating habits to prevent gallstone recurrence:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Control total calorie intake and maintain ideal body weight</li>
                  <li>Limit high-cholesterol food intake</li>
                  <li>Increase water-soluble dietary fiber intake</li>
                  <li>Maintain regular meals and avoid binge eating</li>
                  <li>Drink plenty of water, maintaining daily fluid intake above 2000ml</li>
                </ul>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  Foods to Avoid
                </h2>
                <p>
                  The following foods may increase bile secretion or stimulate gallbladder contraction and should be avoided or limited:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-bold text-red-700 mb-2">High-fat Foods</h4>
                    <p>Fried foods, fatty meats, cream, animal organs</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-bold text-orange-700 mb-2">Irritating Foods</h4>
                    <p>Chili, curry, alcohol, strong coffee</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-700 mb-2">High-cholesterol Foods</h4>
                    <p>Egg yolks (no more than 3 per week), animal brains</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-700 mb-2">Processed Foods</h4>
                    <p>Products containing preservatives and additives</p>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  Recommended Nutritional Supplements
                </h2>
                <p>
                  Certain nutrients are particularly beneficial for recovery after POCS surgery:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Vitamin C:</strong> Promotes wound healing and enhances immunity</li>
                  <li><strong>Vitamin D and calcium:</strong> Maintain bone health</li>
                  <li><strong>Probiotics:</strong> Regulate gut microbiota and improve digestion</li>
                  <li><strong>Magnesium:</strong> Helps prevent gallstone formation</li>
                </ul>
                
                <div className="mt-10 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Conclusion</h2>
                  <p className="text-gray-700">
                    Dietary adjustment after POCS surgery is a gradual process that requires patient cooperation. 
                    Through scientific dietary management, recovery can be significantly accelerated, complications 
                    reduced, and stone recurrence prevented. If you experience any discomfort or have dietary concerns, 
                    it is advisable to consult a doctor or nutritionist for personalized dietary advice.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietaryGuidance; 