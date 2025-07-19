import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, DollarSign, Calendar, Heart, X } from 'lucide-react';

interface FormData {
  budget: string;
  tripLength: number[];
  destination: string;
  likes: string[];
  dislikes: string[];
}

const TripForm = () => {
  const [formData, setFormData] = useState<FormData>({
    budget: '',
    tripLength: [7],
    destination: '',
    likes: [],
    dislikes: []
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Predefined options for likes/dislikes
  const preferenceOptions = [
    'Live Music', 'Street Food', 'Museums', 'Nightlife', 'Adventure Sports',
    'Beach', 'Mountains', 'Cultural Sites', 'Photography', 'Shopping',
    'Fine Dining', 'Local Markets', 'Architecture', 'Nature Walks', 'Art Galleries',
    'Festivals', 'Historic Sites', 'Spa & Wellness', 'Wildlife', 'Local Transport'
  ];

  const togglePreference = (option: string, type: 'likes' | 'dislikes') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(option) 
        ? prev[type].filter(item => item !== option)
        : [...prev[type], option]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: API call to generate itinerary
    console.log('Form data:', formData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // TODO: Redirect to itinerary page
      alert('Itinerary generation coming soon!');
    }, 3000);
  };

  return (
    <section id="trip-form" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-poppins font-bold mb-4">
              Plan Your Perfect Trip
            </h2>
            <p className="text-lg text-muted-foreground">
              Tell us about your preferences and we'll create a personalized itinerary
            </p>
          </div>

          <Card className="rounded-xl shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl font-poppins">Trip Details</CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Budget & Trip Length Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Budget */}
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Budget (USD)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="2000"
                        className="pl-8 rounded-xl"
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* Trip Length */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Trip Length: {formData.tripLength[0]} {formData.tripLength[0] === 1 ? 'day' : 'days'}
                    </Label>
                    <Slider
                      value={formData.tripLength}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tripLength: value }))}
                      max={21}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1 day</span>
                      <span>21 days</span>
                    </div>
                  </div>
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <Label htmlFor="destination" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Destination
                  </Label>
                  <Input
                    id="destination"
                    type="text"
                    placeholder="Tokyo, Japan"
                    className="rounded-xl"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    required
                  />
                </div>

                {/* Likes */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    What do you love? (Select all that apply)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {preferenceOptions.map((option) => (
                      <Badge
                        key={option}
                        variant={formData.likes.includes(option) ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-smooth rounded-full px-4 py-2"
                        onClick={() => togglePreference(option, 'likes')}
                      >
                        {option}
                        {formData.likes.includes(option) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Dislikes */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <X className="w-4 h-4 text-destructive" />
                    What would you prefer to avoid? (Optional)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {preferenceOptions.map((option) => (
                      <Badge
                        key={option}
                        variant={formData.dislikes.includes(option) ? "destructive" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-smooth rounded-full px-4 py-2"
                        onClick={() => togglePreference(option, 'dislikes')}
                      >
                        {option}
                        {formData.dislikes.includes(option) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full text-lg py-6 rounded-xl shadow-elegant hover:shadow-lg transition-smooth"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Your Perfect Itinerary...
                      </>
                    ) : (
                      'Generate Itinerary'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TripForm;