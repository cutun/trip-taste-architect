import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Clock, 
  Plane, 
  Hotel, 
  Car,
  Star,
  Users,
  ShoppingCart
} from 'lucide-react';
import { format } from 'date-fns';
import MapPanel from '@/components/MapPanel';

// Mock detailed trip data - replace with actual API response
const mockTripDetails = {
  '1': {
    title: 'Cultural Tokyo Experience',
    totalPrice: 1800,
    itinerary: [
      {
        day: 1,
        date: '2024-03-15',
        activities: [
          {
            time: '09:00',
            title: 'Senso-ji Temple Visit',
            duration: '2 hours',
            price: 0,
            description: 'Explore Tokyo\'s oldest temple in Asakusa'
          },
          {
            time: '14:00', 
            title: 'Traditional Sushi Making Class',
            duration: '3 hours',
            price: 120,
            description: 'Learn from a master sushi chef'
          }
        ]
      },
      {
        day: 2,
        date: '2024-03-16',
        activities: [
          {
            time: '10:00',
            title: 'Tokyo National Museum',
            duration: '3 hours',
            price: 25,
            description: 'Discover Japanese art and artifacts'
          }
        ]
      }
    ],
    flights: [
      {
        id: 'flight1',
        airline: 'JAL',
        route: 'NYC → Tokyo',
        departure: '2024-03-14 18:00',
        arrival: '2024-03-15 22:00',
        price: 680,
        class: 'Economy',
        selected: true
      },
      {
        id: 'flight2', 
        airline: 'ANA',
        route: 'NYC → Tokyo',
        departure: '2024-03-14 20:30',
        arrival: '2024-03-16 00:30',
        price: 720,
        class: 'Economy',
        selected: false
      }
    ],
    hotels: [
      {
        id: 'hotel1',
        name: 'Park Hyatt Tokyo',
        location: 'Shinjuku',
        rating: 4.8,
        pricePerNight: 250,
        nights: 7,
        amenities: ['Spa', 'Pool', 'Gym', 'Restaurant'],
        selected: true
      },
      {
        id: 'hotel2',
        name: 'Aman Tokyo',
        location: 'Otemachi', 
        rating: 4.9,
        pricePerNight: 400,
        nights: 7,
        amenities: ['Spa', 'Pool', 'Gym', 'Restaurant', 'Concierge'],
        selected: false
      }
    ],
    restaurants: [
      {
        id: 'rest1',
        name: 'Sushi Yoshitake',
        cuisine: 'Japanese Sushi',
        rating: 4.9,
        averagePrice: 350,
        description: 'Three Michelin starred sushi restaurant with exceptional omakase experience.',
        distance: '0.3 miles from hotel',
        coordinates: [139.7640, 35.6762]
      },
      {
        id: 'rest2',
        name: 'Ramen Ichiran',
        cuisine: 'Japanese Ramen',
        rating: 4.3,
        averagePrice: 15,
        description: 'Famous tonkotsu ramen chain with individual booth seating.',
        distance: '0.1 miles from hotel',
        coordinates: [139.7009, 35.6598]
      },
      {
        id: 'rest3',
        name: 'Tsukiji Outer Market',
        cuisine: 'Street Food',
        rating: 4.6,
        averagePrice: 25,
        description: 'Fresh seafood and traditional Japanese street food market.',
        distance: '1.2 miles from hotel',
        coordinates: [139.7673, 35.6655]
      },
      {
        id: 'rest4',
        name: 'Nabezo Shibuya',
        cuisine: 'Japanese BBQ',
        rating: 4.1,
        averagePrice: 45,
        description: 'All-you-can-eat yakiniku and shabu-shabu with premium wagyu beef.',
        distance: '0.5 miles from hotel',
        coordinates: [139.7005, 35.6591]
      }
    ]
  }
};

const TripDetails = () => {
  const { tripId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, selectedTrip } = location.state || {};
  
  const [selectedFlightId, setSelectedFlightId] = useState('flight1');
  const [selectedHotelId, setSelectedHotelId] = useState('hotel1');
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  const tripDetails = mockTripDetails[tripId as keyof typeof mockTripDetails];
  
  if (!tripDetails || !formData) {
    navigate('/');
    return null;
  }

  const handleBookTrip = () => {
    // TODO: API call to book the trip with selected options
    // const bookingData = {
    //   tripId,
    //   flightId: selectedFlightId,
    //   hotelId: selectedHotelId,
    //   userPreferences: formData
    // };
    // const response = await fetch('/api/book-trip', {
    //   method: 'POST',
    //   body: JSON.stringify(bookingData)
    // });
    
    alert('Booking functionality will be integrated with payment system!');
  };

  const selectedFlight = tripDetails.flights.find(f => f.id === selectedFlightId);
  const selectedHotel = tripDetails.hotels.find(h => h.id === selectedHotelId);
  const totalPrice = (selectedFlight?.price || 0) + (selectedHotel?.pricePerNight || 0) * (selectedHotel?.nights || 0);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/trip-selection', { state: formData })}
            className="mb-4"
          >
            ← Back to Trip Options
          </Button>
          
          <h1 className="text-4xl font-poppins font-bold mb-4">{tripDetails.title}</h1>
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{formData.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {formData.startDate ? format(formData.startDate, 'MMM dd') : 'TBD'} - {formData.endDate ? format(formData.endDate, 'MMM dd') : 'TBD'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="itinerary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="flights">Flights</TabsTrigger>
              <TabsTrigger value="hotels">Hotels</TabsTrigger>
              <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            </TabsList>

              {/* Itinerary Tab */}
              <TabsContent value="itinerary" className="space-y-6">
                {tripDetails.itinerary.map((day) => (
                  <Card key={day.day} className="rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Day {day.day} - {format(new Date(day.date), 'EEEE, MMM dd')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {day.activities.map((activity, idx) => (
                         <div key={idx} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => setSelectedActivity({
                                name: activity.title,
                                time: activity.time,
                                icon: '📍',
                                coordinates: [139.6917 + Math.random() * 0.1, 35.6895 + Math.random() * 0.1] // Mock coordinates around Tokyo
                              })}>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-20">
                             <Clock className="w-4 h-4" />
                             {activity.time}
                           </div>
                           <div className="flex-1">
                             <h4 className="font-medium mb-1">{activity.title}</h4>
                             <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                             <div className="flex items-center gap-4 text-sm">
                               <span className="text-muted-foreground">Duration: {activity.duration}</span>
                               {activity.price > 0 && (
                                 <Badge variant="secondary">${activity.price}</Badge>
                               )}
                             </div>
                           </div>
                         </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Flights Tab */}
              <TabsContent value="flights" className="space-y-4">
                {tripDetails.flights.map((flight) => (
                  <Card 
                    key={flight.id} 
                    className={`rounded-xl cursor-pointer transition-smooth ${
                      selectedFlightId === flight.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedFlightId(flight.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Plane className="w-6 h-6 text-primary" />
                          <div>
                            <h4 className="font-medium">{flight.airline}</h4>
                            <p className="text-sm text-muted-foreground">{flight.route}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${flight.price}</p>
                          <p className="text-sm text-muted-foreground">{flight.class}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Departure: {format(new Date(flight.departure), 'MMM dd, HH:mm')}</span>
                        <span>Arrival: {format(new Date(flight.arrival), 'MMM dd, HH:mm')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Hotels Tab */}
              <TabsContent value="hotels" className="space-y-4">
                {tripDetails.hotels.map((hotel) => (
                  <Card 
                    key={hotel.id}
                    className={`rounded-xl cursor-pointer transition-smooth ${
                      selectedHotelId === hotel.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedHotelId(hotel.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Hotel className="w-6 h-6 text-primary" />
                          <div>
                            <h4 className="font-medium">{hotel.name}</h4>
                            <p className="text-sm text-muted-foreground">{hotel.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <span className="font-medium">{hotel.rating}</span>
                          </div>
                          <p className="text-lg font-bold">${hotel.pricePerNight}/night</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Restaurants Tab */}
              <TabsContent value="restaurants" className="space-y-4">
                <div className="grid gap-4">
                  {tripDetails.restaurants.map((restaurant) => (
                    <Card key={restaurant.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedActivity({
                            name: restaurant.name,
                            time: restaurant.cuisine,
                            icon: '🍽️',
                            coordinates: restaurant.coordinates
                          })}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{restaurant.name}</h4>
                          <p className="text-muted-foreground text-sm mb-2">{restaurant.cuisine}</p>
                          <p className="text-sm mb-2">{restaurant.description}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < restaurant.rating ? 'text-yellow-500' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ({restaurant.rating}/5)
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Average meal: ${restaurant.averagePrice}
                          </p>
                        </div>
                        <div className="text-right">
                          <Button variant="outline" size="sm" className="mb-2">
                            View Menu
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            {restaurant.distance}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Map Panel */}
            <MapPanel selectedActivity={selectedActivity} />
            
            {/* Booking Summary */}
            <Card className="rounded-xl sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Flight Summary */}
                {selectedFlight && (
                  <div>
                    <h4 className="font-medium mb-2">Flight</h4>
                    <div className="text-sm space-y-1">
                      <p>{selectedFlight.airline} - {selectedFlight.class}</p>
                      <p className="text-muted-foreground">{selectedFlight.route}</p>
                      <p className="font-medium text-primary">${selectedFlight.price}</p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Hotel Summary */}
                {selectedHotel && (
                  <div>
                    <h4 className="font-medium mb-2">Accommodation</h4>
                    <div className="text-sm space-y-1">
                      <p>{selectedHotel.name}</p>
                      <p className="text-muted-foreground">{selectedHotel.nights} nights</p>
                      <p className="font-medium text-primary">
                        ${selectedHotel.pricePerNight} × {selectedHotel.nights} = ${selectedHotel.pricePerNight * selectedHotel.nights}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Trip Cost</span>
                    <span className="text-2xl font-bold text-primary">${totalPrice}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Budget: ${formData.budget} {totalPrice <= parseInt(formData.budget) ? '✅' : '⚠️ Over budget'}
                  </p>
                </div>

                <Button 
                  onClick={handleBookTrip}
                  className="w-full rounded-xl text-lg py-6"
                  disabled={totalPrice > parseInt(formData.budget)}
                >
                  Book This Trip
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;