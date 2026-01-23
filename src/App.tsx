import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ClinicPage from './pages/ClinicPage';
import AssessmentPage from './pages/AssessmentPage';
import CasesPage from './pages/CasesPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';

// 具体文章页面
import GallstonePrevention from './pages/articles/GallstonePrevention';
import DietaryGuidance from './pages/articles/DietaryGuidance';
import LiverHealth from './pages/articles/LiverHealth';
import PostSurgeryRecovery from './pages/articles/PostSurgeryRecovery';

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
            <Route path="/clinic" element={<ClinicPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:articleId" element={<ArticleDetailPage />} />
            <Route path="/articles/gallstone-prevention" element={<GallstonePrevention />} />
            <Route path="/articles/dietary-guidance" element={<DietaryGuidance />} />
            <Route path="/articles/liver-health" element={<LiverHealth />} />
            <Route path="/articles/post-surgery-recovery" element={<PostSurgeryRecovery />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;