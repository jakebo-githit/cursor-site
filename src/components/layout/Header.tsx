import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Stethoscope, Menu, X, Globe } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  const navItems = [
    { name: t('common.home'), path: '/' },
    { name: t('common.about'), path: '/about' },
    { name: t('common.technology'), path: '/technology' },
    { name: t('common.clinic'), path: '/clinic' },
    { name: t('common.cases'), path: '/cases' },
    { name: t('common.blog'), path: '/blog' },
    { name: t('common.articles'), path: '/articles' },
    { name: t('common.faq'), path: '/faq' },
    { name: t('common.contact'), path: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-soft py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-primary-900 hover:text-primary-700 transition-colors"
          >
            <Stethoscope size={32} className="text-primary" />
            <span className={`text-xl md:text-2xl font-serif font-semibold ${
              isScrolled ? 'text-primary-800' : 'text-primary-800 md:text-white'
            }`}>
              {i18n.language === 'zh' ? '刘波主任' : 'Dr. Liu Bo'}
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  isScrolled ? 'text-primary-800' : 'md:text-white'
                } hover:text-secondary transition-colors text-base-plus font-medium ${
                  location.pathname === item.path ? 'border-b-2 border-secondary' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Language Switch */}
            <button 
              onClick={toggleLanguage}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${
                isScrolled ? 'text-primary-800 border-primary-300' : 'text-white border-white/50'
              } hover:bg-primary-50 hover:text-primary-800 transition-colors`}
            >
              <Globe size={16} />
              <span className="text-sm font-medium">{i18n.language === 'zh' ? 'EN' : '中文'}</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md ${
                isScrolled ? 'text-primary-800' : 'text-primary-800 md:text-white'
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-white shadow-md"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-primary-800 hover:text-secondary transition-colors py-2 px-4 ${
                    location.pathname === item.path ? 'bg-primary-50 font-medium' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Language Switch */}
              <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-1 py-2 px-4 text-primary-800"
              >
                <Globe size={16} />
                <span>{i18n.language === 'zh' ? 'Switch to English' : '切换到中文'}</span>
              </button>
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;