/**
 * Real-world geolocation & geocoding utility for E-KAVACH.
 * Queries backend proxies, browser GPS, and OpenStreetMap without CORS or forbidden header errors.
 */

// 1. IP Geolocation (Queries Backend proxy with Cloudflare Edge IP support first)
export async function detectClientIpLocation() {
  // A. Backend Proxy (Handles Cloudflare headers, ISP IP, and server-side geocoding)
  try {
    const res = await fetch('/api/patient/ip-location', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.lat && data.lng) {
        return {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
          city: data.city || 'Local Area',
          region: data.region || 'India',
          label: data.label || `${data.city || 'Detected City'}, ${data.region || 'India'} (Live Location)`,
          source: data.source || 'BACKEND_IP',
        };
      }
    }
  } catch (_e) {
    // Continue to client-side fallbacks
  }

  // B. Client-side public IP geo fallbacks
  const clientApis = [
    async () => {
      const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('ipwho failed');
      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
          city: data.city || 'Local Region',
          region: data.region || 'India',
          label: `${data.city || 'Detected Area'}, ${data.region || 'India'} (IP Synced)`,
          source: 'CLIENT_IP',
        };
      }
      throw new Error('Invalid IP payload');
    },
    async () => {
      const res = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('freeipapi failed');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
          city: data.cityName || 'Local Area',
          region: data.regionName || 'India',
          label: `${data.cityName || 'Detected Area'}, ${data.regionName || 'India'} (IP Synced)`,
          source: 'CLIENT_IP',
        };
      }
      throw new Error('Invalid IP payload');
    },
  ];

  for (const apiCall of clientApis) {
    try {
      const result = await apiCall();
      if (result) return result;
    } catch (_e) {
      // try next
    }
  }

  return null;
}

// 2. Search City / Address using Backend Proxy (No CORS / No Forbidden User-Agent issues)
export async function searchLocationByQuery(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) return [];

  // A. Try Backend Search Proxy
  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`/api/patient/search-location?q=${encoded}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn('Backend search location warning:', err.message);
  }

  // B. Fallback to direct Nominatim (clean headers, no forbidden User-Agent)
  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=in&limit=5&addressdetails=1`,
      {
        signal: AbortSignal.timeout(4000),
      }
    );

    if (res.ok) {
      const data = await res.json();
      return (data || []).map((item) => {
        const addr = item.address || {};
        const areaName = addr.suburb || addr.neighbourhood || addr.road || item.name || item.display_name.split(',')[0];
        const city = addr.city || addr.town || addr.state_district || 'City';
        return {
          displayName: item.display_name,
          name: item.name || areaName,
          areaName,
          city,
          label: `${areaName}, ${city}`,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type,
        };
      });
    }
  } catch (err) {
    console.warn('Client Nominatim search warning:', err.message);
  }

  // C. Built-in major Indian cities instant match
  const indianPresets = [
    { name: 'New Delhi', lat: 28.6139, lng: 77.2090, city: 'New Delhi', state: 'Delhi' },
    { name: 'Indore', lat: 22.7196, lng: 75.8577, city: 'Indore', state: 'Madhya Pradesh' },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra' },
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, city: 'Bengaluru', state: 'Karnataka' },
    { name: 'Chennai', lat: 13.0604, lng: 80.2496, city: 'Chennai', state: 'Tamil Nadu' },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873, city: 'Jaipur', state: 'Rajasthan' },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, city: 'Kolkata', state: 'West Bengal' },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana' },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, city: 'Pune', state: 'Maharashtra' },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', state: 'Gujarat' },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462, city: 'Lucknow', state: 'Uttar Pradesh' },
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, city: 'Chandigarh', state: 'Punjab' },
  ];
  const qLower = query.toLowerCase();
  return indianPresets
    .filter((c) => c.name.toLowerCase().includes(qLower) || c.city.toLowerCase().includes(qLower))
    .map((c) => ({
      displayName: `${c.name}, ${c.state}, India`,
      name: c.name,
      areaName: c.name,
      city: c.city,
      label: `${c.name}, ${c.state}`,
      lat: c.lat,
      lng: c.lng,
    }));
}

// 3. Reverse Geocode Coordinates to human-readable address
export async function reverseGeocodeCoords(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        signal: AbortSignal.timeout(3000),
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.address) {
        const city = data.address.city || data.address.town || data.address.state_district || data.address.county || 'City Center';
        const suburb = data.address.suburb || data.address.neighbourhood || data.address.residential || '';
        const state = data.address.state || 'India';
        return {
          city,
          suburb,
          state,
          label: suburb ? `${suburb}, ${city}, ${state}` : `${city}, ${state}`,
        };
      }
    }
  } catch (e) {
    console.warn('Reverse geocode error:', e.message);
  }
  return null;
}
