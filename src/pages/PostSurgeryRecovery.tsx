import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PostSurgeryRecovery() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="p-4 bg-primary-800 text-white">
            <Link to="/articles" className="inline-flex items-center text-gray-100 hover:text-white">
              <ArrowLeft className="mr-2" size={18} />
              {t('common.back_to_articles')}
            </Link>
          </div>
          
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('articles.post_surgery_recovery.title')}
            </h1>
            
            <p className="text-gray-500 mb-8">
              {t('common.published_date', { date: '2025-01-18' })}
            </p>
            
            <div className="prose prose-lg max-w-none">
              {currentLanguage === 'zh' ? (
                <>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-8 rounded-r">
                    <p className="text-blue-800 text-lg">
                      经口胆道镜（POCS）技术是治疗胆结石的微创方法，通过消化道自然通道进行，无需体表切口。
                      相比传统开腹手术，POCS具有无创伤、恢复快的显著优势。
                      然而，术后康复依然需要患者的积极配合和科学管理。本文将详细介绍POCS术后康复的关键环节，
                      帮助患者加速康复过程，尽快恢复正常生活。
                    </p>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                    术后早期恢复期（1-3天）
                  </h2>
                  <p>
                    POCS手术后的头几天是康复的关键期，需要特别注意以下几点：
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>适当休息：</strong>术后24小时以内以卧床休息为主，避免剧烈活动</li>
                    <li><strong>口腔护理：</strong>使用温盐水漱口，保持口腔卫生</li>
                    <li><strong>饮食调整：</strong>从流质饮食开始，逐渐过渡到软食，避免辛辣刺激性食物</li>
                    <li><strong>疼痛管理：</strong>按医嘱服用止痛药物，记录疼痛变化</li>
                    <li><strong>体温监测：</strong>每天测量体温2-3次，如超过38℃应及时就医</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                    口腔护理与管理
                  </h2>
                  <p>
                    POCS是经口进行的微创手术，无需体表切口，但口腔护理同样重要：
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>保持口腔清洁，术后可使用温盐水轻柔漱口</li>
                    <li>避免进食过烫、过冷或刺激性食物，防止口腔不适</li>
                    <li>观察有无口腔不适、咽喉疼痛等症状，如有异常及时报告医生</li>
                    <li>术后24-48小时内避免使用漱口水等含酒精成分的口腔清洁产品</li>
                    <li>保持良好的口腔卫生习惯，但术后当天应避免刷牙</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                    症状管理与自我监测
                  </h2>
                  <p>
                    术后自我监测对于及时发现潜在问题至关重要：
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>定期测量体温、脉搏和血压，记录变化</li>
                    <li>注意观察皮肤和巩膜有无黄染（黄疸）情况</li>
                    <li>关注排便情况，尤其是大便颜色变化</li>
                    <li>留意腹痛、恶心、呕吐等消化道症状</li>
                    <li>如出现持续高热、严重腹痛、黄疸加重等情况，应立即就医</li>
                  </ul>
                  
                  <div className="mt-10 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">总结：康复的关键要素</h2>
                    <p className="text-gray-700">
                      POCS术后康复是一个综合过程，成功康复的关键包括：
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
                      <li>遵循医嘱，规律服药和复诊</li>
                      <li>科学饮食，均衡营养</li>
                      <li>循序渐进的活动和锻炼</li>
                      <li>积极的心态和充分的休息</li>
                      <li>良好的口腔护理和自我健康管理</li>
                    </ul>
                    <p className="mt-4 text-gray-700">
                      通过科学的康复管理，大多数POCS手术患者可以在较短时间内恢复正常生活和工作。
                      如有任何疑问或异常情况，请及时咨询您的主治医师，获取个性化的康复指导。
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-8 rounded-r">
                    <p className="text-blue-800 text-lg">
                      Peroral Cholangioscopy (POCS) is a minimally invasive method for treating gallstones, 
                      performed through natural digestive tract passages without external incisions.
                      Compared to traditional open surgery, POCS offers significant advantages of being non-traumatic
                      with faster recovery. However, post-procedure recovery still requires active cooperation 
                      and scientific management from patients. This article details the key elements of POCS 
                      post-procedure recovery, helping patients accelerate the recovery process and return to normal life quickly.
                    </p>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                    Early Recovery Period (1-3 Days)
                  </h2>
                  <p>
                    The first few days after POCS procedure are critical for recovery, requiring special attention to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Adequate Rest:</strong> Focus on bed rest for the first 24 hours, avoiding strenuous activities</li>
                    <li><strong>Oral Care:</strong> Use warm salt water for gentle mouth rinsing, maintain oral hygiene</li>
                    <li><strong>Dietary Adjustment:</strong> Start with liquid diet, gradually transition to soft foods, avoid spicy and irritating foods</li>
                    <li><strong>Pain Management:</strong> Take pain medication as prescribed, record pain changes</li>
                    <li><strong>Temperature Monitoring:</strong> Measure body temperature 2-3 times daily, seek medical attention if it exceeds 38°C</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                    Oral Care and Management
                  </h2>
                  <p>
                    POCS is a minimally invasive procedure performed through the mouth without external incisions, but oral care remains important:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maintain oral cleanliness, gently rinse with warm salt water after the procedure</li>
                    <li>Avoid foods that are too hot, too cold, or irritating to prevent oral discomfort</li>
                    <li>Monitor for oral discomfort, sore throat, or other symptoms, and report any abnormalities to your doctor promptly</li>
                    <li>Avoid using mouthwash or other oral cleaning products containing alcohol for 24-48 hours after the procedure</li>
                    <li>Maintain good oral hygiene habits, but avoid brushing teeth on the day of the procedure</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                    Symptom Management and Self-Monitoring
                  </h2>
                  <p>
                    Post-procedure self-monitoring is crucial for timely identification of potential issues:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Regularly measure temperature, pulse, and blood pressure, recording changes</li>
                    <li>Observe skin and sclera for yellowing (jaundice)</li>
                    <li>Pay attention to bowel movements, especially changes in stool color</li>
                    <li>Monitor for digestive symptoms such as abdominal pain, nausea, and vomiting</li>
                    <li>Seek immediate medical attention for persistent high fever, severe abdominal pain, worsening jaundice, or other concerning symptoms</li>
                  </ul>
                  
                  <div className="mt-10 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary: Key Elements of Recovery</h2>
                    <p className="text-gray-700">
                      POCS post-procedure recovery is a comprehensive process, with key success factors including:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
                      <li>Following medical advice, taking medication regularly, and attending follow-up appointments</li>
                      <li>Scientific diet with balanced nutrition</li>
                      <li>Progressive activity and exercise</li>
                      <li>Positive attitude and adequate rest</li>
                      <li>Good oral care and self-health management</li>
                    </ul>
                    <p className="mt-4 text-gray-700">
                      Through scientific recovery management, most POCS patients can resume normal life and work in a relatively short time.
                      If you have any questions or abnormal conditions, please promptly consult your attending physician for personalized recovery guidance.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 