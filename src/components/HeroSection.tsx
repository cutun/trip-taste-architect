
import React from 'react';
import { Button } from '@/components/ui/button';
import heroGlobe from '@/assets/hero-globe.jpg';

const HeroSection = () => {
  const scrollToForm = () => {
    const formElement = document.getElementById('trip-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/1ab10f6b-8ae3-4dc7-a042-e7ac024910e1.png')`
        }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Hero content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl lg:text-7xl font-poppins font-bold mb-6 leading-tight text-white">
            <span className="text-white">Trips</span> that match{' '}
            <span className="text-white/90">your taste</span>
          </h1>
          
          <p className="text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">
            Discover personalized travel experiences powered by AI. Tell us your preferences, 
            and we'll craft the perfect itinerary just for you.
          </p>
          
          <Button 
            onClick={scrollToForm}
            size="lg"
            className="text-lg px-8 py-6 rounded-xl shadow-elegant hover:shadow-lg transition-smooth bg-white text-black hover:bg-white/90"
          >
            Plan my trip
          </Button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
