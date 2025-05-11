import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SectionHeader from '../components/common/SectionHeader';
import AssessmentForm from '../components/assessment/AssessmentForm';

const AssessmentPage = () => {
  const { t } = useTranslation();

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
            {t('assessment.title')}
          </motion.h1>
        </div>
      </div>

      {/* Assessment Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title={t('common.home') === 'Home' 
                ? 'Is POCS Right for You?' 
                : 'POCS技术适合您吗？'}
              subtitle={t('assessment.intro')}
              centered
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <AssessmentForm />

              <div className="mt-8 text-center text-gray-600">
                <p className="italic">
                  {t('assessment.contactPrompt')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title={t('common.home') === 'Home' 
                ? 'What to Expect After Assessment' 
                : '评估后的下一步'}
              centered
            />

            <div className="bg-primary-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                {t('common.home') === 'Home' 
                  ? 'This self-assessment is a preliminary tool to help determine if POCS technology might be suitable for your condition. For a definitive evaluation, we recommend:'
                  : '此自我评估是初步工具，帮助确定POCS技术是否可能适合您的情况。为了确定性评估，我们建议：'}
              </p>

              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>
                  {t('common.home') === 'Home' 
                    ? 'Schedule a consultation with Dr. Liu Bo'
                    : '预约刘波主任进行咨询'}
                </li>
                <li>
                  {t('common.home') === 'Home' 
                    ? 'Bring all relevant medical records and imaging studies'
                    : '携带所有相关医疗记录和影像学检查结果'}
                </li>
                <li>
                  {t('common.home') === 'Home' 
                    ? 'Prepare a list of your symptoms and questions'
                    : '准备您的症状和问题清单'}
                </li>
                <li>
                  {t('common.home') === 'Home' 
                    ? 'Be ready to discuss your medical history in detail'
                    : '准备详细讨论您的病史'}
                </li>
              </ol>

              <p className="text-gray-700 mt-4">
                {t('common.home') === 'Home' 
                  ? 'Dr. Liu Bo will conduct a thorough examination and review your case to recommend the most appropriate treatment plan for your specific situation.'
                  : '刘波主任将进行全面检查并审查您的病例，为您的具体情况推荐最合适的治疗方案。'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AssessmentPage;