import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, MapPin, DollarSign, Calendar as CalendarIcon, Heart, X, Users, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FormData {
  budget: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  destination: string;
  adults: number;
  children: number;
  rooms: number;
  likes: string[];
  dislikes: string[];
}

interface DestinationSuggestion {
  place_id: string;
  display_name: string;
  city: string;
  country: string;
}

const TripForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    budget: '',
    startDate: undefined,
    endDate: undefined,
    destination: '',
    adults: 2,
    children: 0,
    rooms: 1,
    likes: [],
    dislikes: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [destinationSuggestions, setDestinationSuggestions] = useState<DestinationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  // Search for destination suggestions using Nominatim API
  const searchDestinations = async (query: string) => {
    if (query.length < 3) {
      setDestinationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=us,ca,mx,gb,fr,de,it,es,jp,au,nz,th,sg,my,in,cn,kr&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      const suggestions: DestinationSuggestion[] = data
        .filter((item: any) => item.address && (item.address.city || item.address.town || item.address.village))
        .map((item: any) => ({
          place_id: item.place_id,
          display_name: item.display_name,
          city: item.address.city || item.address.town || item.address.village,
          country: item.address.country
        }))
        .slice(0, 5);
      
      setDestinationSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching destination suggestions:', error);
      setDestinationSuggestions([]);
    }
  };

  const handleDestinationChange = (value: string) => {
    setFormData(prev => ({ ...prev, destination: value }));
    setShowSuggestions(true);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout to search after user stops typing
    const newTimeout = setTimeout(() => {
      searchDestinations(value);
    }, 300);
    
    setSearchTimeout(newTimeout);
  };

  const selectDestination = (suggestion: DestinationSuggestion) => {
    const destinationString = `${suggestion.city}, ${suggestion.country}`;
    setFormData(prev => ({ ...prev, destination: destinationString }));
    setShowSuggestions(false);
    setDestinationSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        destinationInputRef.current &&
        suggestionsRef.current &&
        !destinationInputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Parse destination to get city and country
      const destinationParts = formData.destination.split(',').map(part => part.trim());
      const destinationCity = destinationParts[0] || formData.destination;
      const destinationCountry = destinationParts[1] || 'Unknown';

      // Format dates for API
      const checkInDate = formData.startDate?.toISOString().split('T')[0];
      const checkOutDate = formData.endDate?.toISOString().split('T')[0];

      const apiPayload = {
        budget: parseFloat(formData.budget),
        destination_city: destinationCity,
        destination_country: destinationCountry,
        likes: formData.likes,
        dislikes: formData.dislikes.length > 0 ? formData.dislikes : undefined,
        check_in_date: checkInDate,
        check_out_date: checkOutDate
      };

      console.log('Sending API request:', apiPayload);

      const response = await fetch('http://localhost:3001/api/v1/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const itineraryData = await response.json();
      console.log('Received itinerary:', itineraryData);
      
      setIsLoading(false);
      // Navigate directly to trip details with the real itinerary data
      navigate('/trip-details/1', { 
        state: { 
          formData, 
          itineraryData 
        } 
      });
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast({
        title: "Error",
        description: "Failed to generate itinerary. Please make sure the backend is running and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <section id="trip-form" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-poppins font-bold mb-4">
              Plan Your <span className="bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">Perfect Trip</span>
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
                <div className="space-y-2 relative">
                  <Label htmlFor="destination" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Destination
                  </Label>
                  <div className="relative">
                    <Input
                      ref={destinationInputRef}
                      id="destination"
                      type="text"
                      placeholder="San Francisco, United States"
                      className="rounded-xl"
                      value={formData.destination}
                      onChange={(e) => handleDestinationChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      required
                      autoComplete="off"
                    />
                    
                    {/* Destination Suggestions */}
                    {showSuggestions && destinationSuggestions.length > 0 && (
                      <div
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto"
                      >
                        {destinationSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.place_id}
                            className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                            onClick={() => selectDestination(suggestion)}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{suggestion.city}, {suggestion.country}</div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {suggestion.display_name}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* People & Rooms */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Travelers & Rooms
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Adults */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Adults</Label>
                      <div className="flex items-center justify-between bg-muted rounded-xl p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            adults: Math.max(1, prev.adults - 1) 
                          }))}
                          disabled={formData.adults <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-medium text-lg">{formData.adults}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            adults: Math.min(10, prev.adults + 1) 
                          }))}
                          disabled={formData.adults >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Children</Label>
                      <div className="flex items-center justify-between bg-muted rounded-xl p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            children: Math.max(0, prev.children - 1) 
                          }))}
                          disabled={formData.children <= 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-medium text-lg">{formData.children}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            children: Math.min(10, prev.children + 1) 
                          }))}
                          disabled={formData.children >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Rooms</Label>
                      <div className="flex items-center justify-between bg-muted rounded-xl p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            rooms: Math.max(1, prev.rooms - 1) 
                          }))}
                          disabled={formData.rooms <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-medium text-lg">{formData.rooms}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            rooms: Math.min(5, prev.rooms + 1) 
                          }))}
                          disabled={formData.rooms >= 5}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
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