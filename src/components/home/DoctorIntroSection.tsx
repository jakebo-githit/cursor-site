import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Award, BookOpen, Users } from 'lucide-react';
import Button from '../common/Button';
import SectionHeader from '../common/SectionHeader';

const DoctorIntroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Doctor Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-lg overflow-hidden shadow-medium">
              <img 
                src="/images/liu-bo-doctor.jpg" 
                alt="Dr. Liu Bo" 
                className="w-full h-auto object-cover aspect-[3/4]"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary-800 text-white p-4 md:p-6 rounded-lg shadow-md">
              <p className="text-xl md:text-2xl font-serif">30+ {t('common.home') === 'Home' ? 'Years Experience' : '年经验'}</p>
            </div>
          </motion.div>

          {/* Introduction Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeader
              title={t('home.intro.title')}
              alignment="left"
            />
            
            <div className="text-gray-700 text-base-plus space-y-4">
              <p className="leading-relaxed">
                {t('home.intro.content')}
              </p>
              <p className="leading-relaxed">
                {t('home.intro.philosophy')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
                <Award className="text-secondary mb-2" size={28} />
                <p className="font-medium">{t('common.home') === 'Home' ? 'Experienced Specialist' : '资深专家'}</p>
              </div>
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
                <BookOpen className="text-secondary mb-2" size={28} />
                <p className="font-medium">{t('common.home') === 'Home' ? 'Published Researcher' : '专业研究'}</p>
              </div>
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center col-span-2 md:col-span-1">
                <Users className="text-secondary mb-2" size={28} />
                <p className="font-medium">{t('common.home') === 'Home' ? 'Patient Centered' : '以患者为中心'}</p>
              </div>
            </div>
            
            <Button to="/about" variant="primary">
              {t('common.readMore')}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DoctorIntroSection;