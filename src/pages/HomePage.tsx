import React from 'react';
import HeroSection from '../components/home/HeroSection';
import DoctorIntroSection from '../components/home/DoctorIntroSection';
import TestimonialSection from '../components/home/TestimonialSection';
import TechnologyPreviewSection from '../components/home/TechnologyPreviewSection';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <DoctorIntroSection />
      <TechnologyPreviewSection />
      <TestimonialSection />
    </>
  );
};

export default HomePage;