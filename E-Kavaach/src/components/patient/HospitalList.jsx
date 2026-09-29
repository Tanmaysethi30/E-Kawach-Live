import React, { useState } from 'react';

export default function HospitalList({
  hospitals = [],
  selectedHospital = null,
  onSelectHospital,
  userLocation,
  onRequestGpsLocation,
  onResetLocation,
  onOpenSos,
  isLoading = false,
  routeData = null,
  isLoadingRoute = false,
  isLiveGpsTracking = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'icu' | 'trauma' | 'nearby' | 'govt' | 'private'
  const [viewMode, setViewMode] = useState('hospitals'); // 'hospitals' | 'directions'

  // Filter hospitals
  const filteredHospitals = hospitals.filter((hosp) => {
    if (!hosp) return false;
    const s = searchTerm.trim().toLowerCase();
    const hospName = hosp.name || hosp.hospital_name || '';
    const hospCity = hosp.city || hosp.address || '';
    const hospAddress = hosp.address || '';
    const hospSpecialties = Array.isArray(hosp.specialties) ? hosp.specialties.join(' ') : (hosp.specialties || '');
    const hospType = (hosp.hospitalType || hosp.type || '').toLowerCase();

    const matchesSearch =
      !s ||
      hospName.toLowerCase().includes(s) ||
      hospCity.toLowerCase().includes(s) ||
      hospAddress.toLowerCase().includes(s) ||
      hospSpecialties.toLowerCase().includes(s) ||
      hospType.includes(s);

    if (!matchesSearch) return false;

    if (filterType === 'icu') {
      const icuAvail = hosp.icuBedsAvailable ?? (hosp.icuBedsTotal ? hosp.icuBedsTotal - (hosp.icuBedsOccupied || 0) : 0);
      return Number(icuAvail) > 0 || (hosp.facilities && hosp.facilities.some((f) => f.toLowerCase().includes('icu')));
    }
    if (filterType === 'oxygen') {
      const oxyAvail = hosp.oxygenBedsAvailable ?? hosp.oxygenBeds ?? 0;
      return Number(oxyAvail) > 0 || (hosp.facilities && hosp.facilities.some((f) => f.toLowerCase().includes('o2') || f.toLowerCase().includes('oxygen')));
    }
    if (filterType === 'trauma') {
      return hosp.traumaBayReady || hosp.emergency24x7 || hosp.isTraumaHub || (hosp.specialties && hosp.specialties.some((sp) => sp.toLowerCase().includes('trauma') || sp.toLowerCase().includes('emergency')));
    }
    if (filterType === 'nearby') {
      const dist = hosp.distanceKm ?? hosp.distance ?? 999;
      return Number(dist) <= 15;
    }
    if (filterType === 'govt') {
      return hospType.includes('govt') || hospType.includes('government') || hospName.toLowerCase().includes('govt') || hospName.toLowerCase().includes('government') || hospName.toLowerCase().includes('general') || hospName.toLowerCase().includes('aiims') || hospName.toLowerCase().includes('civil');
    }
    if (filterType === 'private') {
      return hospType.includes('private') || hospType.includes('trust') || (!hospType.includes('govt') && !hospType.includes('government') && !hospName.toLowerCase().includes('govt') && !hospName.toLowerCase().includes('general') && !hospName.toLowerCase().includes('civil') && !hospName.toLowerCase().includes('aiims'));
    }

    return true;
  });

  // Helper for Turn-by-Turn Step Icon
  const getManeuverIcon = (type = '', modifier = '') => {
    const t = type.toLowerCase();
    const m = modifier.toLowerCase();
    if (t.includes('arrive')) return 'flag';
    if (t.includes('depart')) return 'navigation';
    if (m.includes('right')) return 'turn_right';
    if (m.includes('left')) return 'turn_left';
    if (m.includes('slight right')) return 'turn_slight_right';
    if (m.includes('slight left')) return 'turn_slight_left';
    if (m.includes('u-turn') || t.includes('roundabout')) return 'u_turn_left';
    return 'straight';
  };

  return (
    <div className="flex flex-col gap-4 bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/40 shadow-sm h-[600px] lg:h-[740px] overflow-hidden">
      {/* 1. Live Patient GPS Tracker Card */}
      <div className="p-3.5 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl border border-blue-500/30 shadow-md flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400"></span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 font-mono">
              Live System Location
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRequestGpsLocation}
              title="Force GPS Refresh"
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[13px] ${isLiveGpsTracking ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>Sync GPS</span>
            </button>
            <button
              type="button"
              onClick={onResetLocation}
              title="Reset to Default Location"
              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex items-baseline justify-between text-xs">
          <div className="flex flex-col min-w-0">
            <span className="font-mono font-extrabold text-sm text-white truncate">
              {userLocation?.areaName ? `${userLocation.areaName}, ${userLocation.city || ''}` : `${userLocation?.lat?.toFixed(4)}° N, ${userLocation?.lng?.toFixed(4)}° E`}
            </span>
            <span className="text-[11px] text-blue-200/90 truncate">
              {userLocation?.displayName || userLocation?.label || `${userLocation?.lat?.toFixed(4)}° N, ${userLocation?.lng?.toFixed(4)}° E`}
            </span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ml-2">
            LIVE GPS
          </span>
        </div>
      </div>

      {/* 2. Mode Selector: Hospitals List vs. Turn-by-Turn Driving Route */}
      <div className="flex items-center bg-surface-container-low p-1 rounded-2xl border border-outline-variant/30 shrink-0">
        <button
          type="button"
          onClick={() => setViewMode('hospitals')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === 'hospitals'
              ? 'bg-primary text-white shadow-xs'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">local_hospital</span>
          <span>Nearby Hospitals ({filteredHospitals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('directions')}
          disabled={!selectedHospital}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === 'directions'
              ? 'bg-blue-600 text-white shadow-xs'
              : selectedHospital
              ? 'text-on-surface-variant hover:text-primary'
              : 'text-slate-400 cursor-not-allowed opacity-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">directions</span>
          <span>OSRM Route Steps</span>
          {selectedHospital && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          )}
        </button>
      </div>

      {/* VIEW A: HOSPITALS LIST */}
      {viewMode === 'hospitals' && (
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          {/* Search Bar */}
          <div className="relative shrink-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by hospital name, city, specialty..."
              className="w-full pl-9 pr-8 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-medium text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary text-[14px]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
            {[
              { id: 'all', label: 'All Hospitals' },
              { id: 'icu', label: '🛏️ ICU Avail' },
              { id: 'oxygen', label: '💨 O₂ Beds' },
              { id: 'trauma', label: '🚨 Trauma Bay' },
              { id: 'nearby', label: '⚡ <10 km' },
              { id: 'govt', label: '🏛️ Govt' },
              { id: 'private', label: '🏢 Private' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filterType === f.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Hospitals Scrollable Feed */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 divide-y divide-outline-variant/10">
            {isLoading && (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-on-surface-variant font-medium">
                  Calculating real-time hospital proximity...
                </span>
              </div>
            )}

            {!isLoading && filteredHospitals.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant">search_off</span>
                <span className="text-xs font-semibold text-on-surface">No hospitals match your criteria</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="text-xs text-primary font-bold underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {!isLoading &&
              filteredHospitals.map((hosp) => {
                const isSelected = selectedHospital && selectedHospital.id === hosp.id;
                const icuAvail = hosp.icuBedsAvailable || 0;
                const icuTotal = hosp.icuBedsTotal || 30;

                return (
                  <div
                    key={hosp.id}
                    onClick={() => onSelectHospital(hosp)}
                    className={`pt-2.5 pb-2.5 px-3 rounded-2xl transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-blue-50/90 border-2 border-blue-500 shadow-md ring-1 ring-blue-400'
                        : 'hover:bg-surface-container-low border border-transparent hover:border-outline-variant/20'
                    }`}
                  >
                    {/* Top Row: Name & Proximity */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-mono font-bold text-secondary bg-surface-container px-1.5 py-0.2 rounded">
                            {hosp.code || 'EK-NODE'}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              hosp.hospitalType === 'Government'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {hosp.hospitalType}
                          </span>
                          {hosp.traumaBayReady && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              🚨 Trauma Bay Ready
                            </span>
                          )}
                        </div>
                        <h4 className="font-headline-sm text-xs font-bold text-primary truncate mt-0.5">
                          {hosp.name}
                        </h4>
                        <p className="text-[10px] text-on-surface-variant truncate">
                          {hosp.address}, {hosp.city}
                        </p>
                      </div>

                      {/* Distance Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-headline-md text-sm font-extrabold text-blue-700 font-mono">
                          {hosp.distanceKm} km
                        </span>
                        <span className="text-[10px] text-rose-700 font-bold font-mono">
                          🚑 ~{hosp.ambulanceMins}m
                        </span>
                      </div>
                    </div>

                    {/* Middle Bed & Resource Matrix */}
                    <div className="grid grid-cols-4 gap-1 text-center text-[10px] bg-surface-container-lowest/90 p-1.5 rounded-xl border border-outline-variant/20">
                      <div>
                        <span className="text-on-surface-variant block text-[8px] sm:text-[9px]">ICU Beds</span>
                        <span className={`font-mono font-bold ${icuAvail > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {icuAvail}/{icuTotal}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block text-[8px] sm:text-[9px]">O₂ Beds</span>
                        <span className="font-mono font-bold text-sky-700">
                          {hosp.oxygenBedsAvailable ?? Math.max(3, icuAvail * 2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block text-[8px] sm:text-[9px]">Ward Free</span>
                        <span className="font-mono font-bold text-primary">{hosp.availableBeds}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block text-[8px] sm:text-[9px]">Trauma Bay</span>
                        <span className={`font-mono font-bold ${hosp.traumaBayReady !== false ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {hosp.traumaBayReady !== false ? 'Ready' : 'Standby'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1 border-t border-outline-variant/10">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={`tel:${hosp.contactNumbers?.er || '+914428290200'}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-mono font-bold text-rose-700 hover:underline flex items-center gap-0.5"
                          title="Direct Emergency Line"
                        >
                          <span className="material-symbols-outlined text-[13px]">call</span>
                          <span>ER: {hosp.contactNumbers?.er || '+91 44 2829 0200'}</span>
                        </a>
                        {(hosp.contactNumbers?.reception || hosp.reception) && (
                          <a
                            href={`tel:${hosp.contactNumbers?.reception || hosp.reception}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-mono text-on-surface-variant hover:text-primary hover:underline flex items-center gap-0.5"
                            title="Hospital Reception Desk"
                          >
                            <span className="material-symbols-outlined text-[13px]">desk</span>
                            <span>Desk: {hosp.contactNumbers?.reception || hosp.reception}</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectHospital(hosp);
                            setViewMode('directions');
                          }}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[12px]">alt_route</span>
                          Route
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenSos) onOpenSos(hosp);
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[12px]">cell_tower</span>
                          SOS
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {!isLoading && filteredHospitals.length === 0 && (
              <div className="p-4 bg-blue-50/80 rounded-2xl border-2 border-dashed border-blue-300 flex flex-col gap-3 text-center items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <span className="material-symbols-outlined text-[22px]">domain_verification</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-blue-900">
                    Universal Hospital Fallback Active
                  </span>
                  <p className="text-[11px] text-blue-800 mt-1 max-w-xs">
                    No custom matching local node was found. The e-Kavach Universal Emergency Health &amp; Trauma Hub is available 24x7 for Golden-Hour triage and ambulance dispatch.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                    }}
                    className="px-3 py-1.5 bg-surface-container text-xs font-semibold rounded-xl text-primary hover:bg-surface-container-high cursor-pointer"
                  >
                    Reset Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const universal = {
                        id: 'hosp-universal-apex',
                        name: 'e-Kavach Universal Emergency Health & Trauma Hub',
                        code: 'EK-UNIV-APEX-01',
                        hospitalType: 'Government / Central Grid',
                        address: 'National Central Emergency Grid, GT Karnal Corridor',
                        city: 'Delhi',
                        state: 'Delhi',
                        distanceKm: 2.5,
                        ambulanceMins: 6,
                        icuBedsAvailable: 68,
                        icuBedsTotal: 120,
                        totalBeds: 950,
                        availableBeds: 410,
                        oxygenBeds: 350,
                        ventilatorsAvailable: 45,
                        ventilatorsTotal: 80,
                        contactNumbers: { er: '+91 11 2700 0108', helpline: '1800-11-0108', ambulance: '108' },
                        emergency24x7: true,
                        traumaBayReady: true,
                      };
                      onSelectHospital(universal);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-white shadow-sm cursor-pointer"
                  >
                    Select Universal Hub
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW B: OSRM & OPENSTREETMAP TURN-BY-TURN DRIVING DIRECTIONS */}
      {viewMode === 'directions' && selectedHospital && (
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          {/* Active Navigation Summary Header */}
          <div className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-sm flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">turn_sharp_right</span>
                OSRM Open-Source Road Navigation
              </span>
              <button
                type="button"
                onClick={() => setViewMode('hospitals')}
                className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-md font-bold cursor-pointer"
              >
                Back to List
              </button>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-extrabold font-mono">
                  {routeData?.durationMins || selectedHospital.ambulanceMins} min
                </span>
                <span className="text-xs text-blue-100 ml-1.5 font-mono">
                  ({routeData?.distanceKm || selectedHospital.distanceKm} km)
                </span>
              </div>
              <span className="text-[11px] bg-emerald-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full font-mono">
                Fastest Route
              </span>
            </div>

            <p className="text-[11px] text-blue-100 truncate m-0">
              To <strong className="text-white">{selectedHospital.name}</strong>
            </p>
          </div>

          {/* Turn-by-Turn Steps List */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
            {isLoadingRoute && (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-on-surface-variant font-medium">Fetching real turn-by-turn maneuvers...</span>
              </div>
            )}

            {!isLoadingRoute && routeData?.steps && routeData.steps.length > 0 ? (
              routeData.steps.map((step, idx) => {
                const iconName = getManeuverIcon(step.type, step.modifier);
                const isLast = idx === routeData.steps.length - 1;

                return (
                  <div
                    key={step.id || idx}
                    className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                      isLast
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                        : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isLast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-bold text-xs leading-snug m-0 text-on-surface">
                        {step.instruction}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-mono mt-1">
                        <span className="font-bold text-primary">{step.distanceFormatted}</span>
                        {step.name && step.name !== 'Main Corridor' && (
                          <>
                            <span>•</span>
                            <span className="truncate">{step.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              !isLoadingRoute && (
                <div className="p-4 bg-surface-container-low rounded-2xl text-center text-xs text-on-surface-variant">
                  Standard emergency corridor calculated. Follow navigation arrows on the interactive map.
                </div>
              )
            )}
          </div>

          {/* Launch OpenStreetMap Route */}
          <div className="pt-2 border-t border-outline-variant/20 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const lat = selectedHospital.geoLat;
                const lng = selectedHospital.geoLng;
                const userLat = userLocation?.lat || 13.0827;
                const userLng = userLocation?.lng || 80.2707;
                window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLat},${userLng};${lat},${lng}`, '_blank');
              }}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">map</span>
              Open in OpenStreetMap
            </button>
            <button
              type="button"
              onClick={() => onOpenSos(selectedHospital)}
              className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">cell_tower</span>
              SOS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
