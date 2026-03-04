import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n/i18n';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TechnologyPage from './pages/TechnologyPage';

import AssessmentPage from './pages/AssessmentPage';
import CasesPage from './pages/CasesPage';

import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import BlogDraftsPage from './pages/BlogDraftsPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import FreeGuidePage from './pages/FreeGuidePage';


function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set the document title based on the current language
    document.title = i18n.language === 'en' 
      ? 'Dr. Liu Bo | POCS Gallstone Treatment Expert' 
      : '刘波主任 | 胆结石微创POCS治疗专家';
  }, [i18n.language]);

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/technology" element={<TechnologyPage />} />

            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/articles/*" element={<Navigate to="/blog" replace />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/blog/drafts" element={<BlogDraftsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/free-guide" element={<FreeGuidePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
