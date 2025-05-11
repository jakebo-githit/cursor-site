import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Award, BookOpen, Briefcase, Star } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';

const AboutPage = () => {
  const { t } = useTranslation();
  
  // Education items from translation
  const educationItems = t('about.educationItems', { returnObjects: true }) as string[];
  // Expertise items from translation
  const expertiseItems = t('about.expertiseItems', { returnObjects: true }) as string[];

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
            {t('about.title')}
          </motion.h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left Column - Doctor Image and Awards */}
            <div className="lg:col-span-2">
              <motion.div
                className="sticky top-24"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative mb-8">
                  <div className="rounded-lg overflow-hidden shadow-medium">
                    <img 
                      src="/images/liu-bo-doctor.jpg" 
                      alt="Dr. Liu Bo" 
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-900/90 to-transparent p-4">
                    <h2 className="text-xl font-serif text-white">
                      {t('common.home') === 'Home' ? 'Dr. Liu Bo' : '刘波主任'}
                    </h2>
                    <p className="text-gray-200">
                      {t('common.home') === 'Home' ? 'Chief Physician' : '主任医师'}
                    </p>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">
                    {t('common.home') === 'Home' ? 'Achievements' : '专业成就'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Star className="text-secondary mr-2" size={20} />
                      <p>{t('common.home') === 'Home' ? 'Over 5,000 successful surgeries' : '5,000余例成功手术'}</p>
                    </div>
                    <div className="flex items-center">
                      <Star className="text-secondary mr-2" size={20} />
                      <p>{t('common.home') === 'Home' ? 'Multiple international academic publications' : '多篇国际学术发表'}</p>
                    </div>
                    <div className="flex items-center">
                      <Star className="text-secondary mr-2" size={20} />
                      <p>{t('common.home') === 'Home' ? 'Advanced POCS technology expertise' : 'POCS技术专业权威'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Doctor Bio */}
            <div className="lg:col-span-3">
              {/* Professional Experience */}
              <motion.div 
                className="mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center mb-4">
                  <Briefcase className="text-primary-600 mr-3" size={24} />
                  <h2 className="text-2xl font-serif font-semibold text-primary-900">
                    {t('about.experience')}
                  </h2>
                </div>
                <p className="text-gray-700 text-base-plus leading-relaxed">
                  {t('about.experienceContent')}
                </p>
                <p className="text-gray-700 text-base-plus leading-relaxed mt-4">
                  {t('common.home') === 'Home' 
                    ? 'Dr. Liu has pioneered the application of POCS technology in China, helping countless patients with complex gallstones avoid traditional open surgery.'
                    : '刘波主任在国内率先开展POCS技术应用，帮助无数复杂胆结石患者避免传统开腹手术。'}
                </p>
              </motion.div>

              {/* Educational Background */}
              <motion.div 
                className="mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <BookOpen className="text-primary-600 mr-3" size={24} />
                  <h2 className="text-2xl font-serif font-semibold text-primary-900">
                    {t('about.education')}
                  </h2>
                </div>
                <ul className="space-y-2">
                  {educationItems.map((item, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Professional Expertise */}
              <motion.div 
                className="mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  <Award className="text-primary-600 mr-3" size={24} />
                  <h2 className="text-2xl font-serif font-semibold text-primary-900">
                    {t('about.expertise')}
                  </h2>
                </div>
                <ul className="space-y-2">
                  {expertiseItems.map((item, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Medical Philosophy */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center mb-4">
                  <div className="text-primary-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 8v4l2 2"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-serif font-semibold text-primary-900">
                    {t('about.philosophy')}
                  </h2>
                </div>
                <div className="bg-primary-50 p-6 rounded-lg border-l-4 border-primary-600">
                  <p className="text-gray-700 text-base-plus leading-relaxed italic">
                    {t('about.philosophyContent')}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;