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
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-10" />
      
      {/* Hero content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-poppins font-bold mb-6 leading-tight">
              <span className="text-primary">Trips</span> that match{' '}
              <span className="text-secondary">your taste</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Discover personalized travel experiences powered by AI. Tell us your preferences, 
              and we'll craft the perfect itinerary just for you.
            </p>
            
            <Button 
              onClick={scrollToForm}
              size="lg"
              className="text-lg px-8 py-6 rounded-xl shadow-elegant hover:shadow-lg transition-smooth"
            >
              Plan my trip
            </Button>
          </div>
          
          {/* Right column - Hero image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroGlobe} 
                alt="AI Travel Planning Globe" 
                className="w-full h-auto rounded-2xl shadow-card"
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-xl" />
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;