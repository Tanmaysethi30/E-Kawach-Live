import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { searchLocationByQuery, reverseGeocodeCoords } from '../../utils/geolocation';

export default function HospitalMap({
  hospitals = [],
  selectedHospital = null,
  onSelectHospital,
  userLocation,
  onUpdateUserLocation,
  onOpenSos,
  routeData = null,
  isLoadingRoute = false,
  onTriggerGps,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const userAccuracyCircleRef = useRef(null);
  const routeLayersRef = useRef([]);
  const animMarkerRef = useRef(null);
  const animIntervalRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('clinical'); // 'clinical' | 'osm' | 'satellite' | 'dark'
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(false);
  
  // Search & Geocoding State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Common Indian City Presets for 1-Click Instant Testing
  const cityPresets = [
    { name: '📍 Auto GPS', isGps: true },
    { name: 'Indore', lat: 22.7196, lng: 75.8577, label: 'Indore, Madhya Pradesh' },
    { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, label: 'New Delhi, Central District' },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, label: 'Mumbai, Maharashtra' },
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, label: 'Bengaluru, Karnataka' },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873, label: 'Jaipur, Rajasthan' },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, label: 'Kolkata, West Bengal' },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, label: 'Hyderabad, Telangana' },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra' },
    { name: 'Chennai', lat: 13.0604, lng: 80.2496, label: 'Chennai, Tamil Nadu' },
  ];

  // Map Tile Layers
  const tileLayers = {
    clinical: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri',
      maxZoom: 18,
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    },
  };

  const currentTileLayerRef = useRef(null);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = userLocation?.lat || 22.7196;
    const initialLng = userLocation?.lng || 75.8577;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const activeTile = tileLayers[mapStyle];
    const tileLayer = L.tileLayer(activeTile.url, {
      attribution: activeTile.attribution,
      maxZoom: activeTile.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    currentTileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Direct Click on Map to Drop/Move Patient Pin
    map.on('click', async (e) => {
      const lat = parseFloat(e.latlng.lat.toFixed(5));
      const lng = parseFloat(e.latlng.lng.toFixed(5));
      
      let label = `Selected Pin (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
      const rev = await reverseGeocodeCoords(lat, lng);
      if (rev && rev.label) label = rev.label;

      if (onUpdateUserLocation) {
        onUpdateUserLocation({
          lat,
          lng,
          isDetected: true,
          label,
        });
      }
    });

    // Leaflet Native Location Events
    map.on('locationfound', (e) => {
      setIsLocating(false);
      const lat = parseFloat(e.latlng.lat.toFixed(5));
      const lng = parseFloat(e.latlng.lng.toFixed(5));
      if (onUpdateUserLocation) {
        onUpdateUserLocation({
          lat,
          lng,
          isDetected: true,
          label: `Live GPS Location (±${Math.round(e.accuracy || 10)}m)`,
        });
      }
      map.flyTo([lat, lng], 14, { duration: 1 });
    });

    map.on('locationerror', (err) => {
      setIsLocating(false);
      console.warn('Leaflet locate error:', err.message);
    });

    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Tile Style Changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const activeTile = tileLayers[mapStyle] || tileLayers.clinical;
    const newLayer = L.tileLayer(activeTile.url, {
      attribution: activeTile.attribution,
      maxZoom: activeTile.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    currentTileLayerRef.current = newLayer;
  }, [mapStyle]);

  // 3. Render Draggable Patient Marker on Leaflet
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;
    const { lat, lng } = userLocation;

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    if (userAccuracyCircleRef.current) map.removeLayer(userAccuracyCircleRef.current);

    // Google Maps Style Live Patient Avatar (Draggable)
    const userIcon = L.divIcon({
      className: 'leaflet-patient-live-avatar',
      html: `
        <div class="relative flex flex-col items-center justify-center -ml-5 -mt-8 cursor-grab active:cursor-grabbing group">
          <div class="absolute w-12 h-12 rounded-full bg-blue-500/25 animate-ping" style="animation-duration: 2.5s;"></div>
          <div class="relative w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-2xl flex items-center justify-center text-white ring-2 ring-blue-400/50">
            <span class="material-symbols-outlined text-[16px] font-bold">person_pin_circle</span>
          </div>
          <div class="mt-1 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-blue-400 flex items-center gap-1 whitespace-nowrap">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>YOU (DRAG ME)</span>
          </div>
        </div>
      `,
      iconSize: [36, 48],
      iconAnchor: [18, 40],
    });

    const marker = L.marker([lat, lng], {
      icon: userIcon,
      draggable: true,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.bindPopup(`
      <div class="p-3 font-sans text-xs min-w-[210px]">
        <div class="flex items-center gap-1.5 font-bold text-blue-700 mb-1">
          <span class="material-symbols-outlined text-[16px]">my_location</span>
          <span>Your Patient Location</span>
        </div>
        <p class="text-slate-700 text-[11px] font-semibold">${userLocation.label || 'Synchronized Location'}</p>
        <p class="text-slate-500 text-[10px] font-mono mt-0.5">${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E</p>
        <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span>Tip: Drag pin to test any location</span>
          <span class="text-emerald-600 font-bold">ACTIVE</span>
        </div>
      </div>
    `);

    // Handle Drag End to relocate patient position anywhere
    marker.on('dragend', async (e) => {
      const newLatLng = e.target.getLatLng();
      const nLat = parseFloat(newLatLng.lat.toFixed(5));
      const nLng = parseFloat(newLatLng.lng.toFixed(5));
      
      let newLabel = `Dropped Pin (${nLat.toFixed(4)}° N, ${nLng.toFixed(4)}° E)`;
      const rev = await reverseGeocodeCoords(nLat, nLng);
      if (rev && rev.label) newLabel = rev.label;

      if (onUpdateUserLocation) {
        onUpdateUserLocation({
          lat: nLat,
          lng: nLng,
          isDetected: true,
          label: newLabel,
        });
      }
    });

    userMarkerRef.current = marker;

    const circle = L.circle([lat, lng], {
      radius: 400,
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);

    userAccuracyCircleRef.current = circle;
  }, [userLocation]);

  // 4. Render Hospital Leaflet Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !hospitals.length) return;
    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    hospitals.forEach((hosp) => {
      const isSelected = selectedHospital && selectedHospital.id === hosp.id;
      const icuAvail = hosp.icuBedsAvailable || 0;
      const icuTotal = hosp.icuBedsTotal || 30;

      let badgeColor = 'bg-emerald-600 border-emerald-700';
      let statusText = 'ICU Available';
      if (icuAvail === 0) {
        badgeColor = 'bg-rose-600 border-rose-700';
        statusText = 'ICU Full';
      } else if (icuAvail < 4) {
        badgeColor = 'bg-amber-600 border-amber-700';
        statusText = 'Critical ICU';
      }

      const isGovt = hosp.hospitalType === 'Government';

      const hospIcon = L.divIcon({
        className: 'leaflet-hospital-marker',
        html: `
          <div class="relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-110'
          }">
            ${
              isSelected
                ? '<div class="absolute -inset-3 rounded-full border-2 border-blue-500 bg-blue-500/15 animate-ping" style="animation-duration: 2s;"></div>'
                : ''
            }
            <div class="relative flex items-center justify-center w-9 h-9 rounded-2xl shadow-xl ${
              isSelected
                ? 'bg-blue-600 border-2 border-white ring-2 ring-blue-400'
                : isGovt
                ? 'bg-slate-900 border-2 border-amber-400'
                : 'bg-teal-800 border-2 border-white'
            } text-white font-bold">
              <span class="material-symbols-outlined text-[18px] text-white">local_hospital</span>
              <span class="absolute -top-2 -right-2 ${badgeColor} border text-white text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold shadow-md">
                ${icuAvail}
              </span>
            </div>
            <div class="mt-1 bg-slate-900/95 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap max-w-[150px] truncate border border-white/20 flex items-center gap-1">
              <span>${hosp.name.replace(/Hospital|Medical College|Super-Specialty/gi, '').trim()}</span>
              <span class="text-blue-300 font-mono font-bold">${hosp.distanceKm}km</span>
            </div>
          </div>
        `,
        iconSize: [44, 52],
        iconAnchor: [22, 34],
      });

      const marker = L.marker([hosp.geoLat, hosp.geoLng], {
        icon: hospIcon,
        zIndexOffset: isSelected ? 600 : 100,
      }).addTo(map);

      // Popup
      const popupHtml = `
        <div class="font-sans text-xs max-w-[290px] p-0 overflow-hidden bg-white rounded-2xl shadow-2xl">
          <div class="bg-slate-900 p-3.5 text-white">
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-teal-400 font-mono">${hosp.code || 'EK-HSP-NODE'}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full ${isGovt ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/15 text-white'} font-semibold">
                ${hosp.hospitalType}
              </span>
            </div>
            <h4 class="font-bold text-sm leading-tight text-white m-0">${hosp.name}</h4>
            <p class="text-[11px] text-slate-300 mt-1 flex items-center gap-1 truncate m-0">
              <span class="material-symbols-outlined text-[13px] text-teal-400">location_on</span>
              ${hosp.address}, ${hosp.city}
            </p>
          </div>

          <div class="p-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-2">
            <div class="grid grid-cols-2 gap-2 text-center">
              <div class="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                <span class="text-[9px] text-slate-500 block uppercase font-bold">ICU Capacity</span>
                <span class="text-base font-extrabold ${icuAvail > 0 ? 'text-emerald-700' : 'text-rose-600'}">
                  ${icuAvail} <span class="text-[10px] font-normal text-slate-500">/ ${icuTotal}</span>
                </span>
                <span class="text-[9px] block text-slate-600 font-medium">${statusText}</span>
              </div>
              <div class="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                <span class="text-[9px] text-slate-500 block uppercase font-bold">Ward Beds</span>
                <span class="text-base font-extrabold text-slate-900">
                  ${hosp.availableBeds} <span class="text-[10px] font-normal text-slate-500">/ ${hosp.totalBeds}</span>
                </span>
                <span class="text-[9px] block text-emerald-600 font-medium">Free</span>
              </div>
            </div>

            <div class="flex items-center justify-between text-[11px] bg-blue-50 p-2 rounded-xl border border-blue-200 text-blue-900 font-medium">
              <span class="flex items-center gap-1 font-bold font-mono">
                <span class="material-symbols-outlined text-[14px] text-blue-600">directions_car</span>
                ${hosp.distanceKm} km Road Dist
              </span>
              <span class="font-bold text-rose-700 flex items-center gap-1 font-mono">
                <span class="material-symbols-outlined text-[14px]">ambulance</span>
                ~${hosp.ambulanceMins} min ETA
              </span>
            </div>
          </div>

          <div class="p-3 bg-white flex flex-col gap-2">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-500">Emergency Desk:</span>
              <a href="tel:${hosp.contactNumbers?.er || '+914428290200'}" class="font-bold font-mono text-emerald-700 hover:underline">
                ${hosp.contactNumbers?.er || '+91 11 2658 8500'}
              </a>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-1">
              <button
                id="popup-select-${hosp.id}"
                type="button"
                class="w-full py-2 bg-blue-600 text-white font-bold text-[11px] rounded-xl shadow-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[14px]">alt_route</span>
                Route Map
              </button>
              <button
                id="popup-sos-${hosp.id}"
                type="button"
                class="w-full py-2 bg-rose-600 text-white font-bold text-[11px] rounded-xl shadow-xs hover:bg-rose-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[14px]">cell_tower</span>
                Dispatch SOS
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 310 });

      marker.on('popupopen', () => {
        const selectBtn = document.getElementById(`popup-select-${hosp.id}`);
        if (selectBtn) {
          selectBtn.onclick = () => {
            onSelectHospital(hosp);
            marker.closePopup();
          };
        }
        const sosBtn = document.getElementById(`popup-sos-${hosp.id}`);
        if (sosBtn) {
          sosBtn.onclick = () => {
            if (onOpenSos) onOpenSos(hosp);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectHospital(hosp);
      });

      markersRef.current[hosp.id] = marker;
    });
  }, [hospitals, selectedHospital]);

  // 5. Render REAL Road Polyline on Leaflet
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;

    if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    if (animMarkerRef.current) {
      map.removeLayer(animMarkerRef.current);
      animMarkerRef.current = null;
    }
    routeLayersRef.current.forEach((layer) => map.removeLayer(layer));
    routeLayersRef.current = [];
    setIsSimulatingDrive(false);

    if (!selectedHospital) return;

    let coords = routeData?.coordinates;
    if (!coords || coords.length === 0) {
      coords = [
        [userLocation.lat, userLocation.lng],
        [selectedHospital.geoLat, selectedHospital.geoLng],
      ];
    }

    // Google Maps Style Multi-Layered Polyline on Leaflet
    const casingLine = L.polyline(coords, {
      color: '#1e3a8a',
      weight: 8,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    routeLayersRef.current.push(casingLine);

    const primaryRouteLine = L.polyline(coords, {
      color: '#3b82f6',
      weight: 5,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    routeLayersRef.current.push(primaryRouteLine);

    const dashLine = L.polyline(coords, {
      color: '#93c5fd',
      weight: 2,
      dashArray: '6, 12',
      opacity: 0.9,
    }).addTo(map);
    routeLayersRef.current.push(dashLine);

    // Add Turn Maneuvers Dots
    if (routeData?.steps && routeData.steps.length > 0) {
      routeData.steps.forEach((step, idx) => {
        if (idx > 0 && idx < routeData.steps.length - 1 && step.location) {
          const stepDot = L.circleMarker(step.location, {
            radius: 4,
            color: '#1e40af',
            fillColor: '#ffffff',
            fillOpacity: 1,
            weight: 2,
          }).addTo(map);

          stepDot.bindTooltip(
            `<div class="text-[10px] font-bold font-sans">${step.instruction} (${step.distanceFormatted})</div>`,
            { direction: 'top', offset: [0, -4] }
          );
          routeLayersRef.current.push(stepDot);
        }
      });
    }

    // Centroid Route ETA Bubble
    const midIdx = Math.floor(coords.length / 2);
    const midPoint = coords[midIdx] || coords[0];

    const routeDistance = routeData?.distanceKm || selectedHospital.distanceKm;
    const routeTime = routeData?.durationMins || selectedHospital.ambulanceMins;

    const etaBubbleIcon = L.divIcon({
      className: 'leaflet-eta-bubble',
      html: `
        <div class="bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-2xl border-2 border-blue-400 flex items-center gap-1.5 whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2">
          <span class="material-symbols-outlined text-[14px] text-emerald-400">directions_car</span>
          <span class="text-white">${routeTime} min</span>
          <span class="text-slate-400 font-normal">(${routeDistance} km)</span>
        </div>
      `,
      iconSize: [140, 30],
      iconAnchor: [70, 15],
    });

    const etaBubbleMarker = L.marker(midPoint, {
      icon: etaBubbleIcon,
      zIndexOffset: 900,
    }).addTo(map);
    routeLayersRef.current.push(etaBubbleMarker);

    // Zoom & Fit Bounds
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, {
      padding: [80, 80],
      maxZoom: 16,
      animate: true,
      duration: 1,
    });
  }, [selectedHospital, routeData, userLocation]);

  // Search Address / Locality
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchLocationByQuery(searchQuery);
    setSearchResults(results);
    setShowSearchResults(true);
    setIsSearching(false);
  };

  const handleSelectSearchResult = (res) => {
    if (onUpdateUserLocation) {
      onUpdateUserLocation({
        lat: res.lat,
        lng: res.lng,
        isDetected: true,
        label: res.displayName,
      });
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([res.lat, res.lng], 14, { duration: 1 });
    }
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleSelectCityPreset = (preset) => {
    if (preset.isGps) {
      if (onTriggerGps) {
        onTriggerGps();
      } else if (mapInstanceRef.current) {
        setIsLocating(true);
        mapInstanceRef.current.locate({ setView: true, maxZoom: 14, enableHighAccuracy: true });
      }
      return;
    }

    if (onUpdateUserLocation) {
      onUpdateUserLocation({
        lat: preset.lat,
        lng: preset.lng,
        isDetected: true,
        label: preset.label,
      });
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], 13, { duration: 1 });
    }
  };

  // Drive Simulation along real road path
  const handleSimulateDrive = () => {
    if (!mapInstanceRef.current || !routeData?.coordinates || routeData.coordinates.length === 0) return;
    const map = mapInstanceRef.current;
    const coords = routeData.coordinates;

    if (isSimulatingDrive) {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      if (animMarkerRef.current) map.removeLayer(animMarkerRef.current);
      setIsSimulatingDrive(false);
      return;
    }

    setIsSimulatingDrive(true);
    let stepIndex = 0;

    const carIcon = L.divIcon({
      className: 'sim-ambulance-marker',
      html: `
        <div class="w-10 h-10 -ml-2 -mt-2 bg-rose-600 text-white rounded-full shadow-2xl border-2 border-white flex items-center justify-center animate-bounce-short">
          <span class="material-symbols-outlined text-[20px]">ambulance</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const animMarker = L.marker(coords[0], { icon: carIcon, zIndexOffset: 2000 }).addTo(map);
    animMarkerRef.current = animMarker;

    animIntervalRef.current = setInterval(() => {
      stepIndex += 1;
      if (stepIndex >= coords.length) {
        clearInterval(animIntervalRef.current);
        setIsSimulatingDrive(false);
        map.removeLayer(animMarker);
        return;
      }
      animMarker.setLatLng(coords[stepIndex]);
    }, 60);
  };

  return (
    <div className="relative w-full h-[600px] lg:h-[750px] rounded-3xl overflow-hidden shadow-xl border border-outline-variant/40 bg-slate-900 flex flex-col">
      {/* 1. TOP INTERACTIVE LOCATION & CITY SEARCH BAR */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 max-w-2xl w-full bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-white/20">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 pl-2">
            <span className="material-symbols-outlined text-blue-400 text-[20px]">location_searching</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your exact city, area, or landmark (e.g. Indore, Delhi, Jaipur, Mumbai...)"
              className="w-full bg-transparent text-white placeholder:text-slate-400 text-xs font-medium focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="text-slate-400 hover:text-white px-1"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              {isSearching ? 'Finding...' : 'Locate'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => handleSelectCityPreset({ isGps: true })}
            title="Auto-Detect Live GPS"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-md"
          >
            <span className={`material-symbols-outlined text-[15px] ${isLocating ? 'animate-spin' : ''}`}>
              my_location
            </span>
            <span className="hidden sm:inline">My GPS</span>
          </button>
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden max-w-2xl w-full flex flex-col divide-y divide-white/10">
            {searchResults.map((res, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSearchResult(res)}
                className="p-2.5 text-left hover:bg-blue-600/30 text-white text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-blue-400 text-[18px] shrink-0">pin_drop</span>
                <span className="truncate">{res.displayName}</span>
              </button>
            ))}
          </div>
        )}

        {/* Quick City Presets Strip */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {cityPresets.map((city, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectCityPreset(city)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shadow-md border transition-all cursor-pointer ${
                city.isGps
                  ? 'bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-500'
                  : userLocation?.label?.includes(city.name)
                  ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-300'
                  : 'bg-slate-900/90 text-slate-200 border-white/15 hover:bg-slate-800'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. REAL LEAFLET MAP CANVAS */}
      <div id="hospital-leaflet-map" ref={mapContainerRef} className="w-full h-full" />

      {/* 3. Floating Simulation CTA (When route is active) */}
      {selectedHospital && (
        <div className="absolute top-28 right-3 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={handleSimulateDrive}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold shadow-2xl transition-all flex items-center gap-1.5 cursor-pointer border ${
              isSimulatingDrive
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900/90 backdrop-blur-md text-white hover:bg-slate-800 border-white/20'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isSimulatingDrive ? 'stop_circle' : 'play_circle'}
            </span>
            <span>{isSimulatingDrive ? 'Stop Sim' : 'Simulate Drive'}</span>
          </button>
        </div>
      )}

      {/* 4. Bottom Map Style Selector */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-white/20">
        <button
          type="button"
          onClick={() => setMapStyle('clinical')}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-colors cursor-pointer ${
            mapStyle === 'clinical' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          Clinical
        </button>
        <button
          type="button"
          onClick={() => setMapStyle('osm')}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-colors cursor-pointer ${
            mapStyle === 'osm' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          Streets
        </button>
        <button
          type="button"
          onClick={() => setMapStyle('satellite')}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-colors cursor-pointer ${
            mapStyle === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          Satellite
        </button>
        <button
          type="button"
          onClick={() => setMapStyle('dark')}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-colors cursor-pointer ${
            mapStyle === 'dark' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          Dark
        </button>
      </div>

      {/* 5. Bottom Left Status Banner */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-3 bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-white/15 text-[11px] text-white">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="font-semibold text-slate-200">Drag Blue Pin to Move</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-white/20 pl-2">
          <div className="w-3 h-3 bg-teal-500 rounded-sm"></div>
          <span className="font-semibold text-slate-200">Hospitals ({hospitals.length})</span>
        </div>
      </div>
    </div>
  );
}
