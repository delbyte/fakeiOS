import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { X, Search, Navigation, MapPin, Star, Clock, Route, MoreHorizontal, ChevronLeft, Bookmark, Share } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapsAppProps {
  onClose: () => void;
}

interface SavedPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: 'pinned' | 'places' | 'guides' | 'routes';
  timestamp: number;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  type: string;
}

interface RouteData {
  distance: string;
  duration: string;
  coordinates: [number, number][];
  instructions: string[];
}

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapsApp: React.FC<MapsAppProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'map' | 'search' | 'library' | 'route'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, name: string} | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Default location (San Francisco)
  const defaultCenter: [number, number] = [37.7749, -122.4194];

  useEffect(() => {
    loadSavedPlaces();
    getCurrentLocation();
  }, []);

  const loadSavedPlaces = () => {
    const stored = localStorage.getItem('maps_saved_places');
    if (stored) {
      setSavedPlaces(JSON.parse(stored));
    } else {
      // Add some default places
      const defaultPlaces: SavedPlace[] = [
        {
          id: '1',
          name: 'Spruce',
          address: 'New American Cuisine • San Francisco',
          lat: 37.7849,
          lng: -122.4194,
          category: 'pinned',
          timestamp: Date.now() - 86400000
        },
        {
          id: '2',
          name: 'Presidio Walk',
          address: 'Hiking Trail • San Francisco',
          lat: 37.7989,
          lng: -122.4662,
          category: 'places',
          timestamp: Date.now() - 172800000
        },
        {
          id: '3',
          name: 'Reveille Coffee Co.',
          address: 'Coffee Shop • San Francisco',
          lat: 37.7849,
          lng: -122.4094,
          category: 'places',
          timestamp: Date.now() - 259200000
        }
      ];
      setSavedPlaces(defaultPlaces);
      localStorage.setItem('maps_saved_places', JSON.stringify(defaultPlaces));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Use default location if geolocation fails
          setUserLocation({ lat: defaultCenter[0], lng: defaultCenter[1] });
        }
      );
    } else {
      setUserLocation({ lat: defaultCenter[0], lng: defaultCenter[1] });
    }
  };

  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = (result: SearchResult) => {
    const location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: result.display_name.split(',')[0]
    };
    setSelectedLocation(location);
    setCurrentView('map');
    setSearchQuery('');
    setSearchResults([]);
  };

  const savePlace = (location: {lat: number, lng: number, name: string}) => {
    const newPlace: SavedPlace = {
      id: Date.now().toString(),
      name: location.name,
      address: 'Saved Location',
      lat: location.lat,
      lng: location.lng,
      category: 'places',
      timestamp: Date.now()
    };
    
    const updatedPlaces = [...savedPlaces, newPlace];
    setSavedPlaces(updatedPlaces);
    localStorage.setItem('maps_saved_places', JSON.stringify(updatedPlaces));
  };

  const getDirections = async (destination: {lat: number, lng: number}) => {
    if (!userLocation) return;

    try {
      // Using OpenRouteService API (you might need to get an API key for production)
      // For demo purposes, we'll simulate route data
      const mockRoute: RouteData = {
        distance: '2.6 mi',
        duration: '8 min',
        coordinates: [
          [userLocation.lat, userLocation.lng],
          [(userLocation.lat + destination.lat) / 2, (userLocation.lng + destination.lng) / 2],
          [destination.lat, destination.lng]
        ],
        instructions: [
          'Head north on Main St',
          'Turn right on Oak Ave',
          'Continue straight for 1.2 miles',
          'Turn left on Pine St',
          'Destination will be on your right'
        ]
      };
      
      setRouteData(mockRoute);
      setCurrentView('route');
    } catch (error) {
      console.error('Routing error:', error);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        setSelectedLocation({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          name: 'Selected Location'
        });
      }
    });
    return null;
  };

  const renderSearchView = () => (
    <div className="absolute inset-0 bg-white z-[1000]">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setCurrentView('map')}
            className="mr-3"
          >
            <X size={24} className="text-gray-600" />
          </button>
          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 flex items-center">
            <Search size={16} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search for a place or address"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchPlaces(e.target.value);
              }}
              className="bg-transparent flex-1 outline-none"
              autoFocus
            />
          </div>
        </div>

        {isSearching && (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">Searching...</p>
          </div>
        )}

        <div className="space-y-2">
          {searchResults.map((result) => (
            <button
              key={result.place_id}
              onClick={() => selectLocation(result)}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <MapPin size={20} className="text-gray-400 mr-3" />
                <div>
                  <div className="font-medium">{result.display_name.split(',')[0]}</div>
                  <div className="text-sm text-gray-500">{result.display_name}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLibraryView = () => (
    <div className="absolute inset-0 bg-white z-[1000]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentView('map')}
            className="text-blue-500 text-lg"
          >
            Done
          </button>
          <h1 className="text-lg font-semibold">Library</h1>
          <button className="text-blue-500">
            <MoreHorizontal size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Pinned</h2>
              <span className="text-gray-500">3</span>
            </div>
            {savedPlaces.filter(place => place.category === 'pinned').map((place) => (
              <div key={place.id} className="flex items-center p-3 bg-gray-50 rounded-lg mb-2">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">S</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{place.name}</div>
                  <div className="text-sm text-gray-500">{place.address}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Places</h2>
              <span className="text-gray-500">20</span>
            </div>
            {savedPlaces.filter(place => place.category === 'places').map((place) => (
              <button
                key={place.id}
                onClick={() => {
                  setSelectedLocation({ lat: place.lat, lng: place.lng, name: place.name });
                  setCurrentView('map');
                }}
                className="w-full text-left flex items-center p-3 hover:bg-gray-50 rounded-lg mb-2"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <MapPin size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{place.name}</div>
                  <div className="text-sm text-gray-500">{place.address}</div>
                </div>
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Guides</h2>
              <span className="text-gray-500">4</span>
            </div>
            <div className="text-center py-8 text-gray-500">
              <MapPin size={48} className="mx-auto mb-2 opacity-50" />
              <p>No guides yet</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Routes</h2>
              <span className="text-gray-500">8</span>
            </div>
            <div className="text-center py-8 text-gray-500">
              <Route size={48} className="mx-auto mb-2 opacity-50" />
              <p>No routes yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRouteView = () => (
    <div className="absolute inset-0 bg-white z-[1000]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentView('map')}
            className="flex items-center text-blue-500"
          >
            <ChevronLeft size={24} />
            <span>Map</span>
          </button>
          <h1 className="text-lg font-semibold">Directions</h1>
          <button className="text-blue-500">
            <Share size={24} />
          </button>
        </div>

        {routeData && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">{routeData.distance}</h2>
                <span className="text-blue-600 font-semibold">{routeData.duration}</span>
              </div>
              <p className="text-gray-600">Fastest route now</p>
            </div>

            <button
              onClick={() => setIsNavigating(true)}
              className="w-full bg-blue-500 text-white rounded-xl p-4 font-semibold text-lg"
            >
              Start
            </button>

            <div className="space-y-3">
              <h3 className="font-semibold">Directions</h3>
              {routeData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <span className="text-gray-800">{instruction}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  return (
    <div 
      className="absolute inset-0 bg-white z-50 flex flex-col overflow-hidden"
      style={{ borderRadius: '40px' }}
    >
      {/* Map Container - Base Layer */}
      <div className="absolute inset-0">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapEvents />
          
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>Your Location</Popup>
            </Marker>
          )}
          
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <div className="font-semibold">{selectedLocation.name}</div>
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => savePlace(selectedLocation)}
                      className="text-blue-500 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => getDirections(selectedLocation)}
                      className="text-blue-500 text-sm"
                    >
                      Directions
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
          
          {savedPlaces.map((place) => (
            <Marker key={place.id} position={[place.lat, place.lng]}>
              <Popup>
                <div className="text-center">
                  <div className="font-semibold">{place.name}</div>
                  <div className="text-sm text-gray-600">{place.address}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* UI Overlay Layer - Above Map */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
            >
              <X size={20} className="text-gray-600" />
            </button>
            
            <button
              onClick={() => setCurrentView('search')}
              className="flex-1 mx-4 bg-white rounded-lg shadow-lg px-4 py-3 flex items-center"
            >
              <Search size={16} className="text-gray-500 mr-2" />
              <span className="text-gray-500">Search for a place or address</span>
            </button>
            
            <button
              onClick={() => setCurrentView('library')}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
            >
              <Bookmark size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <button
            onClick={getCurrentLocation}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center mb-3"
          >
            <Navigation size={20} className="text-blue-500" />
          </button>
        </div>

        {/* Selected Location Card */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
                  <p className="text-gray-600">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => savePlace(selectedLocation)}
                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => getDirections(selectedLocation)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
                  >
                    Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Mode */}
        {isNavigating && (
          <div className="absolute top-4 left-4 right-4 pointer-events-auto">
            <div className="bg-blue-500 text-white rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">2.6 mi</div>
                  <div className="text-sm opacity-80">8 min remaining</div>
                </div>
                <button
                  onClick={() => setIsNavigating(false)}
                  className="px-4 py-2 bg-white/20 rounded-lg text-sm"
                >
                  End
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Overlay Views */}
      {currentView === 'search' && renderSearchView()}
      {currentView === 'library' && renderLibraryView()}
      {currentView === 'route' && renderRouteView()}
    </div>
  );
};

export default MapsApp;