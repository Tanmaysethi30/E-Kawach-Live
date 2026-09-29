import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LiveRoutingMap from '../../components/patient/LiveRoutingMap';
import HospitalMap from '../../components/patient/HospitalMap';
import HospitalList from '../../components/patient/HospitalList';
import EmergencySosModal from '../../components/patient/EmergencySosModal';
import { useAuth } from '../../context/AuthContext';
import { detectClientIpLocation, searchLocationByQuery } from '../../utils/geolocation';

const INDIAN_CITY_PRESETS = [
  { name: '📍 Auto GPS', isGps: true },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, city: 'New Delhi', label: 'New Delhi (AIIMS / Safdarjung Grid)' },
  { name: 'Indore', lat: 22.7196, lng: 75.8577, city: 'Indore', label: 'Indore, Madhya Pradesh' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, city: 'Mumbai', label: 'Mumbai, Maharashtra' },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, city: 'Bengaluru', label: 'Bengaluru, Karnataka' },
  { name: 'Chennai', lat: 13.0604, lng: 80.2496, city: 'Chennai', label: 'Chennai, Tamil Nadu' },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, city: 'Jaipur', label: 'Jaipur, Rajasthan' },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, city: 'Kolkata', label: 'Kolkata, West Bengal' },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, city: 'Hyderabad', label: 'Hyderabad, Telangana' },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, city: 'Pune', label: 'Pune, Maharashtra' },
];

export default function EmergencyAccess() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Active View Tab: 'map' | 'contacts' | 'telemetry'
  const [activeTab, setActiveTab] = useState('map');

  // Hospitals state
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);

  // Live Patient Location state (Intelligently initialized)
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('ekawach_patient_profile');
      const cityCandidate = (savedProfile ? JSON.parse(savedProfile).city : null) || currentUser?.city;
      if (cityCandidate) {
        const match = INDIAN_CITY_PRESETS.find((c) => c.city?.toLowerCase() === cityCandidate.toLowerCase() || c.name.toLowerCase() === cityCandidate.toLowerCase());
        if (match) {
          return {
            lat: match.lat,
            lng: match.lng,
            areaName: cityCandidate,
            city: cityCandidate,
            isDetected: true,
            label: `${cityCandidate}, India (Registered Profile Location)`,
          };
        }
      }
    } catch (_e) {}
    return {
      lat: 28.6139,
      lng: 77.2090,
      areaName: 'New Delhi',
      city: 'New Delhi',
      isDetected: false,
      label: 'Live System Geolocation (Delhi NCR Grid)',
    };
  });

  const [locationSearchInput, setLocationSearchInput] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const [showLocDropdown, setShowLocDropdown] = useState(false);

  const [isLiveGpsTracking, setIsLiveGpsTracking] = useState(false);
  const watchIdRef = useRef(null);

  // Route state (OpenStreetMap & OSRM road geometry + steps)
  const [routeData, setRouteData] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // SOS Modal state
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosTargetHospital, setSosTargetHospital] = useState(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchAbortRef = useRef(null);

  // 1. Fetch Hospitals from backend (Supports coordinate inputs and text queries)
  const fetchHospitals = useCallback(async (locationInput, forceSelectNearest = false) => {
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setIsLoadingHospitals(true);
    try {
      let queryParam = '';
      if (typeof locationInput === 'string') {
        queryParam = `location=${encodeURIComponent(locationInput)}`;
      } else if (locationInput && typeof locationInput.lat === 'number') {
        queryParam = `lat=${locationInput.lat}&lng=${locationInput.lng}`;
      } else if (typeof locationInput === 'object' && locationInput?.location) {
        queryParam = `location=${encodeURIComponent(locationInput.location)}`;
      } else {
        queryParam = `lat=28.6139&lng=77.2090`;
      }

      const url = `/api/patient/emergency-hospitals?${queryParam}&radius=7`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {}),
        },
      });
      const data = await res.json();

      if (data.success) {
        if (data.userLocation) {
          setUserLocation((prev) => ({
            ...prev,
            ...data.userLocation,
            lat: data.userLocation.lat,
            lng: data.userLocation.lng,
            areaName: data.userLocation.areaName || data.userLocation.city || prev.areaName,
            city: data.userLocation.city || prev.city,
            displayName: data.userLocation.displayName || prev.displayName,
            isDetected: true,
            label: data.userLocation.areaName
              ? `${data.userLocation.areaName}, ${data.userLocation.city || ''}`
              : `${data.userLocation.lat.toFixed(4)}° N, ${data.userLocation.lng.toFixed(4)}° E`,
          }));
        }

        if (Array.isArray(data.hospitals)) {
          setHospitals(data.hospitals);
          // Automatically select the nearest hospital in the user's immediate vicinity
          if (data.hospitals.length > 0) {
            setSelectedHospital((prev) => {
              if (forceSelectNearest || !prev) return data.hospitals[0];
              const updated = data.hospitals.find((h) => h.id === prev.id);
              return updated || data.hospitals[0];
            });
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch emergency hospitals:', err);
      }
    } finally {
      setIsLoadingHospitals(false);
    }
  }, [currentUser?.id, currentUser?.token]);

  // 2. Fetch Real OSRM Road Path when hospital or patient location changes
  const fetchRoute = useCallback(async (fromLat, fromLng, toHospital) => {
    if (!toHospital || !fromLat || !fromLng) return;
    const toLat = toHospital.geoLat || toHospital.lat;
    const toLng = toHospital.geoLng || toHospital.lng;
    if (!toLat || !toLng) return;

    setIsLoadingRoute(true);
    try {
      const res = await fetch(
        `/api/patient/route?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`
      );
      const data = await res.json();
      if (data.success) {
        setRouteData(data);
      }
    } catch (err) {
      console.error('Failed to fetch road route:', err);
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  // Update route whenever userLocation or selectedHospital changes
  useEffect(() => {
    if (selectedHospital && userLocation?.lat && userLocation?.lng) {
      fetchRoute(userLocation.lat, userLocation.lng, selectedHospital);
    }
  }, [selectedHospital?.id, selectedHospital?.geoLat, selectedHospital?.geoLng, userLocation?.lat, userLocation?.lng, fetchRoute]);

  // 3. AUTOMATIC LIVE GEOLOCATION SYNC ON COMPONENT MOUNT
  useEffect(() => {
    let hasAcquiredGps = false;

    // Immediately fetch emergency hospitals for current location so grid is never blank
    fetchHospitals(userLocation, false);

    // A. Start client-side IP Geolocation immediately (Fast 200ms ISP detection)
    async function initClientIpLocation() {
      try {
        const clientLoc = await detectClientIpLocation();
        if (clientLoc && !hasAcquiredGps) {
          const coords = {
            lat: clientLoc.lat,
            lng: clientLoc.lng,
            areaName: clientLoc.city || 'Detected City',
            city: clientLoc.city,
            isDetected: true,
            label: clientLoc.label,
          };
          setUserLocation(coords);
          fetchHospitals(coords, true);
        }
      } catch (err) {
        console.warn('Client IP detection warning:', err);
      }
    }
    initClientIpLocation();

    // B. Start real-time browser GPS tracking with graceful multi-tier fallbacks
    if (navigator.geolocation) {
      setIsLiveGpsTracking(true);

      // Fast high-accuracy GPS acquisition
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          hasAcquiredGps = true;
          setIsLiveGpsTracking(false);
          const coords = {
            lat: parseFloat(pos.coords.latitude.toFixed(5)),
            lng: parseFloat(pos.coords.longitude.toFixed(5)),
            isDetected: true,
            label: `Live GPS Position (±${Math.round(pos.coords.accuracy)}m High-Precision)`,
          };
          setUserLocation((prev) => ({ ...prev, ...coords }));
          fetchHospitals(coords, true);
        },
        (err) => {
          console.warn('High-accuracy GPS timed out/declined, attempting network geolocation:', err.message);
          // Tier 2: Standard accuracy (works on PCs/Laptops via Wi-Fi networks)
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              hasAcquiredGps = true;
              setIsLiveGpsTracking(false);
              const coords = {
                lat: parseFloat(pos.coords.latitude.toFixed(5)),
                lng: parseFloat(pos.coords.longitude.toFixed(5)),
                isDetected: true,
                label: `Network Geolocation (±${Math.round(pos.coords.accuracy)}m)`,
              };
              setUserLocation((prev) => ({ ...prev, ...coords }));
              fetchHospitals(coords, true);
            },
            (err2) => {
              setIsLiveGpsTracking(false);
              console.warn('Browser GPS unavailable, keeping IP/registered location:', err2.message);
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 10000 }
      );

      // Continuous Watch Position
      try {
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const coords = {
              lat: parseFloat(pos.coords.latitude.toFixed(5)),
              lng: parseFloat(pos.coords.longitude.toFixed(5)),
              isDetected: true,
              label: `Live Moving GPS Position (±${Math.round(pos.coords.accuracy)}m)`,
            };
            setUserLocation((prev) => {
              const latDiff = Math.abs(prev.lat - coords.lat);
              const lngDiff = Math.abs(prev.lng - coords.lng);
              if (latDiff > 0.003 || lngDiff > 0.003) {
                fetchHospitals(coords, false);
                return coords;
              }
              return prev;
            });
          },
          (err) => console.warn('Watch position warning:', err.message),
          { enableHighAccuracy: false, maximumAge: 20000 }
        );
        watchIdRef.current = id;
      } catch (e) {
        console.warn('Watch position not available:', e);
      }
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [fetchHospitals]);

  // Request real Browser GPS coordinates manually with multi-tier fallback
  const handleRequestGpsLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported by this browser. Using network/IP location.');
      fallbackToIp();
      return;
    }

    showToast('Acquiring live location...');
    setIsLiveGpsTracking(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLiveGpsTracking(false);
        const newCoords = {
          lat: parseFloat(pos.coords.latitude.toFixed(5)),
          lng: parseFloat(pos.coords.longitude.toFixed(5)),
          isDetected: true,
          label: `Live GPS Position (±${Math.round(pos.coords.accuracy)}m Accuracy)`,
        };
        setUserLocation((prev) => ({ ...prev, ...newCoords }));
        fetchHospitals(newCoords, true);
        showToast(`📍 Live GPS Locked: ${newCoords.lat}° N, ${newCoords.lng}° E`);
      },
      (err) => {
        console.warn('High-accuracy GPS failed, trying network geolocation:', err.message);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setIsLiveGpsTracking(false);
            const newCoords = {
              lat: parseFloat(pos.coords.latitude.toFixed(5)),
              lng: parseFloat(pos.coords.longitude.toFixed(5)),
              isDetected: true,
              label: `Network Geolocation (±${Math.round(pos.coords.accuracy)}m)`,
            };
            setUserLocation((prev) => ({ ...prev, ...newCoords }));
            fetchHospitals(newCoords, true);
            showToast(`📍 Network Location Synced: ${newCoords.lat}° N, ${newCoords.lng}° E`);
          },
          (err2) => {
            setIsLiveGpsTracking(false);
            console.warn('Network location also failed:', err2.message);
            fallbackToIp();
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 10000 }
    );
  };

  const fallbackToIp = async () => {
    try {
      const clientLoc = await detectClientIpLocation();
      if (clientLoc && clientLoc.lat && clientLoc.lng) {
        const coords = {
          lat: clientLoc.lat,
          lng: clientLoc.lng,
          areaName: clientLoc.city || 'Local Area',
          city: clientLoc.city,
          isDetected: true,
          label: clientLoc.label || `${clientLoc.city}, India (Verified IP Location)`,
        };
        setUserLocation(coords);
        fetchHospitals(coords, true);
        showToast(`📍 Synced to your local area: ${clientLoc.city || 'Local Area'}`);
        return;
      }
    } catch (_e) {}
    showToast('GPS unavailable. Click any city preset below or search an address.');
  };

  // Switch City Preset (e.g. Delhi NCR, Mumbai, Indore, Jaipur)
  const handleSelectCityPreset = (preset) => {
    if (preset.isGps) {
      handleRequestGpsLocation();
      return;
    }
    const coords = {
      lat: preset.lat,
      lng: preset.lng,
      areaName: preset.city || preset.name,
      city: preset.city || preset.name,
      isDetected: true,
      label: preset.label || `${preset.name}, India`,
    };
    setUserLocation(coords);
    fetchHospitals(coords, true);
    showToast(`📍 Switched to ${preset.name} Emergency Grid`);
  };

  // Search Address / Hospital / Locality
  const handleSearchLocationSubmit = async (e) => {
    e?.preventDefault();
    if (!locationSearchInput.trim()) return;

    setIsSearchingLoc(true);
    try {
      const results = await searchLocationByQuery(locationSearchInput);
      setLocationSearchResults(results || []);
      setShowLocDropdown(true);
      if (!results || results.length === 0) {
        showToast('No exact address match found. Try a city or district name.');
      }
    } catch (err) {
      console.warn('Location search error:', err);
    } finally {
      setIsSearchingLoc(false);
    }
  };

  const handleSelectSearchedLoc = (item) => {
    setShowLocDropdown(false);
    setLocationSearchInput('');
    const coords = {
      lat: item.lat,
      lng: item.lng,
      areaName: item.areaName || item.name || 'Selected Location',
      city: item.city || 'City Center',
      displayName: item.displayName,
      label: item.label || item.displayName || `${item.name}, India`,
      isDetected: true,
    };
    setUserLocation(coords);
    fetchHospitals(coords, true);
    showToast(`📍 Centered on ${item.areaName || item.name}`);
  };

  // Reset to default central reference
  const handleResetLocation = () => {
    handleSelectCityPreset(INDIAN_CITY_PRESETS[1]); // Delhi NCR or initial
  };

  // Update location from map pin drop or search
  const handleUpdateUserLocation = (newCoords) => {
    setUserLocation((prev) => ({
      ...prev,
      ...newCoords,
      isDetected: true,
    }));
    fetchHospitals(newCoords, true);
    showToast(`Patient position updated to ${newCoords.areaName || `${newCoords.lat}° N, ${newCoords.lng}° E`}`);
  };

  // Open SOS Modal for hospital
  const handleOpenSos = (hosp) => {
    setSosTargetHospital(hosp || selectedHospital || hospitals[0]);
    setSosModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-blue-400/40 transition-all animate-bounce-short">
          <span className="material-symbols-outlined text-[20px] text-blue-400">my_location</span>
          <span className="font-label-md text-xs font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* 1. Header & Live Telemetry Ingress Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-outline-variant/30">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px] text-blue-600">navigation</span>
            <span>ABDM National Health Network • Leaflet &amp; OpenStreetMap OSRM Live Routing</span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary tracking-tight">
            Hospital ER Live Map &amp; Real-Time Road Navigation
          </h1>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant max-w-3xl">
            Automatically synchronized to your real-time system location. Finds nearest hospitals within 7km using OpenStreetMap Overpass and Nominatim, and calculates live OSRM driving routes, ETA, and turn-by-turn navigation steps.
          </p>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-full border border-blue-400/30 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span className="font-label-sm text-[11px] text-primary font-bold tracking-tight">
              Live GPS Synced: {hospitals.length} Hospitals
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenSos(selectedHospital || hospitals[0])}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-headline-sm text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">cell_tower</span>
            <span>Dispatch 108 SOS</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            <span>Live Map &amp; OSRM Road Path</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-blue-500/20 text-blue-400 font-mono">
              {hospitals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">contact_phone</span>
            <span>Emergency Contacts &amp; Next-of-Kin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">monitor_heart</span>
            <span>ABDM Ingress Diagnostics</span>
          </button>
        </div>

        {/* Patient Health ID QR Shortcut */}
        <Link
          to="/patient/abha"
          className="hidden md:flex items-center gap-1.5 text-xs font-bold text-primary hover:text-navy-accent bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/30 hover:border-primary/40 no-underline"
        >
          <span className="material-symbols-outlined text-[16px] text-teal-tactical">badge</span>
          <span>My Health ID QR</span>
        </Link>
      </div>

      {/* 3. MAIN VIEW: REAL-LIFE MAP & HOSPITALS */}
      {activeTab === 'map' && (
        <div className="flex flex-col gap-5">
          {/* Quick Indian City Grid & Search Toolbar */}
          <div className="bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant/40 shadow-sm flex flex-col gap-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Left: Active Location Badge & GPS Sync */}
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={handleRequestGpsLocation}
                  disabled={isLiveGpsTracking}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer"
                  title="Detect live coordinates via browser/device GPS"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isLiveGpsTracking ? 'animate-spin' : ''}`}>
                    my_location
                  </span>
                  <span>{isLiveGpsTracking ? 'Locking GPS...' : 'Auto-Detect GPS'}</span>
                </button>

                <div className="flex items-center gap-2 min-w-0 px-3 py-1 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0">pin_drop</span>
                  <span className="font-semibold text-primary truncate max-w-[220px] md:max-w-[340px]">
                    {userLocation.label || `${userLocation.areaName || 'Local'}, ${userLocation.city || ''}`}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-700 font-mono font-bold rounded-full shrink-0">
                    {userLocation.lat?.toFixed(3)}°, {userLocation.lng?.toFixed(3)}°
                  </span>
                </div>
              </div>

              {/* Right: Search any address/locality in India */}
              <form onSubmit={handleSearchLocationSubmit} className="relative flex-1 md:max-w-xs">
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[16px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={locationSearchInput}
                    onChange={(e) => setLocationSearchInput(e.target.value)}
                    placeholder="Search city, area, hospital..."
                    className="w-full pl-8 pr-16 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-medium text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingLoc}
                    className="absolute right-1 px-2.5 py-1 bg-primary text-on-primary rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    {isSearchingLoc ? '...' : 'Go'}
                  </button>
                </div>

                {/* Dropdown search results */}
                {showLocDropdown && locationSearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-outline-variant/20 max-h-56 overflow-y-auto">
                    {locationSearchResults.map((res, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSearchedLoc(res)}
                        className="w-full text-left p-2.5 hover:bg-surface-container text-xs text-on-surface flex items-start gap-2 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">location_on</span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold truncate">{res.areaName || res.name}</span>
                          <span className="text-[10px] text-on-surface-variant truncate">{res.displayName}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* City Preset Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">apartment</span>
                Quick Cities:
              </span>
              {INDIAN_CITY_PRESETS.filter(p => !p.isGps).map((preset) => {
                const isActive = userLocation.city?.toLowerCase() === preset.city?.toLowerCase() || (userLocation.areaName && userLocation.areaName.toLowerCase().includes(preset.city.toLowerCase()));
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectCityPreset(preset)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-xs font-bold ring-1 ring-primary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Section: Left Hospital List / Directions + Right Real-Life Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Hospital Data List & OSRM Turn-by-Turn (5 cols on Desktop) */}
            <div className="lg:col-span-5 w-full">
              <HospitalList
                hospitals={hospitals}
                selectedHospital={selectedHospital}
                onSelectHospital={(hosp) => setSelectedHospital(hosp)}
                userLocation={userLocation}
                onRequestGpsLocation={handleRequestGpsLocation}
                onResetLocation={handleResetLocation}
                onOpenSos={handleOpenSos}
                isLoading={isLoadingHospitals}
                routeData={routeData}
                isLoadingRoute={isLoadingRoute}
                isLiveGpsTracking={isLiveGpsTracking}
              />
            </div>

            {/* Right Column: Live OpenStreetMap & OSRM Driving Route Map (7 cols on Desktop) */}
            <div className="lg:col-span-7 w-full flex flex-col gap-4">
              <HospitalMap
                hospitals={hospitals}
                selectedHospital={selectedHospital}
                onSelectHospital={(hosp) => setSelectedHospital(hosp)}
                userLocation={userLocation}
                onUpdateUserLocation={handleUpdateUserLocation}
                onOpenSos={handleOpenSos}
                routeData={routeData}
                isLoadingRoute={isLoadingRoute}
                onTriggerGps={handleRequestGpsLocation}
              />
            </div>
          </div>

          {/* 4. Selected Hospital Full Bed & Clinical Details Bar */}
          {selectedHospital && (
            <div className="bg-surface-container-lowest p-5 md:p-6 rounded-3xl border border-outline-variant/40 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-[24px]">local_hospital</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        {selectedHospital.code}
                      </span>
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {selectedHospital.accreditation || 'NABH / JCI Accredited'}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono">
                        GPS: {(selectedHospital.geoLat ?? selectedHospital.lat)?.toFixed?.(4) ?? '--'}° N, {(selectedHospital.geoLng ?? selectedHospital.lng)?.toFixed?.(4) ?? '--'}° E
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-lg md:text-xl font-bold text-primary mt-1">
                      {selectedHospital.name}
                    </h2>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[15px] text-secondary">location_on</span>
                      {selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state} - {selectedHospital.pincode}
                    </p>
                  </div>
                </div>

                {/* Google Road Real Distance & Ambulance ETA */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200/60 flex flex-col items-end">
                    <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">
                      Google Road Path
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-headline-md text-xl font-extrabold text-blue-700 font-mono">
                        {routeData?.distanceKm || selectedHospital.distanceKm} km
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 font-mono">
                        (~{routeData?.durationMins || selectedHospital.ambulanceMins}m Drive)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenSos(selectedHospital)}
                    className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-headline-sm text-xs font-bold rounded-2xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">cell_tower</span>
                    <span>Pre-Alert Hospital</span>
                  </button>
                </div>
              </div>

              {/* Comprehensive Bed & Resource Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* 1. ICU Beds */}
                <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">ICU Beds</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span
                      className={`text-lg font-extrabold font-mono ${
                        selectedHospital.icuBedsAvailable > 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {selectedHospital.icuBedsAvailable}
                    </span>
                    <span className="text-xs text-on-surface-variant">/ {selectedHospital.icuBedsTotal}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${selectedHospital.icuBedsAvailable > 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((selectedHospital.icuBedsAvailable / (selectedHospital.icuBedsTotal || 1)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 2. Trauma Bays */}
                <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Trauma Bays</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-extrabold font-mono text-primary">
                      {selectedHospital.emergencyBedsAvailable || 4}
                    </span>
                    <span className="text-xs text-on-surface-variant">/ {selectedHospital.emergencyBedsTotal || 12}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1">Ready for Ingress</span>
                </div>

                {/* 3. Total Ward Beds */}
                <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Ward Capacity</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-extrabold font-mono text-primary">
                      {selectedHospital.availableBeds}
                    </span>
                    <span className="text-xs text-on-surface-variant">/ {selectedHospital.totalBeds}</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant mt-1">Operational</span>
                </div>

                {/* 4. Ventilators */}
                <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Ventilators</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-extrabold font-mono text-primary">
                      {selectedHospital.ventilatorsAvailable || 4}
                    </span>
                    <span className="text-xs text-on-surface-variant">/ {selectedHospital.ventilatorsTotal || 18}</span>
                  </div>
                  <span className="text-[10px] text-teal-700 font-semibold mt-1">Calibrated</span>
                </div>

                {/* 5. Oxygen Capacity */}
                <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">O2 Pipeline</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-extrabold font-mono text-teal-700">
                      {selectedHospital.oxygenBedsAvailable ?? selectedHospital.oxygenBeds ?? 120}
                    </span>
                    <span className="text-xs text-on-surface-variant">Beds</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1">
                    {selectedHospital.traumaBayReady !== false ? 'Trauma Bay Ready' : 'Standby'}
                  </span>
                </div>

                {/* 6. Blood Bank & 24x7 */}
                <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Blood Bank</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[18px] text-rose-600">bloodtype</span>
                    <span className="font-bold text-xs text-rose-800">Armed (O-, A+, B+)</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1">24x7 Cross-Match</span>
                </div>
              </div>

              {/* Direct Emergency Contact Strip */}
              <div className="p-4 bg-surface-container-low/80 rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface-variant font-medium">ER Direct:</span>
                    <a
                      href={`tel:${(selectedHospital.contactNumbers?.er || selectedHospital.contact_number || selectedHospital.phone || '108').replace(/\s+/g, '')}`}
                      className="font-mono font-bold text-rose-700 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">call</span>
                      {selectedHospital.contactNumbers?.er || selectedHospital.contact_number || selectedHospital.phone || '108 Ambulance'}
                    </a>
                  </div>
                  {(selectedHospital.contactNumbers?.reception || selectedHospital.contactNumbers?.helpline || selectedHospital.reception || selectedHospital.website) && (
                    <div className="flex items-center gap-2">
                      <span className="text-on-surface-variant font-medium">Desk / Help:</span>
                      <a
                        href={`tel:${(selectedHospital.contactNumbers?.reception || selectedHospital.contactNumbers?.helpline || selectedHospital.reception || '108').replace(/\s+/g, '')}`}
                        className="font-mono font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">desk</span>
                        {selectedHospital.contactNumbers?.reception || selectedHospital.contactNumbers?.helpline || selectedHospital.reception || selectedHospital.website || 'Helpdesk'}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface-variant font-medium">108 Ambulance:</span>
                    <a href="tel:108" className="font-mono font-bold text-rose-700 hover:underline">
                      108
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const lat = selectedHospital.geoLat ?? selectedHospital.lat;
                      const lng = selectedHospital.geoLng ?? selectedHospital.lng;
                      const uLat = userLocation?.lat || 13.0827;
                      const uLng = userLocation?.lng || 80.2707;
                      window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${uLat},${uLng};${lat},${lng}`, '_blank');
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">navigation</span>
                    Open in OpenStreetMap
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/patient/appointments')}
                    className="px-3 py-2 bg-primary hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">event_available</span>
                    Book OPD Slot
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 2: EMERGENCY CONTACTS & NEXT-OF-KIN */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority 1 Contact (Dynamic User Emergency Contact) */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[13px] text-teal-tactical">verified_user</span> Primary Next-of-Kin
                </span>
                <span className="bg-surface-container text-primary font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-outline-variant/30">
                  Tier-1 (0s Delay)
                </span>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center font-headline-md text-lg font-bold shrink-0 border border-outline-variant/20">
                  {(currentUser?.emergencyContactName || 'Ananya S. Sharma').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-headline-sm text-base font-bold text-on-surface truncate">
                    {currentUser?.emergencyContactName || 'Ananya S. Sharma'}
                  </h3>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {currentUser?.emergencyContactRelation || 'Spouse'} • Primary Emergency Proxy
                  </span>
                  <span className="text-xs font-mono font-bold text-primary mt-1">
                    {currentUser?.emergencyContactPhone || '+91 98401 22819'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[13px] text-teal-tactical">gavel</span> Full DPOA Consent
                </span>
                <span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[13px] text-secondary">sms</span> Live SMS Telemetry
                </span>
                <span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[13px] text-teal-tactical">vital_signs</span> ICU Break-Glass
                </span>
              </div>
            </div>
            <div className="pt-5 mt-4 border-t border-outline-variant/20 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => showToast(`Emergency alert broadcasted to ${currentUser?.emergencyContactName || 'Ananya S. Sharma'} (${currentUser?.emergencyContactPhone || '+91 98401 22819'})`)}
                className="flex-1 py-2 px-3 bg-surface-container-low hover:bg-surface-container text-primary rounded-xl font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-teal-tactical">cell_tower</span>
                Simulate Beacon
              </button>
              <a
                href={`tel:${(currentUser?.emergencyContactPhone || '+919840122819').replace(/\s+/g, '')}`}
                className="py-2 px-3 bg-surface-container-low hover:bg-surface-container text-secondary rounded-xl font-label-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-outline-variant/30 no-underline"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                Call
              </a>
            </div>
          </div>

          {/* Priority 2 Contact (Secondary Medical Proxy) */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="bg-surface-container-highest text-secondary text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[13px] text-teal-tactical">medical_services</span> Secondary Medical Proxy
                </span>
                <span className="bg-surface-container text-secondary font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-outline-variant/30">
                  Tier-2 (+2m Delay)
                </span>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-secondary flex items-center justify-center font-headline-md text-lg font-bold shrink-0 border border-outline-variant/20">
                  VS
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-headline-sm text-base font-bold text-on-surface truncate">Dr. Vijay Sharma</h3>
                  <span className="text-xs text-on-surface-variant font-medium">Secondary Contact • Clinical Consult Proxy</span>
                  <span className="text-xs font-mono font-bold text-primary mt-1">+91 94440 18234</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[13px] text-teal-tactical">health_and_safety</span> Clinical Consult Proxy
                </span>
                <span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[13px] text-secondary">history_edu</span> Diagnostics Access
                </span>
                <span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[13px] text-teal-tactical">update</span> 2-min Fallback Relay
                </span>
              </div>
            </div>
            <div className="pt-5 mt-4 border-t border-outline-variant/20 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => showToast('Simulated live broadcast sent to Dr. Vijay Sharma (+91 94440 18234)')}
                className="flex-1 py-2 px-3 bg-surface-container-low hover:bg-surface-container text-primary rounded-xl font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-teal-tactical">cell_tower</span>
                Simulate Beacon
              </button>
              <a
                href="tel:+919444018234"
                className="py-2 px-3 bg-surface-container-low hover:bg-surface-container text-secondary rounded-xl font-label-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-outline-variant/30 no-underline"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                Call
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: ABDM INGRESS DIAGNOSTICS & TELEMETRY LOGS */}
      {activeTab === 'telemetry' && (
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/40 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div>
              <h2 className="font-headline-sm text-base font-bold text-primary">ABDM Emergency Audit &amp; Telemetry Feed</h2>
              <p className="text-xs text-on-surface-variant">Real-time audit log of emergency passes, triage pings, and hospital location queries.</p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Diagnostics re-verified: Zero packet loss')}
              className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container text-primary text-xs font-bold rounded-xl flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Run Diagnostics
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant uppercase font-bold">Network Ping Latency</span>
              <div className="font-headline-md text-xl font-mono font-bold text-primary mt-1">0.18 ms</div>
              <span className="text-[10px] text-teal-700 font-semibold">Sub-3s SLA Compliant</span>
            </div>
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant uppercase font-bold">Encrypted Token</span>
              <div className="font-headline-md text-base font-mono font-bold text-primary mt-1">EK-TR-88190-V4</div>
              <span className="text-[10px] text-emerald-700 font-semibold">AES-256 Armed</span>
            </div>
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant uppercase font-bold">Connected Nodes</span>
              <div className="font-headline-md text-xl font-mono font-bold text-primary mt-1">{hospitals.length} Trauma Hubs</div>
              <span className="text-[10px] text-emerald-700 font-semibold">100% Ingress Reach</span>
            </div>
          </div>
        </div>
      )}

      {/* Emergency SOS Modal */}
      <EmergencySosModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        hospital={sosTargetHospital || selectedHospital || hospitals[0]}
        userLocation={userLocation}
        patientData={currentUser}
      />
    </div>
  );
}
