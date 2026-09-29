import React from 'react';
import { Outlet } from 'react-router-dom';
import EmergencyMarquee from '../common/EmergencyMarquee';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      <EmergencyMarquee />
      <PublicNavbar />
      <div className="pt-28 flex-1">
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  );
}
