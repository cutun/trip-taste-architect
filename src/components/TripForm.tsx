import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, MapPin, DollarSign, Calendar as CalendarIcon, Heart, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FormData {
  budget: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  destination: string;
  likes: string[];
  dislikes: string[];
}

const TripForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    budget: '',
    startDate: undefined,
    endDate: undefined,
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
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/generate-trips', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const trips = await response.json();
      
      // For now, simulate API call and navigate to trip selection
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to trip selection with form data as state
        navigate('/trip-selection', { state: formData });
      }, 2000);
    } catch (error) {
      console.error('Error generating trips:', error);
      setIsLoading(false);
    }
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
                {/* Budget & Dates Row */}
                <div className="grid md:grid-cols-3 gap-6">
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

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      Start Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal rounded-xl",
                            !formData.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      End Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal rounded-xl",
                            !formData.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                          disabled={(date) => date < (formData.startDate || new Date())}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
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