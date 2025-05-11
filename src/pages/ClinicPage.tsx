import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Phone, Clock, FileText, ThumbsUp } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import Button from '../components/common/Button';

const ClinicPage = () => {
  const { t } = useTranslation();
  
  // Appointment methods from translation
  const appointmentMethods = t('clinic.appointmentMethods', { returnObjects: true }) as string[];
  // Preparation items from translation
  const preparationItems = t('clinic.preparationItems', { returnObjects: true }) as string[];

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
            {t('clinic.title')}
          </motion.h1>
        </div>
      </div>

      {/* Clinic Information Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <motion.div 
              className="rounded-lg overflow-hidden shadow-medium"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Clinic Reception" 
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeader
                title={t('common.home') === 'Home' ? 'Visit Information' : '就诊信息'}
              />
              
              <div className="space-y-8">
                {/* Schedule */}
                <div className="flex">
                  <div className="p-3 rounded-full bg-primary-100 text-primary-700 mr-4 flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-900 mb-1">{t('clinic.schedule')}</h3>
                    <p className="text-gray-700 text-lg">{t('clinic.scheduleContent')}</p>
                  </div>
                </div>
                
                {/* Location */}
                <div className="flex">
                  <div className="p-3 rounded-full bg-primary-100 text-primary-700 mr-4 flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-900 mb-1">{t('clinic.location')}</h3>
                    <p className="text-gray-700 text-lg">{t('clinic.locationContent')}</p>
                  </div>
                </div>
                
                {/* Appointments */}
                <div className="flex">
                  <div className="p-3 rounded-full bg-primary-100 text-primary-700 mr-4 flex-shrink-0">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-900 mb-1">{t('clinic.appointment')}</h3>
                    <p className="text-gray-700">{t('clinic.appointmentContent')}</p>
                    <ul className="mt-2 space-y-1">
                      {appointmentMethods.map((method, index) => (
                        <li key={index} className="flex items-center">
                          <ThumbsUp size={16} className="text-secondary mr-2" />
                          <span>{method}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* QR Code Placeholder - For a real site, this would be an actual QR code */}
                <div className="flex justify-center my-6">
                  <div className="p-4 border border-gray-300 rounded-lg bg-white inline-block">
                    <img 
                      src="/qrcode.jpg" 
                      alt="微信预约二维码"
                      className="w-64 h-64 object-contain" 
                    />
                    <p className="text-center mt-2 text-sm text-gray-600">
                      {t('common.home') === 'Home' ? 'Scan for appointment' : '岭南肝胆助理'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visit Preparation */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('clinic.preparation')}
            subtitle={t('common.home') === 'Home' 
              ? 'What to bring to your appointment with Dr. Liu Bo'
              : '前来刘波主任门诊需要携带哪些资料'}
            centered
          />

          <div className="max-w-3xl mx-auto mt-8">
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-soft"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-6 text-gray-700">
                {t('clinic.preparationContent')}
              </p>

              <div className="space-y-4">
                {preparationItems.map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <FileText className="text-secondary mt-1 mr-3 flex-shrink-0" size={20} />
                    <p className="text-gray-700">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="text-center mt-8">
              <Button to="#" variant="primary">
                {t('common.appointment')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-12 md:py-16 bg-primary-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-primary-900 mb-6">
            {t('common.home') === 'Home' 
              ? 'Have Questions About Your Visit?' 
              : '对就诊有疑问？'}
          </h2>
          
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            {t('common.home') === 'Home' 
              ? 'Check our frequently asked questions section for answers to common inquiries about appointments, preparation, and what to expect during your visit.' 
              : '查看我们的常见问题部分，了解有关预约、准备和就诊过程中常见问题的答案。'}
          </p>
          
          <Button to="/faq" variant="outline">
            {t('faq.title')}
          </Button>
        </div>
      </section>
    </>
  );
};

export default ClinicPage;