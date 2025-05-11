import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';

const TechnologyPreviewSection = () => {
  const { t } = useTranslation();
  
  const benefits = t('home.technology.benefits', { returnObjects: true }) as string[];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <SectionHeader
          title={t('home.technology.title')}
          subtitle={t('common.home') === 'Home' 
            ? 'Advanced minimally invasive technology for gallstone treatment'
            : '先进的胆结石微创治疗技术'}
          centered
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Technology Image */}
          <motion.div
            className="rounded-lg overflow-hidden shadow-medium order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
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

          {/* Technology Description */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {t('home.technology.content')}
            </p>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <CheckCircle className="text-secondary mr-2 mt-1 flex-shrink-0" size={20} />
                  <p className="text-gray-700">{benefit}</p>
                </motion.div>
              ))}
            </div>

            <Button to="/technology" variant="primary">
              {t('common.learnMore')}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TechnologyPreviewSection;