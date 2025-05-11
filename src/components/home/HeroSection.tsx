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
    <section className="relative min-h-screen flex items-center">
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
      <div className="container mx-auto px-4 pt-20 z-10 relative">
        <motion.div 
          className="max-w-3xl text-white"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1 
            variants={item}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4"
          >
            {t('home.hero.title')}
          </motion.h1>

          <motion.p 
            variants={item}
            className="text-xl md:text-2xl mb-4 text-gray-200"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.p 
            variants={item}
            className="text-2xl md:text-3xl mb-8 font-serif italic"
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

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div 
          className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;