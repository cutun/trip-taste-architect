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

  // Function to get coordinates for an address or activity
  const getLocationCoordinates = (activity: any, address?: string): [number, number] => {
    // Use coordinates from API if available
    if (activity?.lat && activity?.lon) {
      return [activity.lon, activity.lat];
    }
    
    // Fallback to address-based approximation for specific areas
    const addressToCheck = address || activity?.address || '';
    if (addressToCheck.includes('Universal City')) return [-118.3487, 34.1381];
    if (addressToCheck.includes('Hollywood')) return [-118.3267, 34.0928];
    if (addressToCheck.includes('Venice')) return [-118.4912, 34.0195];
    if (addressToCheck.includes('Beverly Hills')) return [-118.4065, 34.0736];
    if (addressToCheck.includes('Santa Monica')) return [-118.4912, 34.0195];
    if (addressToCheck.includes('Downtown')) return [-118.2437, 34.0522];
    if (addressToCheck.includes('Valencia')) return [-118.6009, 34.4239];
    if (addressToCheck.includes('Glendale')) return [-118.2551, 34.1425];
    if (addressToCheck.includes('Broadway')) return [-118.2467, 34.0458];
    
    // Default to destination city center
    const destinationCity = formData?.destination?.split(',')[0]?.trim() || 'Los Angeles';
    return getCityCoordinates(destinationCity);
  };
  
  if (!itineraryData || !formData) {
    navigate('/');
    return null;
  }

  // Calculate trip length in nights
  const tripLengthInNights = formData.startDate && formData.endDate 
    ? Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))
    : itineraryData.days?.length || 7;

  // Calculate actual per-night prices and accommodation budget impact
  const calculateAccommodationBudget = () => {
    const totalBudget = itineraryData.budget_allocation?.total_trip_budget || parseFloat(formData.budget) || 0;
    const otherExpenses = (itineraryData.budget_allocation?.food_budget_total || 0) +
                         (itineraryData.budget_allocation?.activities_budget_total || 0) +
                         (itineraryData.budget_allocation?.transportation_budget || 0) +
                         (itineraryData.budget_allocation?.shopping_budget || 0);
    
    const remainingBudget = totalBudget - otherExpenses;
    
    const primaryHotelTotal = itineraryData.hotel_details?.total_price_for_stay || 0;
    const primaryHotelPerNight = primaryHotelTotal / tripLengthInNights;
    
    const accommodationOverflow = primaryHotelTotal - remainingBudget;
    
    return {
      remainingBudget,
      primaryHotelTotal,
      primaryHotelPerNight,
      accommodationOverflow,
      hasOverflow: accommodationOverflow > 0
    };
  };

  const accommodationBudget = calculateAccommodationBudget();

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
        coordinates: getLocationCoordinates(day.lunch, day.lunch.address)
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
        coordinates: getLocationCoordinates(day.dinner, day.dinner.address)
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
                      <span className="text-green-600 font-medium">{formData.likes?.join(', ') || 'Entertainment'}</span>
                    </p>
                    {formData.dislikes?.length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Avoiding:</span>
                        <span className="text-red-600 font-medium">{formData.dislikes.join(', ')}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-primary">Trip Highlights</h3>
                  <div className="space-y-2 text-sm">
                    <p>• Accommodation guidance provided</p>
                    <p>• Activities curated to your interests</p>
                    <p>• Dining recommendations included</p>
                    <p>• Weather-optimized itinerary</p>
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
                {itineraryData.days?.filter((day: any) => day.theme !== "Departure").map((day: any) => (
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
                                coordinates: getLocationCoordinates(day.morning, day.morning.address)
                              })}>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-20">
                            <Clock className="w-4 h-4" />
                            Morning
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{day.morning.activity_name || 'Activity'}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{day.morning.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Duration: {day.morning.estimated_duration_hours || 2}h</span>
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
                            <h4 className="font-medium mb-1">{day.lunch.restaurant_name || 'Restaurant'}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{day.lunch.cuisine || 'Cuisine'} - {day.lunch.rationale || 'Great local option'}</p>
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
                                coordinates: getLocationCoordinates(day.afternoon, day.afternoon.address)
                              })}>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-20">
                            <Clock className="w-4 h-4" />
                            Afternoon
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{day.afternoon.activity_name || 'Activity'}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{day.afternoon.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Duration: {day.afternoon.estimated_duration_hours || 2}h</span>
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
                                coordinates: getLocationCoordinates(day.evening, day.evening.address)
                              })}>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-20">
                            <Clock className="w-4 h-4" />
                            Evening
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{day.evening.activity_name || 'Activity'}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{day.evening.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Duration: {day.evening.estimated_duration_hours || 2}h</span>
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
                            <h4 className="font-medium mb-1">{day.dinner.restaurant_name || 'Restaurant'}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{day.dinner.cuisine || 'Cuisine'} - {day.dinner.rationale || 'Perfect dining experience'}</p>
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
                {/* Primary Hotel */}
                <Card className="rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <Hotel className="w-6 h-6 text-primary" />
                        <div>
                          <h4 className="font-medium text-lg">{itineraryData.hotel_details?.name || 'Hotel Accommodation Required'}</h4>
                          <p className="text-sm text-muted-foreground">{itineraryData.hotel_details?.address || 'Please book separately'}</p>
                          {itineraryData.hotel_details?.hotelId && (
                            <p className="text-xs text-muted-foreground">Hotel ID: {itineraryData.hotel_details.hotelId}</p>
                          )}
                        </div>
                      </div>
                      {itineraryData.hotel_details?.total_price_for_stay && (
                        <div className="text-right">
                          <div className="mb-2">
                            <p className="text-lg font-bold">${accommodationBudget.primaryHotelPerNight.toFixed(0)}</p>
                            <p className="text-xs text-muted-foreground">per night</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-primary">${itineraryData.hotel_details.total_price_for_stay}</p>
                            <p className="text-sm text-muted-foreground">Total ({tripLengthInNights} nights) • {itineraryData.hotel_details.currency}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {itineraryData.hotel_details?.rationale && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Why this hotel:</strong> {itineraryData.hotel_details.rationale}
                        </p>
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

                {/* Alternative Hotels */}
                {itineraryData.alternative_hotel_options?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Alternative Options</h3>
                    <div className="space-y-4">
                      {itineraryData.alternative_hotel_options.map((hotel: any, index: number) => (
                        <Card key={index} className="rounded-xl">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                <Hotel className="w-5 h-5 text-muted-foreground" />
                                <div>
                                  <h4 className="font-medium">{hotel.name}</h4>
                                  <p className="text-sm text-muted-foreground">{hotel.address}</p>
                                  {hotel.hotelId && (
                                    <p className="text-xs text-muted-foreground">Hotel ID: {hotel.hotelId}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="mb-2">
                                  <p className="text-lg font-bold">${(hotel.price_per_night / tripLengthInNights).toFixed(0)}</p>
                                  <p className="text-xs text-muted-foreground">per night</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-red-600">${hotel.price_per_night}</p>
                                  <p className="text-sm text-muted-foreground">Total ({tripLengthInNights} nights) • {hotel.currency}</p>
                                </div>
                              </div>
                            </div>
                            {hotel.rationale && (
                              <div className="mt-3 bg-muted/50 p-3 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                  {hotel.rationale}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
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
            destinationCity={formData?.destination?.split(',')[0]?.trim() || 'Los Angeles'}
            destinationCoordinates={getCityCoordinates(formData?.destination?.split(',')[0]?.trim() || 'Los Angeles')}
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
                       {accommodationBudget.primaryHotelTotal > 0 && (
                         <div className="flex justify-between text-sm">
                           <span>Accommodation</span>
                           <span className={accommodationBudget.hasOverflow ? "text-red-600 font-medium" : ""}>
                             ${accommodationBudget.primaryHotelTotal}
                           </span>
                         </div>
                       )}
                     </div>

                     <Separator />

                     {accommodationBudget.hasOverflow && (
                       <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                         <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                           ⚠️ Budget Overflow: ${accommodationBudget.accommodationOverflow.toFixed(0)} over budget
                         </p>
                         <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                           Consider alternative hotels or adjust your budget
                         </p>
                       </div>
                     )}

                     <div className="flex justify-between items-center">
                       <span className="font-medium">Base Budget</span>
                       <span className="text-lg font-bold">${itineraryData.budget_allocation.total_trip_budget}</span>
                     </div>
                     
                     {accommodationBudget.primaryHotelTotal > 0 && (
                       <div className="flex justify-between items-center">
                         <span className="font-medium">Total with Hotels</span>
                         <span className={`text-2xl font-bold ${accommodationBudget.hasOverflow ? 'text-red-600' : 'text-primary'}`}>
                           ${(itineraryData.budget_allocation.total_trip_budget + accommodationBudget.primaryHotelTotal).toFixed(0)}
                         </span>
                       </div>
                     )}
                     
                     {!accommodationBudget.primaryHotelTotal && (
                       <div className="flex justify-between items-center">
                         <span className="font-medium">Total Budget</span>
                         <span className="text-2xl font-bold text-primary">${itineraryData.budget_allocation.total_trip_budget}</span>
                       </div>
                     )}
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