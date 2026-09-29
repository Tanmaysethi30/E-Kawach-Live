import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeTelemetry, getTelemetrySnapshot } from '../services/telemetry';

const TelemetryContext = createContext(getTelemetrySnapshot());

export function TelemetryProvider({ children }) {
  const [telemetry, setTelemetry] = useState(getTelemetrySnapshot());

  useEffect(() => {
    const unsubscribe = subscribeTelemetry((updated) => {
      setTelemetry(updated);
    });
    return unsubscribe;
  }, []);

  return (
    <TelemetryContext.Provider value={telemetry}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useRealtimeTelemetry() {
  return useContext(TelemetryContext);
}
