import React from 'react';
import { MapPin, Building, Users, Phone, Mail, Star } from 'lucide-react';

const LocationCard = ({ location, onClick, className = '' }) => {
  if (!location) return null;
  const occupancyRate = location.seating_capacity 
    ? Math.round((location.current_occupancy / location.seating_capacity) * 100)
    : null;
  const getOccupancyClass = () => {
    if (occupancyRate >= 90) return 'occupancy-fill-high';
    if (occupancyRate >= 75) return 'occupancy-fill-medium';
    return 'occupancy-fill-low';
  };

  return (
    <div 
      className={`location-card ${location.is_headquarters ? 'location-card-headquarters' : ''} ${className}`}
      onClick={() => onClick?.(location)}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${location.is_headquarters ? 'bg-amber-100' : 'bg-blue-100'}`}>
          {location.is_headquarters ? <Star size={20} className="text-amber-600" /> : <Building size={20} className="text-blue-600" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-400">{location.code}</span>
            {location.is_headquarters && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Headquarters</span>
            )}
            <span className="text-xs capitalize bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{location.type}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mt-1">{location.name}</h4>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <MapPin size={12} />
            <span>{location.city}, {location.country}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
        {occupancyRate !== null && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Occupancy</span>
              <span>{occupancyRate}%</span>
            </div>
            <div className="occupancy-bar">
              <div className={`occupancy-fill ${getOccupancyClass()}`} style={{ width: `${Math.min(100, occupancyRate)}%` }} />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {location.current_occupancy} / {location.seating_capacity}
            </div>
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users size={12} />
            <span>{location.current_occupancy || 0} employees</span>
          </div>
          {location.timezone && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <span>🕐</span>
              <span>{location.timezone}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
        {location.phone_number && (
          <div className="flex items-center gap-1">
            <Phone size={10} />
            <span>{location.phone_number}</span>
          </div>
        )}
        {location.email && (
          <div className="flex items-center gap-1">
            <Mail size={10} />
            <span>{location.email}</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default LocationCard;