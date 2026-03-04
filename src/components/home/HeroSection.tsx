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
    <section className="relative min-h-[46vh] md:min-h-[52vh] flex items-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: "url('https://images.pexels.com/photos/3846035/pexels-photo-3846035.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
          backgroundPosition: "center 30%"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/70"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pt-14 md:pt-16 z-10 relative">
        <motion.div 
          className="max-w-3xl text-white"
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
            <Button to="/clinic" variant="secondary" size="lg">
              {t('home.hero.cta')}
            </Button>
            <Button to="/technology" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              {t('common.learnMore')}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator removed for tighter first screen */}
    </section>
  );
};

export default HeroSection;