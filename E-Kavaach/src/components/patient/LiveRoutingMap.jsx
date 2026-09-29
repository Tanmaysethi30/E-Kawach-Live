import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Compass,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Crosshair,
  ChevronDown,
  ChevronUp,
  Hospital,
  MapPin,
  Flame,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { searchLocationByQuery } from '../../utils/geolocation';

// Fix standard Leaflet default icon asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 1. Custom Pulsing Red Marker for Patient
function createPatientIcon(label = 'YOU (PATIENT)') {
  return L.divIcon({
    className: 'custom-patient-marker',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 48px; height: 48px;">
        <div class="absolute inset-0 rounded-full bg-red-500/40 animate-ping"></div>
        <div class="absolute w-8 h-8 rounded-full bg-red-600/60 animate-pulse border-2 border-red-400"></div>
        <div class="relative w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
        <div class="absolute top-10 whitespace-nowrap bg-red-950/90 text-red-200 border border-red-500/60 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md tracking-wider">
          ${label}
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

// 2. Custom Blue Cross Marker for Destination Hospital
function createHospitalIcon(name = 'Hospital', isSelected = true, icuBeds = 4) {
  const bgClass = isSelected ? 'bg-blue-600 border-blue-300' : 'bg-slate-700 border-slate-500';
  const glow = isSelected ? 'ring-4 ring-blue-500/40 animate-pulse' : '';
  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div class="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 54px; height: 54px;">
        <div class="w-8 h-8 rounded-full ${bgClass} ${glow} border-2 text-white shadow-xl flex items-center justify-center font-black text-lg">
          +
        </div>
        <div class="mt-1 whitespace-nowrap bg-slate-900/90 text-slate-100 border border-slate-700 text-[10px] font-medium px-2 py-0.5 rounded shadow-lg max-w-[140px] truncate flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full ${icuBeds > 0 ? 'bg-emerald-400' : 'bg-red-400'}"></span>
          ${name}
        </div>
      </div>
    `,
    iconSize: [54, 54],
    iconAnchor: [27, 27],
  });
}

// Component to smoothly pan & auto-fit bounds on route changes
function MapBoundsController({ patientCoord, hospitalCoord, routeCoords }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Invalidate size to prevent any Leaflet rendering/grey-tile issues
    map.invalidateSize();

    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      if (patientCoord) bounds.extend([patientCoord.lat, patientCoord.lng]);
      if (hospitalCoord) bounds.extend([hospitalCoord.lat, hospitalCoord.lng]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
    } else if (patientCoord && hospitalCoord) {
      const bounds = L.latLngBounds([
        [patientCoord.lat, patientCoord.lng],
        [hospitalCoord.lat, hospitalCoord.lng],
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    } else if (patientCoord) {
      map.setView([patientCoord.lat, patientCoord.lng], 14, { animate: true });
    }
  }, [map, patientCoord, hospitalCoord, routeCoords]);

  return null;
}

// Draggable patient marker listener
function DraggablePatientMarker({ position, onDragEnd, label }) {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onDragEnd({ lat: parseFloat(newPos.lat.toFixed(5)), lng: parseFloat(newPos.lng.toFixed(5)) });
        }
      },
    }),
    [onDragEnd]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      icon={createPatientIcon(label)}
      ref={markerRef}
    >
      <Popup>
        <div className="text-slate-900 font-sans text-xs p-1">
          <p className="font-bold text-red-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            Patient Emergency Origin
          </p>
          <p className="text-slate-600 mt-1">
            {position.lat.toFixed(4)}° N, {position.lng.toFixed(4)}° E
          </p>
          <p className="text-[11px] text-slate-500 italic mt-0.5">Drag to adjust your location</p>
        </div>
      </Popup>
    </Marker>
  );
}

// Map Click Listener to relocate patient position
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({
        lat: parseFloat(e.latlng.lat.toFixed(5)),
        lng: parseFloat(e.latlng.lng.toFixed(5)),
      });
    },
  });
  return null;
}

/**
 * Task 2: LiveRoutingMap Component
 * Real-time Emergency Hospital Routing using react-leaflet, leaflet, Tailwind CSS, OpenStreetMap, and OSRM.
 */
export default function LiveRoutingMap({
  patientLocation,
  hospitalLocation,
  nearbyHospitals = [],
  onSelectHospital,
  onLocationChange,
  onOpenSos,
  onTriggerGps,
  isLoading = false,
}) {
  // Normalize patient coordinates
  const patientCoord = useMemo(() => {
    if (!patientLocation) return { lat: 22.7196, lng: 75.8577, areaName: 'Indore', label: 'Patient Location' };
    return {
      lat: typeof patientLocation.lat === 'number' ? patientLocation.lat : parseFloat(patientLocation.lat) || 22.7196,
      lng: typeof patientLocation.lng === 'number' ? patientLocation.lng : parseFloat(patientLocation.lng) || 75.8577,
      areaName: patientLocation.areaName || patientLocation.city || patientLocation.displayName || 'Current Area',
      label: patientLocation.label || 'YOU (PATIENT)',
    };
  }, [patientLocation]);

  // Normalize hospital coordinates
  const targetHospital = useMemo(() => {
    if (!hospitalLocation) return null;
    const hLat = hospitalLocation.geoLat || hospitalLocation.lat;
    const hLng = hospitalLocation.geoLng || hospitalLocation.lng;
    if (typeof hLat !== 'number' && typeof hLat !== 'string') return null;
    return {
      ...hospitalLocation,
      lat: typeof hLat === 'number' ? hLat : parseFloat(hLat),
      lng: typeof hLng === 'number' ? hLng : parseFloat(hLng),
    };
  }, [hospitalLocation]);

  // State for OSRM Route
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeMeta, setRouteMeta] = useState({
    distanceText: '-- km',
    durationText: '-- Mins',
    distanceKm: 0,
    durationMins: 0,
    steps: [],
  });
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Map Tile Style State
  const [tileStyle, setTileStyle] = useState('osm'); // 'osm' | 'voyager' | 'dark'

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  // Routing: Trigger useEffect when both coordinates are available
  useEffect(() => {
    if (!patientCoord?.lat || !patientCoord?.lng || !targetHospital?.lat || !targetHospital?.lng) {
      setRouteCoords([]);
      setRouteMeta({ distanceText: '-- km', durationText: '-- Mins', distanceKm: 0, durationMins: 0, steps: [] });
      return;
    }

    let isMounted = true;
    setIsFetchingRoute(true);
    setRouteError(null);

    async function fetchOsrmRoute() {
      try {
        const pLat = patientCoord.lat;
        const pLng = patientCoord.lng;
        const hLat = targetHospital.lat;
        const hLng = targetHospital.lng;

        // 1. Try backend route proxy first (reliable, avoids browser CORS/adblocker restrictions)
        try {
          const proxyRes = await fetch(
            `/api/patient/route?fromLat=${pLat}&fromLng=${pLng}&toLat=${hLat}&toLng=${hLng}`,
            { signal: AbortSignal.timeout(4000) }
          );
          if (proxyRes.ok) {
            const proxyData = await proxyRes.json();
            if (isMounted && proxyData.success && proxyData.coordinates && proxyData.coordinates.length > 0) {
              setRouteCoords(proxyData.coordinates);
              setRouteMeta({
                distanceText: `${proxyData.distanceKm} km`,
                durationText: `${proxyData.durationMins} Mins`,
                distanceKm: proxyData.distanceKm,
                durationMins: proxyData.durationMins,
                steps: proxyData.steps || [],
              });
              return;
            }
          }
        } catch (_proxyErr) {
          // fallback to direct client-side OSRM
        }

        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${hLng},${hLat}?overview=full&geometries=geojson&steps=true`;

        const res = await fetch(osrmUrl, {
          signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
          throw new Error(`OSRM routing failed with status ${res.status}`);
        }

        const data = await res.json();

        if (isMounted && data.code === 'Ok' && Array.isArray(data.routes) && data.routes.length > 0) {
          const route = data.routes[0];
          // Convert OSRM GeoJSON [lng, lat] to Leaflet [lat, lng]
          const latLngs = route.geometry.coordinates.map((c) => [c[1], c[0]]);
          setRouteCoords(latLngs);

          const distKm = (route.distance / 1000).toFixed(1);
          const durMins = Math.max(1, Math.round(route.duration / 60));

          // Parse navigation maneuver steps
          const parsedSteps = [];
          if (route.legs && route.legs[0] && Array.isArray(route.legs[0].steps)) {
            route.legs[0].steps.forEach((step, idx) => {
              if (step.maneuver) {
                const stepDist = (step.distance / 1000).toFixed(1);
                const stepMins = Math.max(1, Math.round(step.duration / 60));
                let instruction = step.name ? `Proceed onto ${step.name}` : 'Continue on current road';
                if (step.maneuver.type === 'depart') instruction = `Depart from ${patientCoord.areaName || 'Origin'}`;
                else if (step.maneuver.type === 'arrive') instruction = `Arrive at ${targetHospital.name} Emergency Bay`;
                else if (step.maneuver.modifier) instruction = `Turn ${step.maneuver.modifier} onto ${step.name || 'road'}`;

                parsedSteps.push({
                  id: idx,
                  instruction,
                  distance: `${stepDist} km`,
                  duration: `${stepMins} min`,
                  modifier: step.maneuver.modifier || 'straight',
                });
              }
            });
          }

          setRouteMeta({
            distanceText: `${distKm} km`,
            durationText: `${durMins} Mins`,
            distanceKm: parseFloat(distKm),
            durationMins: durMins,
            steps: parsedSteps,
          });
        }
      } catch (err) {
        if (isMounted) {
          console.warn('OSRM routing fetch warning, falling back to direct trajectory:', err.message);
          setRouteError('Road routing busy, showing direct emergency trajectory');
          // Fallback straight emergency vector
          setRouteCoords([
            [patientCoord.lat, patientCoord.lng],
            [targetHospital.lat, targetHospital.lng],
          ]);
          // Approximate Haversine calculation
          const dx = (targetHospital.lat - patientCoord.lat) * 111;
          const dy = (targetHospital.lng - patientCoord.lng) * 111 * Math.cos((patientCoord.lat * Math.PI) / 180);
          const approxDist = Math.sqrt(dx * dx + dy * dy).toFixed(1);
          const approxMins = Math.max(2, Math.round(approxDist * 1.6 + 2));
          setRouteMeta({
            distanceText: `${approxDist} km`,
            durationText: `${approxMins} Mins`,
            distanceKm: parseFloat(approxDist),
            durationMins: approxMins,
            steps: [
              { id: 1, instruction: `Direct high-priority emergency transit to ${targetHospital.name}`, distance: `${approxDist} km`, duration: `${approxMins} min` },
            ],
          });
        }
      } finally {
        if (isMounted) setIsFetchingRoute(false);
      }
    }

    fetchOsrmRoute();

    return () => {
      isMounted = false;
    };
  }, [patientCoord.lat, patientCoord.lng, targetHospital?.lat, targetHospital?.lng, patientCoord.areaName, targetHospital?.name]);

  // Handle Location Search using OpenStreetMap & Backend Proxy
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingLocation(true);
    try {
      const results = await searchLocationByQuery(searchQuery);
      setSearchResults(results || []);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Location search failed:', err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lng || item.lon);
    const areaName = item.areaName || item.name || 'Searched Location';
    const city = item.city || 'City Center';

    setShowSearchResults(false);
    setSearchQuery('');

    if (onLocationChange) {
      onLocationChange({
        lat,
        lng,
        areaName,
        city,
        displayName: item.displayName || item.display_name || `${areaName}, ${city}`,
        label: item.label || `${areaName}, ${city}`,
        isDetected: true,
      });
    }
  };

  // Tile layer URL selector
  const tileConfig = useMemo(() => {
    switch (tileStyle) {
      case 'voyager':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap contributors',
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap contributors',
        };
      case 'osm':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };
    }
  }, [tileStyle]);

  return (
    <div className="relative w-full h-[460px] md:h-[540px] lg:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-950 font-sans select-none">
      {/* 1. Leaflet React Map Container */}
      <MapContainer
        center={[patientCoord.lat, patientCoord.lng]}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer url={tileConfig.url} attribution={tileConfig.attribution} />

        {/* Map Controller for auto-fit bounds */}
        <MapBoundsController
          patientCoord={patientCoord}
          hospitalCoord={targetHospital}
          routeCoords={routeCoords}
        />

        {/* Click on map to relocate */}
        <MapClickHandler
          onMapClick={(coords) => {
            if (onLocationChange) {
              onLocationChange({
                ...coords,
                areaName: 'Selected Pin Location',
                label: 'Custom Patient Pin',
                isDetected: true,
              });
            }
          }}
        />

        {/* Patient Pulsing Red Marker */}
        <DraggablePatientMarker
          position={patientCoord}
          label={patientCoord.label || 'YOU (PATIENT)'}
          onDragEnd={(newPos) => {
            if (onLocationChange) {
              onLocationChange({
                ...newPos,
                areaName: 'Dragged Pin Location',
                label: 'Live Draggable Pin',
                isDetected: true,
              });
            }
          }}
        />

        {/* Target Destination Hospital Blue Cross Marker */}
        {targetHospital && (
          <Marker
            position={[targetHospital.lat, targetHospital.lng]}
            icon={createHospitalIcon(
              targetHospital.name,
              true,
              targetHospital.icuBedsAvailable || 4
            )}
          >
            <Popup>
              <div className="p-1 font-sans text-slate-900 max-w-[220px]">
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs border-b pb-1">
                  <Hospital className="w-3.5 h-3.5" />
                  <span>{targetHospital.name}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">{targetHospital.address || 'Medical Hub Corridor'}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-100 p-1.5 rounded">
                  <span className="font-semibold text-emerald-700">
                    🟢 {targetHospital.icuBedsAvailable || 4} ICU Bays Ready
                  </span>
                  <span className="font-bold text-slate-700">{routeMeta.distanceText}</span>
                </div>
                {onOpenSos && (
                  <button
                    onClick={() => onOpenSos(targetHospital)}
                    className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold py-1 px-2 rounded flex items-center justify-center gap-1 shadow"
                  >
                    <Flame className="w-3 h-3" />
                    Dispatch Emergency SOS
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Secondary Nearby Hospital Markers */}
        {nearbyHospitals
          .filter((h) => !targetHospital || (h.id !== targetHospital.id && h.name !== targetHospital.name))
          .slice(0, 10)
          .map((hosp, idx) => {
            const hLat = hosp.geoLat || hosp.lat;
            const hLng = hosp.geoLng || hosp.lng;
            if (!hLat || !hLng) return null;

            return (
              <Marker
                key={hosp.id || `hosp_${idx}`}
                position={[hLat, hLng]}
                icon={createHospitalIcon(hosp.name, false, hosp.icuBedsAvailable || 0)}
                eventHandlers={{
                  click: () => {
                    if (onSelectHospital) onSelectHospital(hosp);
                  },
                }}
              >
                <Popup>
                  <div className="p-1 font-sans text-slate-900">
                    <p className="font-bold text-xs text-slate-800">{hosp.name}</p>
                    <p className="text-[11px] text-slate-600">{hosp.address}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      {hosp.icuBedsAvailable || 0} ICU Bays • {hosp.distanceKm || '--'} km
                    </p>
                    <button
                      onClick={() => onSelectHospital && onSelectHospital(hosp)}
                      className="mt-1.5 w-full bg-blue-600 text-white text-[11px] font-semibold py-1 rounded"
                    >
                      Route to this hospital
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Render Thick Blue OSRM Driving Route */}
        {routeCoords.length > 0 && (
          <>
            {/* Route Shadow / Casing line */}
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: '#1e3a8a',
                weight: 9,
                opacity: 0.6,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Core Visible Vibrant Blue Route */}
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: '#3b82f6',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}
      </MapContainer>

      {/* 2. Top-Left Search Bar & Controls Overlay */}
      <div className="absolute top-3 left-3 z-[1000] w-[calc(100%-24px)] max-w-md pointer-events-auto">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="pl-3.5 pr-2 text-blue-400">
            {isSearchingLocation ? <RotateCw className="w-4 h-4 animate-spin text-blue-400" /> : <Search className="w-4 h-4" />}
          </div>
          <input
            type="text"
            placeholder="Search area (e.g., Central Park, Palasia, Connaught Place)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onTriggerGps}
            title="Auto-Detect Live Device GPS"
            className="p-2 text-slate-400 hover:text-emerald-400 transition-colors border-l border-slate-800"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            type="submit"
            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
          >
            Find
          </button>
        </form>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="mt-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-800 border-b border-slate-800/60 last:border-0 text-xs text-slate-200 flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="truncate">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Top-Right Map Layer Switcher */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg pointer-events-auto">
        <button
          onClick={() => setTileStyle('osm')}
          className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
            tileStyle === 'osm' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          OSM
        </button>
        <button
          onClick={() => setTileStyle('voyager')}
          className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
            tileStyle === 'voyager' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Clinical
        </button>
        <button
          onClick={() => setTileStyle('dark')}
          className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
            tileStyle === 'dark' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Night
        </button>
      </div>

      {/* 4. Main Floating Tailwind UI Overlay Card */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl p-4 text-white pointer-events-auto max-w-2xl mx-auto">
          {/* Top Row: Metric Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {/* Pulsing Ambulance ETA Badge */}
              <div className="flex items-center gap-2 bg-blue-950/80 border border-blue-500/40 text-blue-200 px-3 py-1.5 rounded-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="font-extrabold text-sm tracking-wide text-white">
                  ETA: {routeMeta.durationText}
                </span>
              </div>

              {/* Distance Badge */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-1.5 rounded-xl text-xs font-semibold">
                <Navigation className="w-3.5 h-3.5 text-slate-400" />
                <span>Distance: {routeMeta.distanceText}</span>
              </div>
            </div>

            {/* Turn-by-turn drawer toggle button */}
            {routeMeta.steps.length > 0 && (
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-800/40"
              >
                <span>{showSteps ? 'Hide Navigation Steps' : `${routeMeta.steps.length} Route Steps`}</span>
                {showSteps ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Middle Row: Origin & Destination Corridor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
            {/* Patient Origin */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-red-950 border border-red-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Patient Origin (Area)</p>
                <p className="text-xs font-semibold text-slate-100 truncate">
                  {patientCoord.areaName || 'Local Detected Locality'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {patientCoord.lat.toFixed(4)}° N, {patientCoord.lng.toFixed(4)}° E
                </p>
              </div>
            </div>

            {/* Hospital Destination */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-blue-950 border border-blue-500 flex items-center justify-center shrink-0 mt-0.5 text-blue-400 font-black text-xs">
                +
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Closest Emergency Hub</p>
                <p className="text-xs font-bold text-white truncate">
                  {targetHospital?.name || 'Searching Nearest Emergency Center...'}
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold truncate">
                  🟢 {targetHospital?.icuBedsAvailable || 4} ICU Bays • 24x7 Trauma Bay Ready
                </p>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Expandable Steps */}
          {showSteps && routeMeta.steps.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800 max-h-40 overflow-y-auto space-y-1.5 pr-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Live OSRM Turn-By-Turn Driving Steps
              </p>
              {routeMeta.steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between text-xs bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700/50 text-slate-200"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{step.instruction}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">{step.distance}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>OSM & OSRM Open-Source Routing Engine</span>
            </div>

            <div className="flex items-center gap-2">
              {targetHospital?.contactNumbers?.er && (
                <a
                  href={`tel:${targetHospital.contactNumbers.er}`}
                  className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                  Call ER Desk
                </a>
              )}

              {onOpenSos && targetHospital && (
                <button
                  type="button"
                  onClick={() => onOpenSos(targetHospital)}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-lg shadow-red-950/50 transition-all transform active:scale-95 animate-pulse"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Dispatch SOS
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
