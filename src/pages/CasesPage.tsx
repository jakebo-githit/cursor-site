import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Quote, CheckCircle2 } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';

const CasesPage = () => {
  const { t } = useTranslation();
  
  // Case studies from translation
  const caseStudies = t('cases.caseStudies', { returnObjects: true }) as {
    title: string;
    patient: string;
    description: string;
    testimonial: string;
  }[];

  // Recovery timeline from translation
  const recoveryTimeline = t('cases.recoverySection.timeline', { returnObjects: true }) as string[];

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
            {t('cases.title')}
          </motion.h1>
          <motion.p
            className="text-xl text-gray-200 text-center mt-4 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('cases.subtitle')}
          </motion.p>
        </div>
      </div>

      {/* Case Studies Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('common.home') === 'Home' ? 'Success Stories' : '成功案例'}
            subtitle={t('common.home') === 'Home' 
              ? 'Real patients who have benefited from Dr. Liu Bo\'s expertise'
              : '从刘波主任专业技术中获益的真实患者'}
            centered
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {caseStudies.map((caseStudy, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-lg shadow-soft overflow-hidden border border-gray-200"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-primary-700 text-white p-4">
                  <h3 className="text-lg font-medium">{caseStudy.title}</h3>
                  <p className="text-sm text-gray-200 mt-1">{caseStudy.patient}</p>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 mb-6">{caseStudy.description}</p>
                  
                  <div className="relative pl-8 border-l-4 border-secondary-300 italic text-gray-600">
                    <Quote className="text-secondary-300 absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/4" size={24} />
                    <p>{caseStudy.testimonial}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('cases.videoSection.title')}
            subtitle={t('cases.videoSection.description')}
            centered
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <motion.div 
              className="bg-white rounded-lg shadow-soft overflow-hidden aspect-video"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Video placeholder - in a real site, this would be an actual video */}
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-lg shadow-soft overflow-hidden aspect-video"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Video placeholder - in a real site, this would be an actual video */}
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </motion.div>
          </div>

          <p className="text-sm text-gray-500 text-center mt-4 italic">
            {t('cases.videoSection.note')}
          </p>
        </div>
      </section>

      {/* Recovery Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('cases.recoverySection.title')}
            subtitle={t('cases.recoverySection.description')}
            centered
          />

          <div className="max-w-4xl mx-auto mt-8">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 ml-px top-2 bottom-2 w-0.5 bg-primary-200"></div>
              
              {/* Timeline items */}
              <div className="space-y-8">
                {recoveryTimeline.map((item, index) => (
                  <motion.div 
                    key={index}
                    className="relative flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 ring-8 ring-white">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="ml-6">
                      <p className="text-gray-700 font-medium">{item}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-primary-50 p-6 rounded-lg max-w-3xl mx-auto mt-12">
            <p className="text-center text-primary-700 font-medium">
              {t('common.home') === 'Home' 
                ? 'Would you like to find out if you are a candidate for POCS treatment?'
                : '想了解您是否适合POCS治疗吗？'}
            </p>
            <div className="flex justify-center mt-4">
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
        </div>
      </section>
    </>
  );
};

export default CasesPage;