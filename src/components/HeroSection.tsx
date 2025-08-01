import React from 'react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const scrollToForm = () => {
    const formElement = document.getElementById('trip-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/lovable-uploads/ac446475-1475-4c71-bec1-87ea8d9a9a7f.png)' }}
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/50" />
      
      {/* Hero content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center">
          <h1 className="text-5xl lg:text-7xl font-poppins font-bold mb-6 leading-tight">
            <span className="text-primary">Trips</span> that match{' '}
            <span className="text-muted-foreground">your taste</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
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