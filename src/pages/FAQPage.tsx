import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import Button from '../components/common/Button';

const FAQPage = () => {
  const { t } = useTranslation();
  
  // FAQ questions from translation
  const questions = t('faq.questions', { returnObjects: true }) as {
    question: string;
    answer: string;
  }[];

  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenQuestionIndex(openQuestionIndex === index ? null : index);
  };

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
            {t('faq.title')}
          </motion.h1>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title={t('common.home') === 'Home' 
                ? 'Common Questions About POCS Treatment' 
                : 'POCS治疗常见问题'}
              centered
            />

            <div className="mt-8 space-y-4">
              {questions.map((faq, index) => (
                <motion.div 
                  key={index}
                  className="bg-white rounded-lg shadow-soft overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <button
                    className="w-full text-left p-5 flex justify-between items-center focus:outline-none"
                    onClick={() => toggleQuestion(index)}
                  >
                    <span className="text-lg font-medium text-primary-900">{faq.question}</span>
                    {openQuestionIndex === index ? 
                      <ChevronUp className="text-secondary flex-shrink-0" size={20} /> : 
                      <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                    }
                  </button>
                  
                  <AnimatePresence>
                    {openQuestionIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-5 pb-5 text-gray-700 border-t border-gray-100 pt-3">
                          <p className="leading-relaxed">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">
                {t('common.home') === 'Home' 
                  ? 'Still have questions? Feel free to contact us directly for personalized answers.'
                  : '还有问题？请直接联系我们获取个性化解答。'}
              </p>
              <Button to="/contact" variant="primary">
                {t('common.contactUs')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-12 md:py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-semibold text-primary-900 mb-4">
              {t('common.home') === 'Home' 
                ? 'Want to Learn More About Gallstone Treatment?' 
                : '想了解更多关于胆结石治疗的信息？'}
            </h2>
            
            <p className="text-gray-700 mb-8">
              {t('common.home') === 'Home' 
                ? 'Explore our educational resources or try our self-assessment tool to determine if POCS is right for you.'
                : '探索我们的教育资源或尝试自我评估工具，确定POCS是否适合您。'}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button to="/articles" variant="outline">
                {t('common.articles')}
              </Button>
              <Button to="/assessment" variant="secondary">
                {t('common.selfAssessment')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQPage;