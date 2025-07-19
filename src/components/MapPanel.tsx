import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Info } from 'lucide-react';

interface MapPanelProps {
  selectedActivity: any;
}

const MapPanel: React.FC<MapPanelProps> = ({ selectedActivity }) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  // TODO: Implement Mapbox integration
  // For now, showing a placeholder with activity info

  return (
    <Card className="rounded-xl shadow-card h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-poppins">
          <MapPin className="w-5 h-5 text-primary" />
          Tokyo Map
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Map placeholder */}
        <div 
          ref={mapContainer}
          className="flex-1 bg-muted/30 rounded-xl flex items-center justify-center relative overflow-hidden"
        >
          {/* TODO: Replace with actual Mapbox component */}
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Interactive Map</p>
            <p className="text-sm text-muted-foreground">
              Mapbox integration coming soon
            </p>
          </div>
          
          {/* Activity overlay */}
          {selectedActivity && (
            <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 border">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedActivity.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{selectedActivity.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedActivity.time}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Map controls placeholder */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-full">
            <Info className="w-3 h-3" />
            Click activities to see location
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapPanel;