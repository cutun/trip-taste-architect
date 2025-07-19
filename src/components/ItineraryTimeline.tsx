import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock, MapPin, DollarSign, RefreshCw, Utensils, Camera, Music } from 'lucide-react';
import ActivityCard from '@/components/ActivityCard';

// Mock itinerary data - TODO: Replace with API calls
const mockItinerary = [
  {
    day: 1,
    date: "March 15, 2024",
    activities: {
      morning: [
        {
          id: "1",
          type: "hotel",
          name: "Shibuya Sky Hotel",
          time: "Check-in",
          price: 150,
          rating: 4.5,
          icon: "🏨",
          coordinates: [139.7016, 35.6598] as [number, number]
        }
      ],
      afternoon: [
        {
          id: "2",
          type: "activity",
          name: "Senso-ji Temple",
          time: "2:00 PM",
          price: 0,
          rating: 4.8,
          icon: "⛩️",
          coordinates: [139.7967, 35.7148] as [number, number]
        },
        {
          id: "3",
          type: "food",
          name: "Sukiyabashi Jiro",
          time: "6:00 PM",
          price: 300,
          rating: 4.9,
          icon: "🍣",
          coordinates: [139.7632, 35.6712] as [number, number]
        }
      ],
      evening: [
        {
          id: "4",
          type: "activity",
          name: "Shibuya Crossing",
          time: "8:00 PM",
          price: 0,
          rating: 4.6,
          icon: "🌃",
          coordinates: [139.7016, 35.6598] as [number, number]
        }
      ]
    }
  },
  {
    day: 2,
    date: "March 16, 2024",
    activities: {
      morning: [
        {
          id: "5",
          type: "activity",
          name: "Tsukiji Fish Market",
          time: "6:00 AM",
          price: 0,
          rating: 4.7,
          icon: "🐟",
          coordinates: [139.7707, 35.6655] as [number, number]
        }
      ],
      afternoon: [
        {
          id: "6",
          type: "activity",
          name: "Tokyo National Museum",
          time: "1:00 PM",
          price: 25,
          rating: 4.4,
          icon: "🏛️",
          coordinates: [139.7762, 35.7188] as [number, number]
        }
      ],
      evening: [
        {
          id: "7",
          type: "food",
          name: "Golden Gai",
          time: "7:00 PM",
          price: 80,
          rating: 4.3,
          icon: "🍺",
          coordinates: [139.7047, 35.6938] as [number, number]
        }
      ]
    }
  }
];

interface ItineraryTimelineProps {
  onActivitySelect: (activity: any) => void;
  selectedActivity: any;
}

const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ 
  onActivitySelect, 
  selectedActivity 
}) => {
  const [defaultOpenDays, setDefaultOpenDays] = useState(['day-1']);

  const getTimeIcon = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'afternoon':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'evening':
        return <Clock className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleSwapActivity = (activityId: string) => {
    // TODO: Implement swap functionality
    console.log('Swapping activity:', activityId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-poppins font-bold">Your Itinerary</h2>
        <Badge variant="outline" className="px-3 py-1">
          {mockItinerary.length} days
        </Badge>
      </div>

      <Accordion 
        type="multiple" 
        defaultValue={defaultOpenDays} 
        className="space-y-4"
      >
        {mockItinerary.map((day) => (
          <AccordionItem 
            key={`day-${day.day}`} 
            value={`day-${day.day}`}
            className="border-0"
          >
            <Card className="rounded-xl shadow-card">
              <CardHeader className="pb-3">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="text-left">
                      <CardTitle className="font-poppins text-lg">
                        Day {day.day}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {day.date}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-auto mr-4">
                      {Object.values(day.activities).flat().length} activities
                    </Badge>
                  </div>
                </AccordionTrigger>
              </CardHeader>

              <AccordionContent>
                <CardContent className="pt-0 space-y-6">
                  {Object.entries(day.activities).map(([timeSlot, activities]) => (
                    <div key={timeSlot} className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getTimeIcon(timeSlot)}
                        <h4 className="font-medium capitalize text-sm">
                          {timeSlot}
                        </h4>
                      </div>
                      
                      <div className="space-y-3 ml-6">
                        {activities.map((activity) => (
                          <ActivityCard
                            key={activity.id}
                            activity={activity}
                            isSelected={selectedActivity?.id === activity.id}
                            onSelect={() => onActivitySelect(activity)}
                            onSwap={() => handleSwapActivity(activity.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ItineraryTimeline;