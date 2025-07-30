import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  ShoppingCart,
  CloudRain,
  Sun,
  Utensils
} from 'lucide-react';
import { format } from 'date-fns';
import MapPanel from '@/components/MapPanel';

const TripDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, itineraryData } = location.state || {};
  
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Function to get coordinates for a city
  const getCityCoordinates = (city: string): [number, number] => {
    const cityCoords: { [key: string]: [number, number] } = {
      'Los Angeles': [-118.2437, 34.0522],
      'New York': [-74.0060, 40.7128],
      'Chicago': [-87.6298, 41.8781],
      'Miami': [-80.1918, 25.7617],
      'San Francisco': [-122.4194, 37.7749],
      'Las Vegas': [-115.1398, 36.1699],
      'Boston': [-71.0589, 42.3601],
      'Seattle': [-122.3321, 47.6062],
      'Denver': [-104.9903, 39.7392],
      'Austin': [-97.7431, 30.2672]
    };
    return cityCoords[city] || [-118.2437, 34.0522]; // Default to LA if city not found
  };

  // Function to get coordinates for an address using geocoding approximation
  const getLocationCoordinates = (address: string): [number, number] => {
    // Basic geocoding approximation for common LA areas
    if (address.includes('Universal City')) return [-118.3487, 34.1381];
    if (address.includes('Hollywood')) return [-118.3267, 34.0928];
    if (address.includes('Venice')) return [-118.4912, 34.0195];
    if (address.includes('Beverly Hills')) return [-118.4065, 34.0736];
    if (address.includes('Santa Monica')) return [-118.4912, 34.0195];
    if (address.includes('Downtown')) return [-118.2437, 34.0522];
    if (address.includes('Valencia')) return [-118.6009, 34.4239];
    if (address.includes('Glendale')) return [-118.2551, 34.1425];
    if (address.includes('Broadway')) return [-118.2467, 34.0458];
    
    // Default to city center
    return getCityCoordinates(itineraryData?.days?.[0]?.morning?.address?.split(',')[1]?.trim() || 'Los Angeles');
  };
  
  if (!itineraryData || !formData) {
    navigate('/');
    return null;
  }

  // Extract restaurants from itinerary days for the restaurants tab
  const restaurants = itineraryData.days?.flatMap((day: any) => {
    const dayRestaurants = [];
    if (day.lunch?.restaurant_name) {
      dayRestaurants.push({
        id: `${day.day_number}-lunch`,
        name: day.lunch.restaurant_name,
        cuisine: day.lunch.cuisine || 'Various',
        rating: 4.5,
        averagePrice: day.lunch.estimated_cost_range?.max || 25,
        description: day.lunch.rationale || 'Delicious local cuisine',
        distance: day.lunch.address || 'City center',
        coordinates: getLocationCoordinates(day.lunch.address || '')
      });
    }
    if (day.dinner?.restaurant_name) {
      dayRestaurants.push({
        id: `${day.day_number}-dinner`,
        name: day.dinner.restaurant_name,
        cuisine: day.dinner.cuisine || 'Various',
        rating: 4.3,
        averagePrice: day.dinner.estimated_cost_range?.max || 45,
        description: day.dinner.rationale || 'Perfect for dinner',
        distance: day.dinner.address || 'City center',
        coordinates: getLocationCoordinates(day.dinner.address || '')
      });
    }
    return dayRestaurants;
  }) || [];

  const handleBookTrip = () => {
    alert('Booking functionality will be integrated with payment system!');
  };

  const getWeatherIcon = (weather: string) => {
    if (weather?.toLowerCase().includes('cloud')) return <CloudRain className="w-4 h-4" />;
    if (weather?.toLowerCase().includes('clear')) return <Sun className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Back to Trip Form
          </Button>
          
          <h1 className="text-4xl font-poppins font-bold mb-4">
            Your {formData.tripLength || itineraryData.days?.length || 7}-day {formData.destination} Adventure
          </h1>
          
          {/* Trip Summary Card */}
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-primary">Your Perfect Trip</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Designed for:</span>
                      <span>Culture, entertainment & vibrant experiences</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Preferences:</span>
                      <span className="text-green-600">✓ {formData.likes?.join(', ') || 'Entertainment'}</span>
                    </p>
                    {formData.dislikes?.length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Avoiding:</span>
                        <span className="text-red-600">✗ {formData.dislikes.join(', ')}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-primary">Trip Highlights</h3>
                  <div className="space-y-2 text-sm">
                    <p>🏨 Accommodation guidance provided</p>
                    <p>🎯 Activities curated to your interests</p>
                    <p>🍽️ Dining recommendations included</p>
                    <p>🌤️ Weather-optimized itinerary</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Budget: ${itineraryData.budget_allocation?.total_trip_budget || formData.budget}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="hotels">Hotels</TabsTrigger>
                <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
              </TabsList>

              {/* Itinerary Tab */}
              <TabsContent value="itinerary" className="space-y-6">
                {itineraryData.days?.map((day: any) => (
                  <Card key={day.day_number} className="rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          Day {day.day_number} - {day.theme}
                        </div>
                        {day.weather && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getWeatherIcon(day.weather.main)}
                            <span>{day.weather.temperature_celsius}°C - {day.weather.description}</span>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Morning Activity */}
                      {day.morning && (
                         <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => setSelectedActivity({
                                name: day.morning.activity_name,
                                time: 'Morning',
                                icon: '🌅',
                                coordinates: getLocationCoordinates(day.morning.address || '')
                              })}>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-20">
                            <Clock className="w-4 h-4" />
                            Morning
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{day.morning.activity_name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{day.morning.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Duration: {day.morning.estimated_duration_hours}h</span>
                              {day.morning.estimated_cost_range?.max > 0 && (
                                <Badge variant="secondary">${day.morning.estimated_cost_range.min}-${day.morning.estimated_cost_range.max}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lunch */}
                      {day.lunch && (
                        <div className="flex gap-4 p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-20">
                            <Utensils className="w-4 h-4" />
                            Lunch
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{day.lunch.restaurant_name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{day.lunch.cuisine} - {day.lunch.rationale}</p>
                            <div className="flex items-center gap-4 text-sm">
                              {day.lunch.estimated_cost_range && (
                                <Badge variant="secondary">${day.lunch.estimated_cost_range.min}-${day.lunch.estimated_cost_range.max}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Afternoon Activity */}
                      {day.afternoon && (
                         <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => setSelectedActivity({
                                name: day.afternoon.activity_name,
                                time: 'Afternoon', 
                                icon: '☀️',
                                coordinates: getLocationCoordinates(day.afternoon.address || '')
                              })}>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-20">
                            <Clock className="w-4 h-4" />
                            Afternoon
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{day.afternoon.activity_name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{day.afternoon.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Duration: {day.afternoon.estimated_duration_hours}h</span>
                              {day.afternoon.estimated_cost_range?.max > 0 && (
                                <Badge variant="secondary">${day.afternoon.estimated_cost_range.min}-${day.afternoon.estimated_cost_range.max}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Evening Activity */}
                      {day.evening && (
                         <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => setSelectedActivity({
                                name: day.evening.activity_name,
                                time: 'Evening',
                                icon: '🌆',
                                coordinates: getLocationCoordinates(day.evening.address || '')
                              })}>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-20">
                            <Clock className="w-4 h-4" />
                            Evening
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{day.evening.activity_name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{day.evening.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Duration: {day.evening.estimated_duration_hours}h</span>
                              {day.evening.estimated_cost_range?.max > 0 && (
                                <Badge variant="secondary">${day.evening.estimated_cost_range.min}-${day.evening.estimated_cost_range.max}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dinner */}
                      {day.dinner && (
                        <div className="flex gap-4 p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-20">
                            <Utensils className="w-4 h-4" />
                            Dinner
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{day.dinner.restaurant_name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{day.dinner.cuisine} - {day.dinner.rationale}</p>
                            <div className="flex items-center gap-4 text-sm">
                              {day.dinner.estimated_cost_range && (
                                <Badge variant="secondary">${day.dinner.estimated_cost_range.min}-${day.dinner.estimated_cost_range.max}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Hotels Tab */}
              <TabsContent value="hotels" className="space-y-4">
                <Card className="rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Hotel className="w-6 h-6 text-primary" />
                      <div>
                        <h4 className="font-medium">{itineraryData.hotel_details?.name || 'Hotel Accommodation'}</h4>
                        <p className="text-sm text-muted-foreground">{itineraryData.hotel_details?.address || 'Please book separately'}</p>
                      </div>
                    </div>
                    {itineraryData.hotel_details?.total_price_for_stay && (
                      <div className="text-right">
                        <p className="text-lg font-bold">${itineraryData.hotel_details.total_price_for_stay}</p>
                        <p className="text-sm text-muted-foreground">{itineraryData.hotel_details.currency}</p>
                      </div>
                    )}
                    {!itineraryData.hotel_details?.total_price_for_stay && (
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Hotel booking required separately. Budget has been allocated to maximize your activities and experiences.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Restaurants Tab */}
              <TabsContent value="restaurants" className="space-y-4">
                <div className="grid gap-4">
                  {restaurants.map((restaurant) => (
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
          <MapPanel 
            selectedActivity={selectedActivity} 
            destinationCity={itineraryData?.days?.[0]?.morning?.address?.split(',')[1]?.trim() || 'Los Angeles'}
            destinationCoordinates={getCityCoordinates(itineraryData?.days?.[0]?.morning?.address?.split(',')[1]?.trim() || 'Los Angeles')}
          />
            
            {/* Budget Summary */}
            <Card className="rounded-xl sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Budget Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {itineraryData.budget_allocation && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Food Budget</span>
                        <span>${itineraryData.budget_allocation.food_budget_total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Activities Budget</span>
                        <span>${itineraryData.budget_allocation.activities_budget_total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Transportation</span>
                        <span>${itineraryData.budget_allocation.transportation_budget}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shopping Budget</span>
                        <span>${itineraryData.budget_allocation.shopping_budget}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Budget</span>
                      <span className="text-2xl font-bold text-primary">${itineraryData.budget_allocation.total_trip_budget}</span>
                    </div>
                  </>
                )}

                <Button 
                  onClick={handleBookTrip}
                  className="w-full rounded-xl text-lg py-6"
                >
                  Start Planning
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