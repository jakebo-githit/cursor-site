import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Stethoscope, Phone, Mail, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Column */}
          <div>
            <div className="flex items-center mb-4">
              <Stethoscope size={24} className="mr-2" />
              <h3 className="text-xl font-serif font-semibold">
                {t('common.home') === 'Home' ? 'Dr. Liu Bo' : '刘波主任'}
              </h3>
            </div>
            <p className="text-gray-300 mb-4 text-base-plus leading-relaxed">
              {t('common.home') === 'Home' 
                ? 'Specialist in minimally invasive gallstone treatment with over 30 years of experience in hepatobiliary surgery.' 
                : '胆结石微创治疗专家，30余年肝胆外科经验。'}
            </p>
            <div className="flex space-x-4">
              {/* Social Icons would go here */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('common.home') === 'Home' ? 'Quick Links' : '快速链接'}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-secondary transition-colors">
                  {t('common.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-secondary transition-colors">
                  {t('common.about')}
                </Link>
              </li>
              <li>
                <Link to="/technology" className="text-gray-300 hover:text-secondary transition-colors">
                  {t('common.technology')}
                </Link>
              </li>
              <li>
                <Link to="/cases" className="text-gray-300 hover:text-secondary transition-colors">
                  {t('common.cases')}
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="text-gray-300 hover:text-secondary transition-colors">
                  {t('common.selfAssessment')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('contact.title')}</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <Mail size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span>asdrliu@outlook.com</span>
              </li>
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span>{t('contact.addressContent')}</span>
              </li>
              <li className="flex items-start">
                <Clock size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span>{t('clinic.scheduleContent')}</span>
              </li>
            </ul>
          </div>

          {/* Appointment */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('common.appointment')}</h3>
            <p className="text-gray-300 mb-4">
              {t('common.home') === 'Home' 
                ? 'Schedule a consultation with Dr. Liu Bo for professional diagnosis and treatment plan.' 
                : '预约刘波主任进行专业诊断和治疗方案制定。'}
            </p>
            <Link 
              to="/clinic" 
              className="inline-block bg-secondary hover:bg-secondary-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              {t('common.appointment')}
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} {t('common.home') === 'Home' ? 'Dr. Liu Bo. All rights reserved.' : '刘波主任. 版权所有.'}
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              {t('common.home') === 'Home' 
                ? 'This website is for informational purposes only and does not constitute medical advice.' 
                : '本网站仅供参考，不构成医疗建议。'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;