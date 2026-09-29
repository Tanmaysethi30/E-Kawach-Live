import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle, logoutFirebase } from '../services/firebase';

const AuthContext = createContext();

export const roleProfiles = {
  patient: {
    role: 'patient',
    registration_id: 'REG-PAT-RAJESH-1001',
    registrationId: 'REG-PAT-RAJESH-1001',
    name: 'Rajesh V. Sharma',
    id: 'ABHA-9824-8819-TN',
    tag: 'Verified Health ID',
    hospital: 'Apollo Greams Trauma Hub',
    dashboardRoute: '/patient/dashboard',
    emergencyContactName: 'Ananya S. Sharma',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+91 98401 22819',
  },
  doctor: {
    role: 'doctor',
    registration_id: 'REG-DOC-KAVITHA-2002',
    registrationId: 'REG-DOC-KAVITHA-2002',
    hospitalRegistrationId: 'REG-HOSP-APOLLO-0842',
    name: 'Dr. Kavitha Menon',
    title: 'Chief Interventional Cardio',
    id: 'NMC: MD-44912-TN',
    tag: 'ID-9942',
    hospital: 'Apollo Greams Trauma Hub',
    dashboardRoute: '/doctor/dashboard',
  },
  hospital: {
    role: 'hospital',
    registration_id: 'REG-HOSP-ADMIN-3003',
    registrationId: 'REG-HOSP-ADMIN-3003',
    hospitalRegistrationId: 'REG-HOSP-APOLLO-0842',
    name: 'Dr. R. K. Nambiar',
    title: 'Hospital Administrator',
    id: 'AP-HSP-842-TN',
    email: 'namanjain82670@gmail.com',
    tag: 'VERIFIED ADMIN',
    hospital: 'Apollo Greams Trauma Hub',
    dashboardRoute: '/admin/dashboard',
  },
  admin: {
    role: 'hospital',
    registration_id: 'REG-HOSP-ADMIN-3003',
    registrationId: 'REG-HOSP-ADMIN-3003',
    hospitalRegistrationId: 'REG-HOSP-APOLLO-0842',
    name: 'Dr. R. K. Nambiar',
    title: 'Hospital Administrator',
    id: 'AP-HSP-842-TN',
    email: 'namanjain82670@gmail.com',
    tag: 'VERIFIED ADMIN',
    hospital: 'Apollo Greams Trauma Hub',
    dashboardRoute: '/admin/dashboard',
  },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ekawach_user') || localStorage.getItem('ekavach_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = async (role, credentials = {}) => {
    const normRole = role === 'admin' ? 'hospital' : (role || 'patient');
    const profile = roleProfiles[normRole] || roleProfiles.patient;
    const hasCredentials = Boolean(credentials.identifier || credentials.email || credentials.phone || credentials.password);
    
    try {
      const demoIdentifier = normRole === 'doctor' ? 'dr.kavitha@apollo.health' : normRole === 'hospital' ? 'admin.chennai@apollo.health' : 'rajesh.sharma@ekawach.health';
      const demoPassword = 'password123';

      const payload = {
        role: normRole,
        identifier: (credentials.identifier || (hasCredentials ? '' : demoIdentifier)).trim(),
        email: (credentials.identifier || (hasCredentials ? '' : demoIdentifier)).trim(),
        phone: (credentials.identifier || (hasCredentials ? '' : demoIdentifier)).trim(),
        password: credentials.password || (hasCredentials ? '' : demoPassword),
      };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.user) {
        const regId = data.user.registration_id || data.registration_id || profile.registration_id;
        const merged = {
          ...profile,
          ...data.user,
          registration_id: regId,
          registrationId: regId,
          role: normRole,
          dashboardRoute: profile.dashboardRoute,
        };
        setCurrentUser(merged);
        localStorage.setItem('ekawach_user', JSON.stringify(merged));
        if (data.accessToken) {
          localStorage.setItem('ekawach_token', data.accessToken);
        }
        if (normRole === 'patient') {
          const patientProfileData = {
            userId: merged.userId || merged.id,
            email: merged.email,
            fullName: merged.name || merged.fullName,
            name: merged.name || merged.fullName,
            abhaNumber: merged.abhaNumber || merged.id,
            phone: merged.phone,
            aadhaarNumber: merged.aadhaarNumber,
            bloodGroup: merged.bloodGroup,
            gender: merged.gender,
            dob: merged.dob,
            age: merged.age,
            address: merged.address,
            pincode: merged.pincode,
            city: merged.city,
            state: merged.state,
            emergencyContactName: merged.emergencyContactName,
            emergencyContactPhone: merged.emergencyContactPhone,
            emergencyContactRelation: merged.emergencyContactRelation,
            bpLevel: merged.bpLevel,
            hasDiabetes: merged.hasDiabetes,
            diabetesType: merged.diabetesType,
            diabetesMedication: merged.diabetesMedication,
            profileCompleted: merged.profileCompleted,
          };
          localStorage.setItem('ekawach_patient_profile', JSON.stringify(patientProfileData));
          window.dispatchEvent(new CustomEvent('ekawach_patient_profile_updated', { detail: { source: 'AuthContext' } }));
        }
        if (normRole === 'patient' && (merged.profileCompleted === false || (!merged.bloodGroup && !merged.pincode))) {
          return '/patient/settings#profile';
        }
        return profile.dashboardRoute;
      } else {
        const errorMsg = data.error || data.message || 'Invalid credentials or account not found in database';
        if (hasCredentials) {
          throw new Error(errorMsg);
        }
      }
    } catch (e) {
      if (hasCredentials) {
        throw e;
      }
      console.warn('Backend login fallback to demo profile:', e);
    }

    if (!hasCredentials) {
      setCurrentUser(profile);
      localStorage.setItem('ekawach_user', JSON.stringify(profile));
      if (normRole === 'patient' && (profile.profileCompleted === false || (!profile.bloodGroup && !profile.pincode))) {
        return '/patient/settings#profile';
      }
      return profile.dashboardRoute;
    }
    throw new Error('Authentication failed. Please check your credentials.');
  };

  const register = async (role, details = {}) => {
    const normRole = role === 'admin' ? 'hospital' : (role || 'patient');
    const baseProfile = roleProfiles[normRole] || roleProfiles.patient;
    
    // Normalize and validate email format (ensure TLD if @ present)
    let cleanEmail = (details.email || '').trim().toLowerCase();
    if (cleanEmail && cleanEmail.includes('@')) {
      const parts = cleanEmail.split('@');
      if (parts[1] && !parts[1].includes('.')) {
        cleanEmail = `${cleanEmail}.com`;
      }
    }
    if (!cleanEmail) {
      cleanEmail = `${normRole}_${Date.now()}@ekawach.gov.in`;
    }

    const cleanPhone = (details.phone || details.contact || '').trim();

    // Generate unique ID according to role
    const assignedId = normRole === 'doctor'
      ? (details.licenseId || details.nmcNumber ? ((details.licenseId || details.nmcNumber).startsWith('NMC') ? (details.licenseId || details.nmcNumber) : `NMC: ${details.licenseId || details.nmcNumber}`) : baseProfile.id)
      : (normRole === 'hospital'
        ? (details.regId || details.clinicalId || baseProfile.id)
        : (details.abhaNumber || `ABHA-${(details.aadhaar || cleanPhone || Date.now().toString()).slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}-TN`));

    const userPayload = {
      ...baseProfile,
      ...details,
      name: details.name || baseProfile.name,
      id: assignedId,
      email: cleanEmail,
      phone: cleanPhone || baseProfile.phone,
      hospital: details.hospital || (normRole === 'hospital' ? (details.name || baseProfile.hospital) : baseProfile.hospital),
      hospitalRegistrationId: details.regId || details.clinicalId || baseProfile.hospitalRegistrationId || '',
      nmcNumber: details.licenseId || details.nmcNumber || baseProfile.nmcNumber || '',
      licenseId: details.licenseId || details.nmcNumber || baseProfile.licenseId || '',
      title: details.title || (normRole === 'doctor' ? (details.specialization ? `${details.specialization} Specialist` : baseProfile.title) : baseProfile.title),
      specialization: details.specialization || (normRole === 'doctor' ? baseProfile.specialization : ''),
      abhaNumber: normRole === 'patient' ? assignedId : '',
      bloodGroup: details.bloodGroup || '',
      pincode: details.pincode || '',
      address: details.address || '',
      city: details.city || '',
      state: details.state || '',
      dob: details.dob || '',
      gender: details.gender || '',
      bpLevel: details.bpLevel || 'Normal (120/80)',
      hasDiabetes: details.hasDiabetes || 'No',
      diabetesType: details.diabetesType || '',
      diabetesMedication: details.diabetesMedication || '',
      emergencyContactName: details.emergencyContactName || baseProfile.emergencyContactName || '',
      emergencyContactRelation: details.emergencyContactRelation || baseProfile.emergencyContactRelation || 'Parent',
      emergencyContactPhone: details.emergencyContactPhone || baseProfile.emergencyContactPhone || '',
      allergies: details.allergies || '',
      conditions: details.conditions || '',
      aadhaarNumber: details.aadhaar || details.aadhaarNumber || '',
      profileCompleted: normRole === 'patient' ? false : true,
      role: normRole,
      dashboardRoute: baseProfile.dashboardRoute,
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          phone: cleanPhone || undefined,
          password: details.password || 'Ekawach@2026',
          role: normRole,
          name: userPayload.name,
          additionalDetails: userPayload,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const regId = data.user.registration_id || data.registration_id || `REG-${Date.now()}`;
          const merged = {
            ...userPayload,
            ...data.user,
            registration_id: regId,
            registrationId: regId,
            role: normRole,
            dashboardRoute: baseProfile.dashboardRoute,
            profileCompleted: normRole === 'patient' ? false : true,
          };
          setCurrentUser(merged);
          localStorage.setItem('ekawach_user', JSON.stringify(merged));
          if (data.accessToken) {
            localStorage.setItem('ekawach_token', data.accessToken);
          }
          if (normRole === 'patient') {
            const patientProfileData = {
              userId: merged.userId || merged.id,
              email: merged.email,
              fullName: merged.name || merged.fullName,
              name: merged.name || merged.fullName,
              abhaNumber: merged.abhaNumber || merged.id,
              phone: merged.phone,
              aadhaarNumber: merged.aadhaarNumber,
              bloodGroup: merged.bloodGroup,
              gender: merged.gender,
              dob: merged.dob,
              age: merged.age,
              address: merged.address,
              pincode: merged.pincode,
              city: merged.city,
              state: merged.state,
              emergencyContactName: merged.emergencyContactName,
              emergencyContactPhone: merged.emergencyContactPhone,
              emergencyContactRelation: merged.emergencyContactRelation,
              bpLevel: merged.bpLevel,
              hasDiabetes: merged.hasDiabetes,
              diabetesType: merged.diabetesType,
              diabetesMedication: merged.diabetesMedication,
              profileCompleted: merged.profileCompleted,
            };
            localStorage.setItem('ekawach_patient_profile', JSON.stringify(patientProfileData));
            window.dispatchEvent(new CustomEvent('ekawach_patient_profile_updated', { detail: { source: 'AuthContext' } }));
          }
          return normRole === 'patient' ? '/patient/settings#profile' : (normRole === 'hospital' ? '/admin/hospital-details' : baseProfile.dashboardRoute);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        let message = errData.error || errData.message || 'Registration failed. Please check your credentials.';
        if (errData.details && Array.isArray(errData.details)) {
          const detailMessages = errData.details.map((d) => `${d.path}: ${d.message}`).join(', ');
          message = `${message} (${detailMessages})`;
        }
        throw new Error(message);
      }
    } catch (e) {
      console.warn('Registration attempt failed:', e.message);
      throw e;
    }
  };

  const updateProfileDetails = (updatedFields) => {
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        ...updatedFields,
        profileCompleted: true,
      };
      if (updatedFields.fullName && !updatedFields.name) {
        updated.name = updatedFields.fullName;
      }
      localStorage.setItem('ekawach_user', JSON.stringify(updated));
      return updated;
    });

    const token = localStorage.getItem('ekawach_token');
    fetch('/api/patient/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updatedFields),
    }).catch(() => {});
  };

  const createPassword = async (role, details = {}) => {
    const normRole = role === 'admin' ? 'hospital' : (role || 'patient');
    const profile = roleProfiles[normRole] || roleProfiles.patient;
    try {
      const res = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: normRole,
          identifier: details.identifier || details.email || details.phone,
          newPassword: details.password || details.newPassword,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const regId = data.user.registration_id || data.registration_id || profile.registration_id;
          const merged = { ...profile, ...data.user, registration_id: regId, registrationId: regId, role: normRole, dashboardRoute: profile.dashboardRoute };
          setCurrentUser(merged);
          localStorage.setItem('ekawach_user', JSON.stringify(merged));
          if (data.accessToken) {
            localStorage.setItem('ekawach_token', data.accessToken);
          }
          return profile.dashboardRoute;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create password');
      }
    } catch (e) {
      console.warn('Create password error:', e);
      throw e;
    }
    const merged = { ...profile, role: normRole, dashboardRoute: profile.dashboardRoute };
    setCurrentUser(merged);
    localStorage.setItem('ekawach_user', JSON.stringify(merged));
    return profile.dashboardRoute;
  };

  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    // Local session verification on mount / refresh
    const savedToken = localStorage.getItem('ekawach_token') || localStorage.getItem('ekavach_token');
    const savedUser = localStorage.getItem('ekawach_user') || localStorage.getItem('ekavach_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (!parsed.registration_id && parsed.registrationId) {
          parsed.registration_id = parsed.registrationId;
        }
        setCurrentUser(parsed);
      } catch (_e) {}
    }

    if (savedToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser((prev) => {
              const updated = { ...(prev || {}), ...data.user };
              localStorage.setItem('ekawach_user', JSON.stringify(updated));
              return updated;
            });
            if (data.user.role === 'patient') {
              const u = data.user;
              const patientProfileData = {
                userId: u.userId || u.id,
                email: u.email,
                fullName: u.name || u.fullName,
                name: u.name || u.fullName,
                abhaNumber: u.abhaNumber || u.id,
                phone: u.phone,
                aadhaarNumber: u.aadhaarNumber,
                bloodGroup: u.bloodGroup,
                gender: u.gender,
                dob: u.dob,
                age: u.age,
                address: u.address,
                pincode: u.pincode,
                city: u.city,
                state: u.state,
                emergencyContactName: u.emergencyContactName,
                emergencyContactPhone: u.emergencyContactPhone,
                emergencyContactRelation: u.emergencyContactRelation,
                bpLevel: u.bpLevel,
                hasDiabetes: u.hasDiabetes,
                diabetesType: u.diabetesType,
                diabetesMedication: u.diabetesMedication,
                profileCompleted: u.profileCompleted,
              };
              localStorage.setItem('ekawach_patient_profile', JSON.stringify(patientProfileData));
              window.dispatchEvent(new CustomEvent('ekawach_patient_profile_updated', { detail: { source: 'AuthContext' } }));
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const signInWithGoogle = async (preferredRole = 'patient') => {
    try {
      localStorage.setItem('ekawach_selected_role', preferredRole);
      const gUser = await loginWithGoogle();
      if (!gUser) throw new Error('No user returned from Google sign-in');

      let role = preferredRole;
      if (!role) {
        if (gUser.email === 'namanjain82670@gmail.com') {
          role = 'hospital';
        } else if (gUser.email?.toLowerCase().includes('doctor') || gUser.displayName?.toLowerCase().includes('dr.')) {
          role = 'doctor';
        } else {
          role = 'patient';
        }
      }

      const normRole = role === 'admin' ? 'hospital' : role;
      const baseProfile = roleProfiles[normRole] || roleProfiles.patient;

      // Authenticate with local backend API
      try {
        const res = await fetch('/api/auth/google-local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: gUser.email,
            name: gUser.displayName,
            photoURL: gUser.photoURL,
            role: normRole,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const merged = {
              ...baseProfile,
              ...data.user,
              photoURL: gUser.photoURL,
              role: normRole,
              dashboardRoute: baseProfile.dashboardRoute,
            };
            setCurrentUser(merged);
            localStorage.setItem('ekawach_user', JSON.stringify(merged));
            if (data.accessToken) {
              localStorage.setItem('ekawach_token', data.accessToken);
            }
            return baseProfile.dashboardRoute;
          }
        }
      } catch (backendErr) {
        console.warn('Backend google-local sync notice:', backendErr);
      }

      const abhaId = normRole === 'patient' ? `ABHA-${gUser.uid.slice(0, 4).toUpperCase()}-${gUser.uid.slice(4, 8).toUpperCase()}-TN` : baseProfile.id;
      const regId = `REG-GGL-${gUser.uid.slice(0, 8).toUpperCase()}`;

      const merged = {
        ...baseProfile,
        name: gUser.displayName || baseProfile.name,
        email: gUser.email,
        uid: gUser.uid,
        id: abhaId,
        registration_id: regId,
        registrationId: regId,
        photoURL: gUser.photoURL,
        role: normRole,
        dashboardRoute: baseProfile.dashboardRoute,
        isLocalSystemDB: true,
      };

      setCurrentUser(merged);
      localStorage.setItem('ekawach_user', JSON.stringify(merged));
      return baseProfile.dashboardRoute;
    } catch (err) {
      console.error('Google Sign-In error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutFirebase();
      const token = localStorage.getItem('ekawach_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch (_e) {}
    localStorage.removeItem('ekawach_user');
    localStorage.removeItem('ekavach_user');
    localStorage.removeItem('ekawach_token');
    localStorage.removeItem('ekavach_token');
    localStorage.removeItem('ekawach_patient_profile');
    localStorage.removeItem('ekavach_patient_profile');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        setCurrentUser,
        firebaseUser,
        signInWithGoogle,
        login,
        register,
        updateProfile: updateProfileDetails,
        updateProfileDetails,
        createPassword,
        logout,
        roleProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

