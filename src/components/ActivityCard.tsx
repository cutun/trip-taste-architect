import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, DollarSign, RefreshCw } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  name: string;
  time: string;
  price: number;
  rating: number;
  icon: string;
  coordinates: [number, number];
}

interface ActivityCardProps {
  activity: Activity;
  isSelected: boolean;
  onSelect: () => void;
  onSwap: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  isSelected, 
  onSelect, 
  onSwap 
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'food':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      case 'activity':
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card 
      className={`rounded-xl transition-smooth cursor-pointer hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'shadow-sm'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{activity.icon}</span>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{activity.name}</h4>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{activity.rating}</span>
              </div>
              
              {/* Price */}
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className={activity.price === 0 ? 'text-green-600' : ''}>
                  {activity.price === 0 ? 'Free' : `$${activity.price}`}
                </span>
              </div>
              
              {/* Type badge */}
              <Badge 
                variant="secondary" 
                className={`text-xs px-2 py-0.5 ${getTypeColor(activity.type)}`}
              >
                {activity.type}
              </Badge>
            </div>
          </div>
          
          {/* Swap button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSwap();
            }}
            className="ml-2 h-8 w-8 p-0 hover:bg-muted"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;