import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, ThumbsUp } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';

const TechnologyPage = () => {
  const { t } = useTranslation();
  
  // Advantages list from translation
  const advantagesList = t('technology.advantagesList', { returnObjects: true }) as string[];

  return (
    <>
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-800 text-white">
        <div className="container mx-auto px-4">
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('technology.title')}
          </motion.h1>
        </div>
      </div>

      {/* Introduction Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-primary-900 mb-4">
                {t('technology.intro')}
              </h2>
              <p className="text-gray-700 text-base-plus leading-relaxed mb-6">
                {t('technology.introContent')}
              </p>
              <div className="bg-primary-50 p-6 rounded-lg border-l-4 border-primary-600">
                <p className="text-primary-700 italic">
                  {t('common.home') === 'Home' 
                    ? 'POCS technology represents a significant advancement in the treatment of biliary diseases, offering patients a minimally invasive alternative with faster recovery times.'
                    : 'POCS技术代表了胆道疾病治疗的重大进步，为患者提供了创伤小、恢复快的微创治疗选择。'}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="rounded-lg overflow-hidden shadow-medium"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="/images/pocs-surgery.jpg" 
                alt="POCS Technology" 
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('technology.advantages')}
            subtitle={t('common.home') === 'Home' 
              ? 'Why POCS is the preferred choice for gallstone treatment'
              : 'POCS为何是胆结石治疗的首选方案'}
            centered
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {advantagesList.map((advantage, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-soft border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <CheckCircle className="text-secondary mb-4" size={28} />
                <p className="text-gray-700">{advantage}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('technology.comparison')}
            subtitle={t('common.home') === 'Home' 
              ? 'How POCS compares to traditional gallstone treatment methods'
              : 'POCS技术与传统胆结石治疗方法的对比'}
          />

          <div className="overflow-x-auto">
            <table className="w-full mt-8 border-collapse">
              <thead>
                <tr>
                  <th className="p-4 bg-primary-900 text-white text-left rounded-tl-lg">
                    {t('common.home') === 'Home' ? 'Features' : '特点'}
                  </th>
                  <th className="p-4 bg-primary-800 text-white text-center">
                    POCS {t('common.home') === 'Home' ? 'Technology' : '技术'}
                  </th>
                  <th className="p-4 bg-gray-600 text-white text-center rounded-tr-lg">
                    {t('common.home') === 'Home' ? 'Traditional Surgery' : '传统手术'}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border border-gray-200 bg-gray-50 font-medium">
                    {t('common.home') === 'Home' ? 'Invasiveness' : '创伤程度'}
                  </td>
                  <td className="p-4 border border-gray-200 text-center">
                    <span className="flex items-center justify-center text-green-600">
                      <ThumbsUp size={20} className="mr-2" />
                      {t('common.home') === 'Home' ? 'Minimally invasive' : '微创'}
                    </span>
                  </td>
                  <td className="p-4 border border-gray-200 text-center">
                    <span className="flex items-center justify-center text-red-600">
                      <AlertTriangle size={20} className="mr-2" />
                      {t('common.home') === 'Home' ? 'Highly invasive' : '创伤大'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 border border-gray-200 bg-gray-50 font-medium">
                    {t('common.home') === 'Home' ? 'Recovery Time' : '恢复时间'}
                  </td>
                  <td className="p-4 border border-gray-200 text-center">
                    <span className="flex items-center justify-center text-green-600">
                      <ThumbsUp size={20} className="mr-2" />
                      {t('common.home') === 'Home' ? '5-7 days' : '5-7天'}
                    </span>
                  </td>
                  <td className="p-4 border border-gray-200 text-center">
                    <span className="flex items-center justify-center text-red-600">
                      <AlertTriangle size={20} className="mr-2" />
                      {t('common.home') === 'Home' ? '2-4 weeks' : '2-4周'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 border border-gray-200 bg-gray-50 font-medium">
                    {t('common.home') === 'Home' ? 'Gallbladder Preservation' : '保留胆囊'}
                  </td>
                  <td className="p-4 border border-gray-200 text-center">
                    <span className="flex items-center justify-center text-green-600">
                      <ThumbsUp size={20} className="mr-2" />
                      {t('common.home') === 'Home' ? 'Yes' : '是'}
                    </span>
                  </td>
                  <td className="p-4 border border-gray-200 text-center">
                    <span className="flex items-center justify-center text-red-600">
                      <AlertTriangle size={20} className="mr-2" />
                      {t('common.home') === 'Home' ? 'No (typically removed)' : '否（通常切除）'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 border border-gray-200 bg-gray-50 font-medium">
                    {t('common.home') === 'Home' ? 'Pain Level' : '疼痛程度'}
                  </td>
                  <td className="p-4 border border-gray-200 text-center">
                    <span className="flex items-center justify-center text-green-600">
                      <ThumbsUp size={20} className="mr-2" />
                      {t('common.home') === 'Home' ? 'Minimal' : '轻微'}
                    </span>
                  </td>
                  <td className="p-4 border border-gray-200 text-center">
                    <span className="flex items-center justify-center text-red-600">
                      <AlertTriangle size={20} className="mr-2" />
                      {t('common.home') === 'Home' ? 'Significant' : '显著'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 border border-gray-200 bg-gray-50 font-medium">
                    {t('common.home') === 'Home' ? 'Visualization' : '可视化'}
                  </td>
                  <td className="p-4 border border-gray-200 text-center">
                    <span className="flex items-center justify-center text-green-600">
                      <ThumbsUp size={20} className="mr-2" />
                      {t('common.home') === 'Home' ? 'Direct visualization' : '直接可视化'}
                    </span>
                  </td>
                  <td className="p-4 border border-gray-200 text-center">
                    <span className="flex items-center justify-center text-yellow-600">
                      <AlertTriangle size={20} className="mr-2" />
                      {t('common.home') === 'Home' ? 'Limited/Indirect' : '有限/间接'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <motion.div 
            className="mt-8 bg-gray-50 p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-700 text-base-plus leading-relaxed">
              {t('technology.comparisonContent')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Suitable Patients Section */}
      <section className="py-12 md:py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('technology.suitablePatients')}
            subtitle={t('common.home') === 'Home' 
              ? 'Who can benefit from POCS technology?'
              : '哪些人群适合POCS技术？'}
            centered
          />

          <motion.div 
            className="bg-white p-8 rounded-lg shadow-soft mt-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-base-plus text-gray-700 leading-relaxed mb-6">
              {t('technology.suitablePatientsContent')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-2"></div>
                <p className="text-gray-700">
                  {t('common.home') === 'Home' 
                    ? 'Patients with complex biliary stones'
                    : '复杂胆道结石患者'}
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-2"></div>
                <p className="text-gray-700">
                  {t('common.home') === 'Home' 
                    ? 'Cases of bile duct stricture'
                    : '胆管狭窄病例'}
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-2"></div>
                <p className="text-gray-700">
                  {t('common.home') === 'Home' 
                    ? 'Patients with intrahepatic bile duct stones'
                    : '肝内胆管结石患者'}
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-2"></div>
                <p className="text-gray-700">
                  {t('common.home') === 'Home' 
                    ? 'Recurrent stones after previous surgery'
                    : '既往手术后复发结石'}
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-2"></div>
                <p className="text-gray-700">
                  {t('common.home') === 'Home' 
                    ? 'Elderly patients seeking less invasive options'
                    : '寻求微创选择的老年患者'}
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-2"></div>
                <p className="text-gray-700">
                  {t('common.home') === 'Home' 
                    ? 'Patients with failed ERCP procedures'
                    : 'ERCP治疗失败的患者'}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="text-center mt-12">
            <p className="text-gray-600 italic mb-4">
              {t('common.home') === 'Home' 
                ? 'Not sure if POCS is right for you?'
                : '不确定POCS技术是否适合您？'}
            </p>
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <a 
                href="/assessment" 
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-white font-medium rounded-md shadow-sm hover:bg-secondary-600 transition-colors focus:outline-none"
              >
                {t('common.selfAssessment')}
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TechnologyPage;