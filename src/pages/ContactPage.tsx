import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, Check } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';

const ContactPage = () => {
  const { t } = useTranslation();
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    condition: '',
    question: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const res = await fetch('https://formspree.io/f/xeogleze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (res.ok) {
        setFormSubmitted(true);
        setFormData({
          name: '',
          phone: '',
          condition: '',
          question: '',
        });
  
        setTimeout(() => {
          setFormSubmitted(false);
        }, 5000);
      } else {
        alert('提交失败，请稍后重试。');
      }
    } catch (error) {
      alert('网络错误，无法提交留言。');
    }
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
            {t('contact.title')}
          </motion.h1>
          <motion.p
            className="text-xl text-gray-200 text-center mt-4 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('contact.subtitle')}
          </motion.p>
        </div>
      </div>

      {/* Contact Information Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeader
                title={t('common.home') === 'Home' ? 'Get in Touch' : '联系方式'}
              />

              <div className="space-y-8">
                {/* Email */}
                <div className="flex items-start">
                  <div className="p-3 rounded-full bg-primary-100 text-primary-700 mr-4">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-900 mb-1">{t('contact.email')}</h3>
                    <p className="text-xl font-semibold text-gray-800">{t('contact.emailAddress')}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start">
                  <div className="p-3 rounded-full bg-primary-100 text-primary-700 mr-4">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-900 mb-1">{t('contact.address')}</h3>
                    <p className="text-xl font-semibold text-gray-800 mb-1">{t('contact.addressContent')}</p>
                    <p className="text-gray-600">{t('contact.transportationContent')}</p>
                  </div>
                </div>

                {/* Clinic Hours */}
                <div className="flex items-start">
                  <div className="p-3 rounded-full bg-primary-100 text-primary-700 mr-4">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-900 mb-1">{t('clinic.schedule')}</h3>
                    <p className="text-xl font-semibold text-gray-800">{t('clinic.scheduleContent')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeader
                title={t('contact.form.title')}
              />

              <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg shadow-soft">
                {formSubmitted ? (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-green-100">
                        <Check className="text-green-600" size={32} />
                      </div>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      {t('contact.form.success')}
                    </h3>
                    <p className="text-gray-600">
                      {t('contact.form.successMessage')}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('contact.form.name')}
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('contact.form.phone')}
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('contact.form.condition')}
                      </label>
                      <input
                        type="text"
                        id="condition"
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('contact.form.question')}
                      </label>
                      <textarea
                        id="question"
                        name="question"
                        rows={4}
                        value={formData.question}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none"
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none"
                    >
                      <Send size={18} className="mr-2" />
                      {t('contact.form.submit')}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('common.home') === 'Home' ? 'Find Us' : '找到我们'}
            centered
          />
<iframe
  src="https://api.map.baidu.com/lbsapi/cloudmap/demo.html?location=113.478634,23.176675&title=中山大学附属第三医院岭南医院&content=广州市黄埔区开创大道2693号"
  width="100%"
  height="100%"
  style={{ border: 0 }}
  allowFullScreen
></iframe>

          <div className="mt-8 text-center">
            <p className="text-gray-700 max-w-2xl mx-auto">
              {t('common.home') === 'Home' 
                ? 'Located in central Guangzhou, our clinic is easily accessible by public transportation. We are committed to providing high-quality medical services to patients from all over China and abroad.' 
                : '位于广州市中心，我们的诊所交通便利。我们致力于为来自中国各地和海外的患者提供高质量的医疗服务。'}
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;