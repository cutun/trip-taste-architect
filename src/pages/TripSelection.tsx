import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Calendar, Users, Star } from 'lucide-react';
import { format } from 'date-fns';

// Mock data - replace with actual API response when backend is ready
const mockTripOptions = [
  {
    id: '1',
    title: 'Cultural Tokyo Experience',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    duration: '7 days',
    price: 1800,
    rating: 4.9,
    highlights: ['Traditional Temples', 'Sushi Making', 'Cherry Blossoms', 'Modern Art'],
    description: 'Immerse yourself in Tokyo\'s rich culture with visits to ancient temples, modern art galleries, and authentic culinary experiences.'
  },
  {
    id: '2', 
    title: 'Adventure Tokyo Journey',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    duration: '7 days',
    price: 2200,
    rating: 4.7,
    highlights: ['Mount Fuji Hiking', 'Robot Restaurant', 'Theme Parks', 'Night Markets'],
    description: 'Experience Tokyo\'s adventurous side with outdoor activities, unique entertainment, and thrilling attractions.'
  },
  {
    id: '3',
    title: 'Luxury Tokyo Getaway', 
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&h=300&fit=crop',
    duration: '7 days',
    price: 3500,
    rating: 4.8,
    highlights: ['Michelin Restaurants', 'Luxury Hotels', 'Private Tours', 'Spa Treatments'],
    description: 'Indulge in Tokyo\'s finest offerings with premium accommodations, world-class dining, and exclusive experiences.'
  }
];

const TripSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state;

  const handleSelectTrip = (tripId: string) => {
    // TODO: API call to get detailed trip plan
    // const response = await fetch(`/api/trips/${tripId}/details`);
    // const tripDetails = await response.json();
    
    // For now, navigate to detailed trip plan with trip ID
    navigate(`/trip-details/${tripId}`, { 
      state: { 
        formData, 
        tripId,
        selectedTrip: mockTripOptions.find(trip => trip.id === tripId)
      }
    });
  };

  if (!formData) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-poppins font-bold mb-4">
            Perfect Trips for {formData.destination}
          </h1>
          <div className="flex justify-center items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {formData.startDate ? format(formData.startDate, 'MMM dd') : 'TBD'} - {formData.endDate ? format(formData.endDate, 'MMM dd') : 'TBD'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Budget: ${formData.budget}</span>
            </div>
          </div>
        </div>

        {/* Trip Options Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {mockTripOptions.map((trip) => (
            <Card key={trip.id} className="rounded-xl shadow-card hover:shadow-lg transition-smooth overflow-hidden">
              <div className="relative">
                <img 
                  src={trip.image} 
                  alt={trip.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-background/90 rounded-full px-3 py-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{trip.rating}</span>
                  </div>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl font-poppins">{trip.title}</CardTitle>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{trip.duration}</span>
                  <span className="text-2xl font-bold text-primary">${trip.price}</span>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground mb-4">{trip.description}</p>
                
                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Highlights:</h4>
                  <div className="flex flex-wrap gap-2">
                    {trip.highlights.map((highlight) => (
                      <Badge key={highlight} variant="secondary" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => handleSelectTrip(trip.id)}
                  className="w-full rounded-xl"
                >
                  View Details & Book
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="rounded-xl"
          >
            ← Back to Trip Form
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TripSelection;