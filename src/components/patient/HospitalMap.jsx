import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState('clinical'); // 'clinical' | 'osm' | 'satellite' | 'dark'
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(false);

  // Search & Geocoding State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // Indian City Presets for Quick Navigation
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

  // Tile Provider Configurations
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

  // 1. Initialize Leaflet Map with Container Protection
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Remove any previous instance on this container to prevent "Map container is already initialized"
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (_e) {}
      mapInstanceRef.current = null;
    }

    const initialLat = Number(userLocation?.lat) || 28.6139;
    const initialLng = Number(userLocation?.lng) || 77.2090;

    let map = null;
    try {
      map = L.map(container, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const activeTile = tileLayers[mapStyle] || tileLayers.clinical;
      const tileLayer = L.tileLayer(activeTile.url, {
        attribution: activeTile.attribution,
        maxZoom: activeTile.maxZoom,
        subdomains: 'abcd',
      }).addTo(map);

      currentTileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;
      setMapReady(true);
    } catch (initErr) {
      console.error('Error initializing Leaflet map:', initErr);
      return;
    }

    // Direct Click on Map to Drop/Move Patient Pin
    map.on('click', async (e) => {
      if (!e || !e.latlng) return;
      const target = e.originalEvent?.target;
      if (target && typeof target.closest === 'function') {
        if (
          target.closest('.leaflet-marker-icon') ||
          target.closest('.leaflet-popup') ||
          target.closest('.leaflet-control') ||
          target.closest('button') ||
          target.closest('a')
        ) {
          return;
        }
      }

      const lat = parseFloat(e.latlng.lat.toFixed(5));
      const lng = parseFloat(e.latlng.lng.toFixed(5));

      let label = `Selected Pin (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
      try {
        const rev = await reverseGeocodeCoords(lat, lng);
        if (rev && rev.label) label = rev.label;
      } catch (_e) {}

      if (onUpdateUserLocation) {
        onUpdateUserLocation({
          lat,
          lng,
          isDetected: true,
          label,
        });
      }
    });

    // Native Location Events
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
      try {
        map.flyTo([lat, lng], 14, { duration: 1 });
      } catch (_e) {}
    });

    map.on('locationerror', (err) => {
      setIsLocating(false);
      console.warn('Leaflet locate error:', err.message);
    });

    // ResizeObserver prevents tile cracking on responsive layout changes
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch (_e) {}
        }
      });
      resizeObserver.observe(container);
    }

    // Initial size invalidation timer
    const tId = setTimeout(() => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch (_e) {}
      }
    }, 150);

    return () => {
      clearTimeout(tId);
      if (resizeObserver) resizeObserver.disconnect();
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      setMapReady(false);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_e) {}
        mapInstanceRef.current = null;
      }
      if (container && container._leaflet_id) {
        delete container._leaflet_id;
      }
    };
  }, []);

  // 2. Tile Style Changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    try {
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
    } catch (_e) {}
  }, [mapStyle, mapReady]);

  // 3. Render Draggable Patient Marker & Center View
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;
    const lat = Number(userLocation.lat);
    const lng = Number(userLocation.lng);

    if (isNaN(lat) || isNaN(lng)) return;

    try {
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      if (userAccuracyCircleRef.current) map.removeLayer(userAccuracyCircleRef.current);

      const userIcon = L.divIcon({
        className: 'leaflet-patient-live-avatar !bg-transparent !border-0',
        html: `
          <div class="relative flex flex-col items-center justify-center -ml-5 -mt-8 cursor-grab active:cursor-grabbing group">
            <div class="absolute w-12 h-12 rounded-full bg-blue-500/25 animate-ping" style="animation-duration: 2.5s;"></div>
            <div class="relative w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-2xl flex items-center justify-center text-white ring-2 ring-blue-400/50">
              <span class="material-symbols-outlined text-[16px] font-bold">person_pin_circle</span>
            </div>
            <div class="mt-1 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-blue-400 flex items-center gap-1 whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>PATIENT (DRAGGABLE)</span>
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
          <p class="text-slate-500 text-[10px] font-mono mt-0.5">${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E</p>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Tip: Drag pin to test any location</span>
            <span class="text-emerald-600 font-bold">ACTIVE</span>
          </div>
        </div>
      `);

      marker.on('dragend', async (e) => {
        const newLatLng = e.target.getLatLng();
        const nLat = parseFloat(newLatLng.lat.toFixed(5));
        const nLng = parseFloat(newLatLng.lng.toFixed(5));
        
        let newLabel = `Dropped Pin (${nLat.toFixed(4)}° N, ${nLng.toFixed(4)}° E)`;
        try {
          const rev = await reverseGeocodeCoords(nLat, nLng);
          if (rev && rev.label) newLabel = rev.label;
        } catch (_e) {}

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
    } catch (_e) {}
  }, [userLocation, mapReady]);

  // 4. Render Hospital Markers on Leaflet
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !Array.isArray(hospitals)) return;
    const map = mapInstanceRef.current;

    try {
      Object.values(markersRef.current).forEach((m) => {
        try {
          map.removeLayer(m);
        } catch (_e) {}
      });
      markersRef.current = {};

      hospitals.forEach((hosp) => {
        const hLat = Number(hosp.geoLat ?? hosp.lat);
        const hLng = Number(hosp.geoLng ?? hosp.lng);
        if (isNaN(hLat) || isNaN(hLng)) return;

        const isSelected = selectedHospital && (selectedHospital.id === hosp.id || selectedHospital.name === hosp.name);
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
          className: 'leaflet-hospital-marker !bg-transparent !border-0',
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
              <div class="mt-1 bg-slate-900/95 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap max-w-[140px] truncate border border-white/20 flex items-center gap-1">
                <span>${(hosp.name || 'Hospital').replace(/Hospital|Medical College|Super-Specialty/gi, '').trim()}</span>
                <span class="text-blue-300 font-mono font-bold">${hosp.distanceKm || '1'}km</span>
              </div>
            </div>
          `,
          iconSize: [44, 52],
          iconAnchor: [22, 34],
        });

        const marker = L.marker([hLat, hLng], {
          icon: hospIcon,
          zIndexOffset: isSelected ? 600 : 100,
        }).addTo(map);

        const popupHtml = `
          <div class="font-sans text-xs max-w-[280px] p-0 overflow-hidden bg-white rounded-2xl shadow-2xl">
            <div class="bg-slate-900 p-3 text-white">
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-teal-400 font-mono">${hosp.code || 'EK-HSP-NODE'}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full ${isGovt ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/15 text-white'} font-semibold">
                  ${hosp.hospitalType || 'Accredited'}
                </span>
              </div>
              <h4 class="font-bold text-sm leading-tight text-white m-0">${hosp.name}</h4>
              <p class="text-[11px] text-slate-300 mt-1 flex items-center gap-1 truncate m-0">
                <span class="material-symbols-outlined text-[13px] text-teal-400">location_on</span>
                ${hosp.address || ''}, ${hosp.city || ''}
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
                    ${hosp.availableBeds || 12} <span class="text-[10px] font-normal text-slate-500">/ ${hosp.totalBeds || 100}</span>
                  </span>
                  <span class="text-[9px] block text-emerald-600 font-medium">Free</span>
                </div>
              </div>

              <div class="flex items-center justify-between text-[11px] bg-blue-50 p-2 rounded-xl border border-blue-200 text-blue-900 font-medium">
                <span class="flex items-center gap-1 font-bold font-mono">
                  <span class="material-symbols-outlined text-[14px] text-blue-600">directions_car</span>
                  ${hosp.distanceKm || '1.5'} km Road Dist
                </span>
                <span class="font-bold text-rose-700 flex items-center gap-1 font-mono">
                  <span class="material-symbols-outlined text-[14px]">ambulance</span>
                  ~${hosp.ambulanceMins || '5'} min ETA
                </span>
              </div>
            </div>

            <div class="p-3 bg-white flex flex-col gap-2">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-slate-500">Emergency Desk:</span>
                <a href="tel:${hosp.contactNumbers?.er || '+911126588500'}" class="font-bold font-mono text-emerald-700 hover:underline">
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

        marker.bindPopup(popupHtml, { maxWidth: 300 });

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
    } catch (markerErr) {
      console.warn('Hospital markers render warning:', markerErr);
    }
  }, [hospitals, selectedHospital, mapReady]);

  // 5. Render Road Polyline on Leaflet
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;

    try {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      if (animMarkerRef.current) {
        map.removeLayer(animMarkerRef.current);
        animMarkerRef.current = null;
      }
      routeLayersRef.current.forEach((layer) => {
        try {
          map.removeLayer(layer);
        } catch (_e) {}
      });
      routeLayersRef.current = [];
      setIsSimulatingDrive(false);

      if (!selectedHospital) return;

      const pLat = Number(userLocation?.lat);
      const pLng = Number(userLocation?.lng);
      const hLat = Number(selectedHospital.geoLat ?? selectedHospital.lat);
      const hLng = Number(selectedHospital.geoLng ?? selectedHospital.lng);

      if (isNaN(pLat) || isNaN(pLng) || isNaN(hLat) || isNaN(hLng)) return;

      let coords = routeData?.coordinates;
      if (!coords || !Array.isArray(coords) || coords.length === 0) {
        coords = [
          [pLat, pLng],
          [hLat, hLng],
        ];
      }

      // Layered Route Lines
      const casingLine = L.polyline(coords, {
        color: '#1e3a8a',
        weight: 7,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      routeLayersRef.current.push(casingLine);

      const primaryRouteLine = L.polyline(coords, {
        color: '#3b82f6',
        weight: 4,
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

      // Centroid ETA Bubble
      const midIdx = Math.floor(coords.length / 2);
      const midPoint = coords[midIdx] || coords[0];

      const routeDistance = routeData?.distanceKm || selectedHospital.distanceKm || '2.0';
      const routeTime = routeData?.durationMins || selectedHospital.ambulanceMins || '5';

      const etaBubbleIcon = L.divIcon({
        className: 'leaflet-eta-bubble !bg-transparent !border-0',
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

      // Fit bounds safely
      const validCoords = coords.filter(
        (c) => Array.isArray(c) && c.length >= 2 && !isNaN(Number(c[0])) && !isNaN(Number(c[1]))
      );
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15,
            animate: true,
          });
        }
      }
    } catch (_bErr) {}
  }, [selectedHospital, routeData, userLocation, mapReady]);

  // Search Address / Locality
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchLocationByQuery(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (_e) {}
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
      try {
        mapInstanceRef.current.flyTo([res.lat, res.lng], 14, { duration: 1 });
      } catch (_e) {}
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
        try {
          mapInstanceRef.current.locate({ setView: true, maxZoom: 14, enableHighAccuracy: true });
        } catch (_e) {}
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
      try {
        mapInstanceRef.current.flyTo([preset.lat, preset.lng], 13, { duration: 1 });
      } catch (_e) {}
    }
  };

  // Drive Simulation along real road path
  const handleSimulateDrive = () => {
    if (!mapInstanceRef.current || !routeData?.coordinates || routeData.coordinates.length === 0) return;
    const map = mapInstanceRef.current;
    const coords = routeData.coordinates;

    if (isSimulatingDrive) {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      if (animMarkerRef.current) {
        try {
          map.removeLayer(animMarkerRef.current);
        } catch (_e) {}
      }
      setIsSimulatingDrive(false);
      return;
    }

    setIsSimulatingDrive(true);
    let stepIndex = 0;

    const carIcon = L.divIcon({
      className: 'sim-ambulance-marker !bg-transparent !border-0',
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
        try {
          map.removeLayer(animMarker);
        } catch (_e) {}
        return;
      }
      try {
        animMarker.setLatLng(coords[stepIndex]);
      } catch (_e) {}
    }, 60);
  };

  return (
    <div className="relative w-full h-[520px] lg:h-[680px] rounded-3xl overflow-hidden shadow-xl border border-outline-variant/40 bg-slate-900 contain-layout">
      {/* 1. TOP CONTROL BAR */}
      <div className="absolute top-3 left-3 right-3 z-[450] flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Top Left: Patient Location Badge & Search Toggle */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 pl-2.5 rounded-2xl shadow-xl border border-white/20 text-white text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
            <span className="font-semibold truncate max-w-[130px] sm:max-w-[200px]">
              {userLocation?.label || `${Number(userLocation?.lat || 0).toFixed(3)}°, ${Number(userLocation?.lng || 0).toFixed(3)}°`}
            </span>
            <button
              type="button"
              onClick={() => setShowSearchPanel(!showSearchPanel)}
              className="px-2 py-1 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 ml-1 shadow-sm"
              title="Toggle City & Address Search"
            >
              <span className="material-symbols-outlined text-[14px]">
                {showSearchPanel ? 'expand_less' : 'search'}
              </span>
              <span className="hidden sm:inline">{showSearchPanel ? 'Hide' : 'Change City'}</span>
            </button>
          </div>

          {/* Top Right: Simulation & Layer Switcher */}
          <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap">
            {selectedHospital && (
              <button
                type="button"
                onClick={handleSimulateDrive}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl transition-all flex items-center gap-1 cursor-pointer border ${
                  isSimulatingDrive
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-slate-900/90 backdrop-blur-md text-white hover:bg-slate-800 border-white/20'
                }`}
                title="Simulate ambulance driving along road path"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isSimulatingDrive ? 'stop_circle' : 'play_circle'}
                </span>
                <span>{isSimulatingDrive ? 'Stop' : 'Simulate'}</span>
              </button>
            )}

            {/* Map Style Switcher */}
            <div className="flex items-center gap-0.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl shadow-xl border border-white/20">
              <button
                type="button"
                onClick={() => setMapStyle('clinical')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                  mapStyle === 'clinical' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                Clinical
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('osm')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                  mapStyle === 'osm' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                Streets
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('satellite')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                  mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('dark')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                  mapStyle === 'dark' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Location & City Search Drawer */}
        {showSearchPanel && (
          <div className="pointer-events-auto flex flex-col gap-2 max-w-2xl w-full bg-slate-900/95 backdrop-blur-md p-2.5 rounded-2xl shadow-2xl border border-white/20 transition-all">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400 text-[18px]">location_searching</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any Indian city, landmark, or area (e.g. Indore, Delhi, Mumbai...)"
                className="w-full bg-transparent text-white placeholder:text-slate-400 text-xs font-medium focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="text-slate-400 hover:text-white px-1 text-xs"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                disabled={isSearching}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                {isSearching ? '...' : 'Locate'}
              </button>
              <button
                type="button"
                onClick={() => handleSelectCityPreset({ isGps: true })}
                title="Detect live GPS location"
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">my_location</span>
                <span>{isLocating ? 'Locating...' : 'GPS'}</span>
              </button>
            </form>

            {/* Live Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="bg-slate-800/95 rounded-xl border border-white/10 overflow-hidden divide-y divide-white/10 max-h-48 overflow-y-auto">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full p-2 text-left hover:bg-blue-600/30 text-white text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-blue-400 text-[16px] shrink-0">pin_drop</span>
                    <span className="truncate">{res.displayName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick City Presets Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-white/10">
              {cityPresets.map((city, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectCityPreset(city)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-xs border transition-all cursor-pointer ${
                    city.isGps
                      ? 'bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-500'
                      : userLocation?.label?.includes(city.name)
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. BOUNDED MAP CANVAS (absolute inset-0 guarantees no flex blowout) */}
      <div id="hospital-leaflet-map" ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* 3. Bottom Information & Status Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-[450] flex items-center justify-between gap-2 pointer-events-none">
        {/* Bottom Left Legend */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl border border-white/15 text-[11px] text-white">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Drag Blue Pin to Move</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-white/20 pl-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
            <span className="font-semibold text-slate-200">Trauma Centers ({hospitals.length})</span>
          </div>
        </div>

        {/* Bottom Right Route Summary (When hospital is selected) */}
        {selectedHospital && (
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl border border-blue-500/40 text-[11px] text-white">
            <span className="material-symbols-outlined text-[15px] text-emerald-400">directions_car</span>
            <span className="font-bold text-white">
              ~{routeData?.durationMins || selectedHospital.ambulanceMins || '5'} min ETA
            </span>
            <span className="text-blue-300 font-mono">
              ({routeData?.distanceKm || selectedHospital.distanceKm || '1.5'} km)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
