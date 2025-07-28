import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Info } from 'lucide-react';

interface MapPanelProps {
  selectedActivity: any;
}

const MapPanel: React.FC<MapPanelProps> = ({ selectedActivity }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoiaGlrYW5ha28iLCJhIjoiY21kMmVmM2pjMXUyNzJscHUxMmR2bzllbCJ9.GX4ovlr7gxjETRymXw0D4A';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-118.2437, 34.0522], // Los Angeles coordinates
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map when selectedActivity changes
  useEffect(() => {
    if (!map.current || !selectedActivity?.coordinates) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker
    marker.current = new mapboxgl.Marker({ color: '#FF715B' })
      .setLngLat(selectedActivity.coordinates)
      .addTo(map.current);

    // Fly to the location
    map.current.flyTo({
      center: selectedActivity.coordinates,
      zoom: 15,
      duration: 1500
    });
  }, [selectedActivity]);

  return (
    <Card className="rounded-xl shadow-card h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-poppins">
          <MapPin className="w-5 h-5 text-primary" />
          Los Angeles Map
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Mapbox container */}
        <div 
          ref={mapContainer}
          className="flex-1 rounded-xl overflow-hidden relative"
        >
          {/* Activity overlay */}
          {selectedActivity && (
            <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 border z-10">
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