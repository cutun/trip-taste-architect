import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Share2, RefreshCw, MapPin, Clock, DollarSign } from 'lucide-react';
import ItineraryTimeline from '@/components/ItineraryTimeline';
import MapPanel from '@/components/MapPanel';

// Mock data - TODO: Replace with API calls
const mockUser = {
  name: "Travel Explorer",
  avatar: "TE",
  budget: 2000,
  spent: 1250,
  preferences: ["Live Music", "Street Food", "Museums", "Beach"],
  destination: "Tokyo, Japan",
  duration: 7
};

const Itinerary = () => {
  const { id } = useParams();
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  const budgetProgress = (mockUser.spent / mockUser.budget) * 100;

  const handleRegenerateTrip = () => {
    // TODO: API call to regenerate entire trip
    console.log('Regenerating trip...');
  };

  const handleShareTrip = () => {
    // TODO: Implement sharing functionality
    console.log('Sharing trip...');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-poppins font-bold">
                {mockUser.destination}
              </h1>
              <p className="text-muted-foreground">
                {mockUser.duration} day trip • Trip ID: {id}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleRegenerateTrip}
                className="rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button 
                onClick={handleShareTrip}
                className="rounded-xl"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - User Summary */}
          <div className="lg:col-span-3">
            <Card className="rounded-xl shadow-card sticky top-24">
              <CardHeader className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-4">
                  <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                    {mockUser.avatar}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="font-poppins">{mockUser.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Budget Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Budget
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ${mockUser.spent} / ${mockUser.budget}
                    </span>
                  </div>
                  <Progress value={budgetProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {budgetProgress < 100 
                      ? `$${mockUser.budget - mockUser.spent} remaining`
                      : 'Over budget'
                    }
                  </p>
                </div>

                {/* Preferences */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Your Tastes</h4>
                  <div className="flex flex-wrap gap-1">
                    {mockUser.preferences.map((pref) => (
                      <Badge 
                        key={pref} 
                        variant="secondary" 
                        className="text-xs rounded-full"
                      >
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Trip Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Trip Details</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {mockUser.destination}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {mockUser.duration} days
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Itinerary Timeline */}
          <div className="lg:col-span-6">
            <ItineraryTimeline 
              onActivitySelect={setSelectedActivity}
              selectedActivity={selectedActivity}
            />
          </div>

          {/* Right Sidebar - Map */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <MapPanel selectedActivity={selectedActivity} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;