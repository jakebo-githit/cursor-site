import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';

const TestimonialSection = () => {
  const { t } = useTranslation();

  const QuoteIcon = () => {
    return <Quote className="text-secondary-300 absolute top-0 left-0 transform -translate-x-1/3 -translate-y-1/3" size={48} />;
  };

  return (
    <section className="py-16 bg-primary-900 text-white">
      <div className="container mx-auto px-4">
        <SectionHeader
          title={t('home.testimonial.title')}
          centered
          light
        />

        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="bg-primary-800 rounded-lg p-8 md:p-10 relative shadow-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <QuoteIcon />
              <p className="text-xl md:text-2xl font-serif leading-relaxed mb-6 mt-4 italic">
                {t('home.testimonial.content')}
              </p>
              <p className="text-right text-gray-300 font-medium">
                {t('home.testimonial.patient')}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {t('common.home') === 'Home' 
                ? 'Join hundreds of satisfied patients who have received expert care from Dr. Liu Bo.' 
                : '加入数百位接受刘波主任专业治疗的满意患者行列。'}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;