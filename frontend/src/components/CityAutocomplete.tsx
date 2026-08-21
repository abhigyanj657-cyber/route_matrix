import React, { useState, useRef, useEffect } from 'react';
import { PAN_INDIA_CITIES, CityHub } from '../data/cities';
import { MapPin, Search, Check, ChevronDown } from 'lucide-react';

interface CityAutocompleteProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (cityName: string, coords: [number, number]) => void;
  excludeCity?: string;
  placeholder?: string;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  label,
  sublabel,
  value,
  onChange,
  excludeCity,
  placeholder = "Search city or state..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter cities by query and exclude selected
  const filteredCities = PAN_INDIA_CITIES.filter(c => {
    if (excludeCity && c.name.toLowerCase() === excludeCity.toLowerCase()) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.region.toLowerCase().includes(q);
  });

  const selectedCityObj = PAN_INDIA_CITIES.find(c => c.name.toLowerCase() === value.toLowerCase());

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: CityHub) => {
    onChange(city.name, city.coords);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-medium text-slate-300 mb-1">
        <span>{label}</span>
        {sublabel && <span className="text-[11px] text-slate-500 ml-1">({sublabel})</span>}
      </label>

      {/* Trigger Button / Input */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2 text-sm text-white flex items-center justify-between cursor-pointer transition shadow-sm"
      >
        <div className="flex items-center space-x-2 truncate">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-white truncate">
            {value || "Select Hub..."}
          </span>
          {selectedCityObj && (
            <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-slate-700 text-slate-300 shrink-0">
              {selectedCityObj.state} • Tier {selectedCityObj.tier}
            </span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {/* Autocomplete Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-100">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-slate-800 bg-slate-950 flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400 ml-1.5" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none py-1"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[11px] text-slate-400 hover:text-white px-1.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* List of Cities */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 text-xs">
            {filteredCities.length === 0 ? (
              <div className="py-4 text-center text-slate-500 text-xs">
                No matching logistics hub found.
              </div>
            ) : (
              filteredCities.map((city) => {
                const isSelected = city.name.toLowerCase() === value.toLowerCase();
                return (
                  <div
                    key={`city-opt-${city.name}`}
                    onClick={() => handleSelect(city)}
                    className={`px-3.5 py-2 flex items-center justify-between cursor-pointer transition ${
                      isSelected 
                        ? 'bg-emerald-950/40 text-emerald-300 font-semibold' 
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-medium text-white">{city.name}</span>
                        <span className="text-[10px] text-slate-400">({city.state})</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {city.region} India Corridor • Tier-{city.tier} Logistics Hub
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                        {city.coords[0].toFixed(2)}°, {city.coords[1].toFixed(2)}°
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
