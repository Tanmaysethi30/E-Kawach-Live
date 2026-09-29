import React from 'react';

export default function Avatar({
  initials,
  name,
  size = 'md',
  role = 'patient',
  className = '',
  icon,
}) {
  const sizeClasses = {
    xs: 'w-7 h-7 text-[11px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const roleColors = {
    patient: 'bg-primary text-on-primary',
    doctor: 'bg-primary text-on-primary',
    admin: 'bg-primary-container text-on-primary',
    emergency: 'bg-error text-on-error',
    nurse: 'bg-secondary text-on-secondary',
    tertiary: 'bg-tertiary-container text-on-tertiary-container',
  };

  const computedInitials =
    initials ||
    (name
      ? name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'U');

  return (
    <div
      className={`relative inline-flex items-center justify-center font-headline-sm font-semibold rounded-full shrink-0 shadow-xs select-none ${
        sizeClasses[size] || sizeClasses.md
      } ${roleColors[role] || roleColors.patient} ${className}`}
      title={name || initials}
    >
      {icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : (
        <span>{computedInitials}</span>
      )}
    </div>
  );
}
