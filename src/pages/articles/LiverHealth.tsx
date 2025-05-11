import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LiverHealth = () => {
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
            src="/images/liver-health.jpg"
            alt={t('articles.self-monitoring-hepatobiliary-health')}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium flex items-center">
            <Activity className="w-4 h-4 mr-1" />
            {t('categories.liver_health')}
          </div>
        </div>
        
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {currentLanguage === 'zh' ? '肝胆健康的自我监测方法' : 'Self-monitoring Methods for Hepatobiliary Health'}
          </h1>
          
          <p className="text-gray-500 mb-8">
            {t('common.published_date', { date: '2025-01-30' })}
          </p>
          
          <div className="prose prose-lg max-w-none">
            {currentLanguage === 'zh' ? (
              <>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-8 rounded-r">
                  <p className="text-blue-800 text-lg">
                    肝胆问题的早期识别对治疗效果至关重要。本文概述了监测肝胆健康的实用方法，帮助您在问题变得严重之前发现潜在的健康隐患。
                  </p>
                </div>
      
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  了解肝胆系统
                </h2>
                <p className="mb-4">
                  肝胆系统包括肝脏、胆囊和胆管。这些器官协同工作，共同完成以下功能：
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li><strong>产生和分泌消化所需的胆汁</strong></li>
                  <li><strong>处理营养物质、药物和毒素</strong></li>
                  <li><strong>储存能量和必需维生素</strong></li>
                  <li><strong>合成血液凝固所需的蛋白质</strong></li>
                </ul>
      
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-blue-800 font-medium">您知道吗？肝脏在您的身体中执行超过500种必要功能，其中许多直接影响您的整体健康和幸福感。</p>
                </div>
      
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  需要监测的外部征兆
                </h2>
      
                <h3 className="text-xl font-bold text-primary-700 mt-6 mb-3">
                  1. 皮肤和眼睛变化
                </h3>
                <p className="mb-4">
                  肝胆问题最易识别的征兆是黄疸——皮肤和眼睛发黄。请注意监测：
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>眼白发黄（通常是最早的迹象）</li>
                  <li>皮肤呈现黄色调，尤其在面部和手掌处明显</li>
                  <li>尿液变深，呈茶色或可乐色</li>
                  <li>淡色、陶土色大便</li>
                </ul>
      
                <h3 className="text-xl font-bold text-primary-700 mt-6 mb-3">
                  2. 腹部变化
                </h3>
                <p className="mb-4">
                  注意腹部的变化：
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>腹部右上方疼痛或触痛</li>
                  <li>腹部区域肿胀</li>
                  <li>即使少量进食后也有饱胀感</li>
                  <li>腹部可见静脉（在晚期肝脏病变中）</li>
                </ul>
      
                <h3 className="text-xl font-bold text-primary-700 mt-6 mb-3">
                  3. 消化功能
                </h3>
                <p className="mb-4">
                  由于肝胆系统在消化中扮演关键角色，请监测：
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>食欲变化</li>
                  <li>消化高脂食物困难（进食后恶心、胀气或不适）</li>
                  <li>持续性消化不良或恶心</li>
                  <li>无法解释的体重减轻</li>
                </ul>
      
                <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 mb-2">能量水平监测</h4>
                    <p>肝脏帮助将食物转化为能量。持续的疲劳、虚弱或耐力下降可能是肝脏负担的早期征兆。记录一天中的能量水平，注意任何显著变化。</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-bold text-indigo-800 mb-2">认知功能监测</h4>
                    <p>当肝脏功能不佳时，毒素会在血液中积累并影响大脑功能。注意是否有无法解释的混乱、注意力难以集中或心智清晰度的变化。</p>
                  </div>
                </div>
      
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  定期医学监测
                </h2>
                <p className="mb-4">
                  定期体检对肝胆健康至关重要。考虑这些医学监测选项：
                </p>
      
                <h3 className="text-xl font-bold text-primary-700 mt-6 mb-3">
                  1. 血液检查
                </h3>
                <p className="mb-6">
                  安排定期肝功能检查，测量表明肝脏健康的酶和蛋白质。关键指标包括ALT、AST、ALP、胆红素和白蛋白水平。
                </p>
      
                <h3 className="text-xl font-bold text-primary-700 mt-6 mb-3">
                  2. 影像学检查
                </h3>
                <p className="mb-6">
                  对于高风险人群（有胆结石家族史、既往肝胆问题），定期超声检查可在症状出现前发现结石或结构变化。
                </p>
      
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  何时寻求医疗帮助
                </h2>
                <p className="mb-4">
                  如果您注意到以下情况，请立即联系医疗专业人员：
                </p>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                  <ul className="list-disc pl-6 space-y-2 text-red-800">
                    <li>黄疸（皮肤或眼睛发黄）</li>
                    <li>严重腹痛，尤其在右上侧</li>
                    <li>伴有寒战的高烧</li>
                    <li>影响日常活动的极度疲劳</li>
                    <li>深色尿液和/或陶土色大便</li>
                  </ul>
                </div>
      
                <div className="mt-10 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">预防胜于治疗</h2>
                  <p className="text-gray-700">
                    最好的监测是与预防性护理相结合。保持均衡饮食，定期锻炼，限制酒精摄入，避免不必要的药物，保持足够水分，这些都有助于维持最佳肝胆健康。
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-8 rounded-r">
                  <p className="text-blue-800 text-lg">
                    Early identification of hepatobiliary problems is crucial for treatment efficacy. This article outlines practical methods to monitor your liver and gallbladder health, helping you detect potential issues before they become serious.
                  </p>
                </div>
      
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  Understanding the Hepatobiliary System
                </h2>
                <p className="mb-4">
                  The hepatobiliary system includes the liver, gallbladder, and bile ducts. These organs work together to:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li><strong>Produce and secrete bile necessary for digestion</strong></li>
                  <li><strong>Process nutrients, medications, and toxins</strong></li>
                  <li><strong>Store energy and essential vitamins</strong></li>
                  <li><strong>Synthesize proteins for blood clotting</strong></li>
                </ul>
      
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-blue-800 font-medium">Did you know? Your liver performs over 500 essential functions in your body, many of which have direct impacts on your overall health and well-being.</p>
                </div>
      
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  External Signs to Monitor
                </h2>
      
                <h3 className="text-xl font-bold text-primary-700 mt-6 mb-3">
                  1. Skin and Eye Changes
                </h3>
                <p className="mb-4">
                  The most recognizable sign of hepatobiliary issues is jaundice—a yellowing of the skin and eyes. Monitor for:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Yellowing of the whites of the eyes (often the earliest sign)</li>
                  <li>Yellow tint to the skin, especially noticeable on the face and palms</li>
                  <li>Darkening of urine to a tea or cola color</li>
                  <li>Pale, clay-colored stools</li>
                </ul>
      
                <h3 className="text-xl font-bold text-primary-700 mt-6 mb-3">
                  2. Abdominal Changes
                </h3>
                <p className="mb-4">
                  Pay attention to changes in your abdomen:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Tenderness or pain in the upper right area of your abdomen</li>
                  <li>Swelling in the abdominal area</li>
                  <li>Feeling of fullness even after a small meal</li>
                  <li>Visible veins on the abdomen (in advanced liver conditions)</li>
                </ul>
      
                <h3 className="text-xl font-bold text-primary-700 mt-6 mb-3">
                  3. Digestive Function
                </h3>
                <p className="mb-4">
                  Since the hepatobiliary system plays a crucial role in digestion, monitor:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Changes in appetite</li>
                  <li>Difficulty digesting fatty foods (nausea, gas, or discomfort after eating)</li>
                  <li>Persistent indigestion or nausea</li>
                  <li>Unexplained weight loss</li>
                </ul>
      
                <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 mb-2">Energy Level Monitoring</h4>
                    <p>The liver helps convert food into energy. Persistent fatigue, weakness, or decreased stamina can be early signs of liver stress. Track your energy levels throughout the day and note any significant changes.</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-bold text-indigo-800 mb-2">Cognitive Function</h4>
                    <p>When the liver isn't functioning optimally, toxins can build up in the bloodstream and affect brain function. Monitor for unexplained confusion, difficulty concentrating, or changes in mental clarity.</p>
                  </div>
                </div>
      
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  Routine Medical Monitoring
                </h2>
                <p className="mb-4">
                  Regular check-ups are essential for hepatobiliary health. Consider these medical monitoring options:
                </p>
      
                <h3 className="text-xl font-bold text-primary-700 mt-6 mb-3">
                  1. Blood Tests
                </h3>
                <p className="mb-6">
                  Schedule regular liver function tests, which measure enzymes and proteins that indicate liver health. Key markers include ALT, AST, ALP, bilirubin, and albumin levels.
                </p>
      
                <h3 className="text-xl font-bold text-primary-700 mt-6 mb-3">
                  2. Imaging Tests
                </h3>
                <p className="mb-6">
                  For those at higher risk (family history of gallstones, previous hepatobiliary issues), periodic ultrasound examinations can detect stones or structural changes before symptoms appear.
                </p>
      
                <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-gray-200">
                  When to Seek Medical Attention
                </h2>
                <p className="mb-4">
                  Contact your healthcare provider immediately if you notice:
                </p>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                  <ul className="list-disc pl-6 space-y-2 text-red-800">
                    <li>Jaundice (yellowing of the skin or eyes)</li>
                    <li>Severe abdominal pain, especially in the upper right side</li>
                    <li>High fever with chills</li>
                    <li>Extreme fatigue that interferes with daily activities</li>
                    <li>Dark urine and/or clay-colored stools</li>
                  </ul>
                </div>
      
                <div className="mt-10 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Prevention is Key</h2>
                  <p className="text-gray-700">
                    The best monitoring is paired with preventive care. Maintain a balanced diet, exercise regularly, limit alcohol consumption, avoid unnecessary medications, and stay hydrated to support optimal hepatobiliary health.
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

export default LiverHealth; 