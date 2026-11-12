import React from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import DoctorIntroSection from '../components/home/DoctorIntroSection';
import TestimonialSection from '../components/home/TestimonialSection';
import TechnologyPreviewSection from '../components/home/TechnologyPreviewSection';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <section className="bg-primary-50 py-8 border-y border-primary-100"><div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"><div><p className="text-sm font-semibold text-secondary-600 mb-2">海外华人健康指南 · NEW</p><h2 className="text-2xl font-semibold text-primary-900">身在海外，看病遇到困难怎么办？</h2><p className="text-gray-700 mt-2 max-w-2xl">语言不通、医疗信息难懂、专科等待漫长？了解就医沟通常识、医学第二意见的合规路径，以及来华就医需要做的准备。</p></div><Link to="/overseas-care" className="shrink-0 inline-flex rounded-md bg-secondary text-white px-6 py-3 hover:bg-secondary-600">阅读海外华人健康指南 →</Link></div></section>
      <DoctorIntroSection />
      <TechnologyPreviewSection />
      <TestimonialSection />
    </>
  );
};

export default HomePage;