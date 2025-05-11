import React from 'react';
import { motion } from 'framer-motion';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
};

const SectionHeader = ({ 
  title, 
  subtitle, 
  centered = false,
  light = false 
}: SectionHeaderProps) => {
  return (
    <motion.div 
      className={`mb-10 ${centered ? 'text-center' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={`text-2xl md:text-3xl lg:text-4xl font-serif font-semibold mb-4 ${
        light ? 'text-white' : 'text-primary-900'
      }`}>
        {title}
      </h2>
      
      {subtitle && (
        <p className={`text-lg md:text-xl ${
          light ? 'text-gray-200' : 'text-gray-600'
        } max-w-3xl ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
      
      <div className={`w-20 h-1 mt-4 ${centered ? 'mx-auto' : ''} ${
        light ? 'bg-secondary' : 'bg-secondary'
      }`}></div>
    </motion.div>
  );
};

export default SectionHeader;