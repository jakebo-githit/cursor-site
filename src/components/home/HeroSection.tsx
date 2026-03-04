import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Button from '../common/Button';

const HeroSection = () => {
  const { t } = useTranslation();

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="pt-24 pb-12 bg-primary-800 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            variants={item}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3"
          >
            {t('home.hero.title')}
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg md:text-xl mb-3 text-gray-200"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.p
            variants={item}
            className="text-xl md:text-2xl mb-6 font-serif italic"
          >
            {t('home.hero.doctorName')}
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-4">
            <Button to="/contact" variant="secondary" size="lg">
              {t('common.contactUs')}
            </Button>
            <Button to="/technology" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              {t('common.learnMore')}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;