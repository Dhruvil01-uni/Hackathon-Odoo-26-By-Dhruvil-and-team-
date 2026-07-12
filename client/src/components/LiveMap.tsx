import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Trip } from '../types/transit';

// Fix leaflet icon issue in react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock coordinates for known cities
const cityCoordinates: Record<string, [number, number]> = {
  'New York, NY': [40.7128, -74.0060],
  'Boston, MA': [42.3601, -71.0589],
  'Los Angeles, CA': [34.0522, -118.2437],
  'San Francisco, CA': [37.7749, -122.4194],
  'Chicago, IL': [41.8781, -87.6298],
  'Detroit, MI': [42.3314, -83.0458],
};

interface LiveMapProps {
  trips: Trip[];
}

export function LiveMap({ trips }: LiveMapProps) {
  // Center map on USA by default
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const zoom = 4;

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer center={defaultCenter} zoom={zoom} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {trips.map(trip => {
          const sourceCoord = cityCoordinates[trip.source];
          const destCoord = cityCoordinates[trip.destination];

          if (!sourceCoord || !destCoord) return null;

          return (
            <React.Fragment key={trip.id}>
              <Marker position={sourceCoord}>
                <Popup>
                  <strong>Start:</strong> {trip.source}<br/>
                  Trip ID: {trip.id}
                </Popup>
              </Marker>
              <Marker position={destCoord}>
                <Popup>
                  <strong>End:</strong> {trip.destination}<br/>
                  Status: {trip.status}
                </Popup>
              </Marker>
              <Polyline 
                positions={[sourceCoord, destCoord]} 
                color={trip.status === 'DISPATCHED' ? '#3b82f6' : '#9ca3af'} 
                weight={3}
                dashArray={trip.status === 'DISPATCHED' ? '5, 10' : undefined}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
