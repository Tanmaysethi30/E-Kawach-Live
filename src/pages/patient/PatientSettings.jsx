import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { savePatientToRegistry, calculateAge } from '../../utils/emergencyRegistry';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman and Nicobar Islands'
];

const CITIES_BY_STATE = {
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Kanchipuram'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar', 'Solapur', 'Amravati', 'Kolhapur', 'Navi Mumbai'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Dwarka', 'Rohini'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Davangere', 'Ballari', 'Shivamogga', 'Tumakuru'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Noida', 'Ghaziabad', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol', 'Kharagpur', 'Bardhaman'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Kannur', 'Kottayam'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Sonipat'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Ratlam'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kakinada', 'Nellore', 'Kurnool', 'Rajahmundry'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Berhampur'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia'],
};

const DISTRICT_TO_CITY_MAP = {
  'gautam buddha nagar': 'Noida',
  'gautam budh nagar': 'Noida',
  'gurgaon': 'Gurugram',
  'bangalore': 'Bengaluru',
  'bangalore urban': 'Bengaluru',
  'bengaluru urban': 'Bengaluru',
  'bangalore rural': 'Bengaluru',
  'mumbai city': 'Mumbai',
  'mumbai suburban': 'Mumbai',
  'suburban mumbai': 'Mumbai',
  'central delhi': 'New Delhi',
  'south delhi': 'New Delhi',
  'north delhi': 'New Delhi',
  'east delhi': 'New Delhi',
  'west delhi': 'New Delhi',
  'new delhi': 'New Delhi',
  'khordha': 'Bhubaneswar',
  'khurda': 'Bhubaneswar',
  'kamrup metropolitan': 'Guwahati',
  'kamrup': 'Guwahati',
  'ernakulam': 'Kochi',
  'trivandrum': 'Thiruvananthapuram',
  'visakhapatnam district': 'Visakhapatnam',
  'rangareddy': 'Hyderabad',
  'ranga reddy': 'Hyderabad',
  'rupnagar': 'Mohali',
  'sas nagar': 'Mohali',
  'sahibzada ajit singh nagar': 'Mohali',
  'kancheepuram': 'Kanchipuram',
  'chengalpattu': 'Chennai',
  'tiruvallur': 'Chennai',
  'chhatrapati sambhajinagar': 'Chhatrapati Sambhajinagar',
  'aurangabad': 'Chhatrapati Sambhajinagar',
  'prayagraj': 'Prayagraj',
  'allahabad': 'Prayagraj',
};

const PINCODE_PREFIX_MAP = [
  // Delhi & NCR Granular Pincodes
  { prefix: '110040', state: 'Delhi', city: 'North Delhi', area: 'Narela (Near NIT Delhi)' },
  { prefix: '110036', state: 'Delhi', city: 'North Delhi', area: 'Alipur (GT Karnal Road)' },
  { prefix: '110082', state: 'Delhi', city: 'North Delhi', area: 'Khera Kalan' },
  { prefix: '110085', state: 'Delhi', city: 'North West Delhi', area: 'Rohini' },
  { prefix: '110034', state: 'Delhi', city: 'North West Delhi', area: 'Pitampura' },
  { prefix: '110033', state: 'Delhi', city: 'North Delhi', area: 'Adarsh Nagar / Model Town' },
  { prefix: '110009', state: 'Delhi', city: 'North Delhi', area: 'GTB Nagar / Kingsway Camp' },
  { prefix: '110007', state: 'Delhi', city: 'North Delhi', area: 'Delhi University / Roop Nagar' },
  { prefix: '110054', state: 'Delhi', city: 'North Delhi', area: 'Civil Lines' },
  { prefix: '110006', state: 'Delhi', city: 'Central Delhi', area: 'Chandni Chowk / Old Delhi' },
  { prefix: '110001', state: 'Delhi', city: 'New Delhi', area: 'Connaught Place' },
  { prefix: '110002', state: 'Delhi', city: 'Central Delhi', area: 'Daryaganj' },
  { prefix: '110003', state: 'Delhi', city: 'South Delhi', area: 'Lodhi Road' },
  { prefix: '110016', state: 'Delhi', city: 'South Delhi', area: 'Hauz Khas / AIIMS' },
  { prefix: '110029', state: 'Delhi', city: 'South Delhi', area: 'Safdarjung Enclave' },
  { prefix: '110075', state: 'Delhi', city: 'South West Delhi', area: 'Dwarka' },
  { prefix: '110078', state: 'Delhi', city: 'South West Delhi', area: 'Dwarka Sector 8' },
  { prefix: '110092', state: 'Delhi', city: 'East Delhi', area: 'Laxmi Nagar / Anand Vihar' },
  { prefix: '110091', state: 'Delhi', city: 'East Delhi', area: 'Mayur Vihar' },
  { prefix: '110025', state: 'Delhi', city: 'South East Delhi', area: 'Jamia Nagar / Okhla' },
  { prefix: '110019', state: 'Delhi', city: 'South East Delhi', area: 'Kalkaji / Nehru Place' },
  { prefix: '110020', state: 'Delhi', city: 'South East Delhi', area: 'Okhla Industrial Area' },
  { prefix: '110058', state: 'Delhi', city: 'West Delhi', area: 'Janakpuri' },
  { prefix: '110027', state: 'Delhi', city: 'West Delhi', area: 'Rajouri Garden' },
  { prefix: '110015', state: 'Delhi', city: 'West Delhi', area: 'Moti Nagar' },
  { prefix: '110', state: 'Delhi', city: 'New Delhi', area: 'Delhi National Capital Territory' },
  { prefix: '11', state: 'Delhi', city: 'New Delhi', area: 'Delhi Region' },
  { prefix: '201301', state: 'Uttar Pradesh', city: 'Noida', area: 'Sector 1-62' },
  { prefix: '201307', state: 'Uttar Pradesh', city: 'Noida', area: 'Greater Noida' },
  { prefix: '201', state: 'Uttar Pradesh', city: 'Noida', area: 'Gautam Buddha Nagar' },
  { prefix: '122001', state: 'Haryana', city: 'Gurugram', area: 'Old Gurgaon' },
  { prefix: '122002', state: 'Haryana', city: 'Gurugram', area: 'DLF Cyber City' },
  { prefix: '122', state: 'Haryana', city: 'Gurugram', area: 'Gurugram Region' },

  { prefix: '600', state: 'Tamil Nadu', city: 'Chennai' },
  { prefix: '601', state: 'Tamil Nadu', city: 'Kanchipuram' },
  { prefix: '602', state: 'Tamil Nadu', city: 'Kanchipuram' },
  { prefix: '603', state: 'Tamil Nadu', city: 'Chengalpattu' },
  { prefix: '605', state: 'Puducherry', city: 'Puducherry' },
  { prefix: '606', state: 'Tamil Nadu', city: 'Cuddalore' },
  { prefix: '607', state: 'Tamil Nadu', city: 'Cuddalore' },
  { prefix: '608', state: 'Tamil Nadu', city: 'Cuddalore' },
  { prefix: '610', state: 'Tamil Nadu', city: 'Thanjavur' },
  { prefix: '613', state: 'Tamil Nadu', city: 'Thanjavur' },
  { prefix: '620', state: 'Tamil Nadu', city: 'Tiruchirappalli' },
  { prefix: '625', state: 'Tamil Nadu', city: 'Madurai' },
  { prefix: '627', state: 'Tamil Nadu', city: 'Tirunelveli' },
  { prefix: '632', state: 'Tamil Nadu', city: 'Vellore' },
  { prefix: '636', state: 'Tamil Nadu', city: 'Salem' },
  { prefix: '638', state: 'Tamil Nadu', city: 'Erode' },
  { prefix: '641', state: 'Tamil Nadu', city: 'Coimbatore' },
  { prefix: '642', state: 'Tamil Nadu', city: 'Coimbatore' },
  { prefix: '60', state: 'Tamil Nadu', city: 'Chennai' },
  { prefix: '61', state: 'Tamil Nadu', city: 'Thanjavur' },
  { prefix: '62', state: 'Tamil Nadu', city: 'Madurai' },
  { prefix: '63', state: 'Tamil Nadu', city: 'Salem' },
  { prefix: '64', state: 'Tamil Nadu', city: 'Coimbatore' },

  { prefix: '400', state: 'Maharashtra', city: 'Mumbai' },
  { prefix: '401', state: 'Maharashtra', city: 'Thane' },
  { prefix: '410', state: 'Maharashtra', city: 'Navi Mumbai' },
  { prefix: '411', state: 'Maharashtra', city: 'Pune' },
  { prefix: '412', state: 'Maharashtra', city: 'Pune' },
  { prefix: '421', state: 'Maharashtra', city: 'Thane' },
  { prefix: '422', state: 'Maharashtra', city: 'Nashik' },
  { prefix: '431', state: 'Maharashtra', city: 'Chhatrapati Sambhajinagar' },
  { prefix: '440', state: 'Maharashtra', city: 'Nagpur' },
  { prefix: '416', state: 'Maharashtra', city: 'Kolhapur' },
  { prefix: '40', state: 'Maharashtra', city: 'Mumbai' },
  { prefix: '41', state: 'Maharashtra', city: 'Pune' },
  { prefix: '42', state: 'Maharashtra', city: 'Nashik' },
  { prefix: '43', state: 'Maharashtra', city: 'Chhatrapati Sambhajinagar' },
  { prefix: '44', state: 'Maharashtra', city: 'Nagpur' },

  { prefix: '560', state: 'Karnataka', city: 'Bengaluru' },
  { prefix: '561', state: 'Karnataka', city: 'Bengaluru' },
  { prefix: '562', state: 'Karnataka', city: 'Bengaluru' },
  { prefix: '570', state: 'Karnataka', city: 'Mysuru' },
  { prefix: '575', state: 'Karnataka', city: 'Mangaluru' },
  { prefix: '580', state: 'Karnataka', city: 'Hubballi-Dharwad' },
  { prefix: '590', state: 'Karnataka', city: 'Belagavi' },
  { prefix: '56', state: 'Karnataka', city: 'Bengaluru' },
  { prefix: '57', state: 'Karnataka', city: 'Mysuru' },
  { prefix: '58', state: 'Karnataka', city: 'Hubballi-Dharwad' },
  { prefix: '59', state: 'Karnataka', city: 'Belagavi' },

  { prefix: '500', state: 'Telangana', city: 'Hyderabad' },
  { prefix: '501', state: 'Telangana', city: 'Hyderabad' },
  { prefix: '502', state: 'Telangana', city: 'Hyderabad' },
  { prefix: '506', state: 'Telangana', city: 'Warangal' },
  { prefix: '505', state: 'Telangana', city: 'Karimnagar' },
  { prefix: '530', state: 'Andhra Pradesh', city: 'Visakhapatnam' },
  { prefix: '520', state: 'Andhra Pradesh', city: 'Vijayawada' },
  { prefix: '522', state: 'Andhra Pradesh', city: 'Guntur' },
  { prefix: '517', state: 'Andhra Pradesh', city: 'Tirupati' },
  { prefix: '50', state: 'Telangana', city: 'Hyderabad' },
  { prefix: '51', state: 'Andhra Pradesh', city: 'Tirupati' },
  { prefix: '52', state: 'Andhra Pradesh', city: 'Vijayawada' },
  { prefix: '53', state: 'Andhra Pradesh', city: 'Visakhapatnam' },

  { prefix: '380', state: 'Gujarat', city: 'Ahmedabad' },
  { prefix: '382', state: 'Gujarat', city: 'Gandhinagar' },
  { prefix: '390', state: 'Gujarat', city: 'Vadodara' },
  { prefix: '395', state: 'Gujarat', city: 'Surat' },
  { prefix: '360', state: 'Gujarat', city: 'Rajkot' },
  { prefix: '38', state: 'Gujarat', city: 'Ahmedabad' },
  { prefix: '39', state: 'Gujarat', city: 'Surat' },

  { prefix: '226', state: 'Uttar Pradesh', city: 'Lucknow' },
  { prefix: '208', state: 'Uttar Pradesh', city: 'Kanpur' },
  { prefix: '221', state: 'Uttar Pradesh', city: 'Varanasi' },
  { prefix: '282', state: 'Uttar Pradesh', city: 'Agra' },
  { prefix: '201', state: 'Uttar Pradesh', city: 'Noida' },
  { prefix: '202', state: 'Uttar Pradesh', city: 'Aligarh' },
  { prefix: '250', state: 'Uttar Pradesh', city: 'Meerut' },
  { prefix: '211', state: 'Uttar Pradesh', city: 'Prayagraj' },
  { prefix: '20', state: 'Uttar Pradesh', city: 'Noida' },
  { prefix: '21', state: 'Uttar Pradesh', city: 'Prayagraj' },
  { prefix: '22', state: 'Uttar Pradesh', city: 'Lucknow' },
  { prefix: '24', state: 'Uttar Pradesh', city: 'Bareilly' },
  { prefix: '25', state: 'Uttar Pradesh', city: 'Meerut' },
  { prefix: '28', state: 'Uttar Pradesh', city: 'Agra' },

  { prefix: '700', state: 'West Bengal', city: 'Kolkata' },
  { prefix: '711', state: 'West Bengal', city: 'Howrah' },
  { prefix: '713', state: 'West Bengal', city: 'Durgapur' },
  { prefix: '734', state: 'West Bengal', city: 'Siliguri' },
  { prefix: '70', state: 'West Bengal', city: 'Kolkata' },
  { prefix: '71', state: 'West Bengal', city: 'Howrah' },
  { prefix: '72', state: 'West Bengal', city: 'Kharagpur' },
  { prefix: '73', state: 'West Bengal', city: 'Siliguri' },

  { prefix: '302', state: 'Rajasthan', city: 'Jaipur' },
  { prefix: '342', state: 'Rajasthan', city: 'Jodhpur' },
  { prefix: '313', state: 'Rajasthan', city: 'Udaipur' },
  { prefix: '324', state: 'Rajasthan', city: 'Kota' },
  { prefix: '30', state: 'Rajasthan', city: 'Jaipur' },
  { prefix: '31', state: 'Rajasthan', city: 'Udaipur' },
  { prefix: '32', state: 'Rajasthan', city: 'Kota' },
  { prefix: '34', state: 'Rajasthan', city: 'Jodhpur' },

  { prefix: '695', state: 'Kerala', city: 'Thiruvananthapuram' },
  { prefix: '682', state: 'Kerala', city: 'Kochi' },
  { prefix: '673', state: 'Kerala', city: 'Kozhikode' },
  { prefix: '680', state: 'Kerala', city: 'Thrissur' },
  { prefix: '691', state: 'Kerala', city: 'Kollam' },
  { prefix: '68', state: 'Kerala', city: 'Kochi' },
  { prefix: '69', state: 'Kerala', city: 'Thiruvananthapuram' },
  { prefix: '67', state: 'Kerala', city: 'Kozhikode' },

  { prefix: '141', state: 'Punjab', city: 'Ludhiana' },
  { prefix: '143', state: 'Punjab', city: 'Amritsar' },
  { prefix: '144', state: 'Punjab', city: 'Jalandhar' },
  { prefix: '160', state: 'Chandigarh', city: 'Chandigarh' },
  { prefix: '121', state: 'Haryana', city: 'Faridabad' },
  { prefix: '132', state: 'Haryana', city: 'Karnal' },
  { prefix: '14', state: 'Punjab', city: 'Ludhiana' },
  { prefix: '12', state: 'Haryana', city: 'Gurugram' },
  { prefix: '13', state: 'Haryana', city: 'Panipat' },

  { prefix: '800', state: 'Bihar', city: 'Patna' },
  { prefix: '823', state: 'Bihar', city: 'Gaya' },
  { prefix: '834', state: 'Jharkhand', city: 'Ranchi' },
  { prefix: '831', state: 'Jharkhand', city: 'Jamshedpur' },
  { prefix: '80', state: 'Bihar', city: 'Patna' },
  { prefix: '81', state: 'Bihar', city: 'Bhagalpur' },
  { prefix: '82', state: 'Bihar', city: 'Gaya' },
  { prefix: '83', state: 'Jharkhand', city: 'Ranchi' },

  { prefix: '462', state: 'Madhya Pradesh', city: 'Bhopal' },
  { prefix: '452', state: 'Madhya Pradesh', city: 'Indore' },
  { prefix: '482', state: 'Madhya Pradesh', city: 'Jabalpur' },
  { prefix: '492', state: 'Chhattisgarh', city: 'Raipur' },
  { prefix: '45', state: 'Madhya Pradesh', city: 'Indore' },
  { prefix: '46', state: 'Madhya Pradesh', city: 'Bhopal' },
  { prefix: '49', state: 'Chhattisgarh', city: 'Raipur' },

  { prefix: '751', state: 'Odisha', city: 'Bhubaneswar' },
  { prefix: '753', state: 'Odisha', city: 'Rourkela' },
  { prefix: '75', state: 'Odisha', city: 'Bhubaneswar' },

  { prefix: '781', state: 'Assam', city: 'Guwahati' },
  { prefix: '78', state: 'Assam', city: 'Guwahati' },
  { prefix: '79', state: 'Meghalaya', city: 'Shillong' },
];

const normalizeState = (rawState) => {
  if (!rawState) return '';
  const clean = rawState.trim().toLowerCase().replace('&', 'and').replace(/\s+/g, ' ');
  const found = INDIAN_STATES.find((st) => {
    const stClean = st.toLowerCase().replace('&', 'and').replace(/\s+/g, ' ');
    return stClean === clean || clean.includes(stClean) || stClean.includes(clean);
  });
  if (found) return found;

  if (clean.includes('delhi')) return 'Delhi';
  if (clean.includes('kashmir') || clean.includes('jammu')) return 'Jammu and Kashmir';
  if (clean.includes('tamil')) return 'Tamil Nadu';
  if (clean.includes('maharashtra')) return 'Maharashtra';
  if (clean.includes('karnataka')) return 'Karnataka';
  if (clean.includes('telangana')) return 'Telangana';
  if (clean.includes('andhra')) return 'Andhra Pradesh';
  if (clean.includes('bengal') || clean.includes('kolkata')) return 'West Bengal';
  if (clean.includes('gujarat')) return 'Gujarat';
  if (clean.includes('uttar pradesh')) return 'Uttar Pradesh';
  if (clean.includes('uttarakhand')) return 'Uttarakhand';
  if (clean.includes('rajasthan')) return 'Rajasthan';
  if (clean.includes('kerala')) return 'Kerala';
  if (clean.includes('punjab')) return 'Punjab';
  if (clean.includes('haryana')) return 'Haryana';
  if (clean.includes('bihar')) return 'Bihar';
  if (clean.includes('madhya pradesh')) return 'Madhya Pradesh';
  if (clean.includes('odisha') || clean.includes('orissa')) return 'Odisha';
  if (clean.includes('assam')) return 'Assam';

  return rawState;
};

const normalizeCity = (rawDistrict, rawState) => {
  if (!rawDistrict) return '';
  const cleanDist = rawDistrict.trim().toLowerCase();

  if (DISTRICT_TO_CITY_MAP[cleanDist]) {
    return DISTRICT_TO_CITY_MAP[cleanDist];
  }

  const stateCities = CITIES_BY_STATE[rawState] || [];
  const matched = stateCities.find((c) => {
    const cClean = c.toLowerCase();
    return cClean === cleanDist || cleanDist.includes(cClean) || cClean.includes(cleanDist);
  });

  if (matched) return matched;

  return rawDistrict
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const getFallbackByPincode = (cleanPin) => {
  for (const entry of PINCODE_PREFIX_MAP) {
    if (cleanPin.startsWith(entry.prefix)) {
      return { state: entry.state, city: entry.city };
    }
  }
  return null;
};

export default function PatientSettings() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, updateProfileDetails, logout } = useAuth();
  const [signalStatus, setSignalStatus] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatusMsg, setPincodeStatusMsg] = useState('');

  // Active module state ('profile' | 'abha' | 'emergency' | 'notifications')
  const [activeModule, setActiveModule] = useState(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    return ['profile', 'abha', 'emergency', 'notifications'].includes(hash) ? hash : 'profile';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['profile', 'abha', 'emergency', 'notifications'].includes(hash)) {
        setActiveModule(hash);
      } else if (!hash) {
        setActiveModule('profile');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleModuleChange = (mod) => {
    setActiveModule(mod);
    window.location.hash = '#' + mod;
  };

  // Profile state
  const defaultProfile = {
    fullName: currentUser?.name || currentUser?.fullName || '',
    abhaId: currentUser?.abhaNumber || currentUser?.id || '',
    verificationStatus: 'ABDM Verified',
    phone: currentUser?.phone || '',
    aadhaarNumber: currentUser?.aadhaarNumber || currentUser?.aadhaar || '',
    email: currentUser?.email || '',
    dob: currentUser?.dob ? (currentUser.dob.includes('T') ? currentUser.dob.split('T')[0] : currentUser.dob) : '',
    gender: currentUser?.gender || '',
    bloodGroup: currentUser?.bloodGroup || '',
    address: currentUser?.address || '',
    pincode: currentUser?.pincode || '',
    city: currentUser?.city || '',
    state: currentUser?.state || 'Tamil Nadu',
    emergencyContactName: currentUser?.emergencyContactName || '',
    emergencyContactRelation: currentUser?.emergencyContactRelation || 'Parent',
    emergencyContactPhone: currentUser?.emergencyContactPhone || '',
    bpLevel: currentUser?.bpLevel || 'Normal (120/80 mmHg)',
    hasDiabetes: currentUser?.hasDiabetes || 'No',
    diabetesType: currentUser?.diabetesType || 'Type 2 Diabetes Mellitus',
    diabetesMedication: currentUser?.diabetesMedication || 'Oral Hypoglycemic Agents (Metformin)',
  };

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ekawach_patient_profile') || localStorage.getItem('ekavach_patient_profile');
      return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  // Keep profile and contacts in sync if currentUser changes or on mount
  useEffect(() => {
    if (currentUser) {
      setProfile((prev) => ({
        ...prev,
        fullName: currentUser.name || currentUser.fullName || prev.fullName,
        abhaId: currentUser.abhaNumber || currentUser.id || prev.abhaId,
        phone: currentUser.phone || prev.phone,
        aadhaarNumber: currentUser.aadhaarNumber || currentUser.aadhaar || prev.aadhaarNumber,
        email: currentUser.email || prev.email,
        dob: currentUser.dob || prev.dob,
        gender: currentUser.gender || prev.gender,
        bloodGroup: currentUser.bloodGroup || prev.bloodGroup,
        address: currentUser.address || prev.address,
        pincode: currentUser.pincode || prev.pincode,
        city: currentUser.city || prev.city,
        state: currentUser.state || prev.state,
        emergencyContactName: currentUser.emergencyContactName || prev.emergencyContactName,
        emergencyContactRelation: currentUser.emergencyContactRelation || prev.emergencyContactRelation,
        emergencyContactPhone: currentUser.emergencyContactPhone || prev.emergencyContactPhone,
        bpLevel: currentUser.bpLevel || prev.bpLevel,
        hasDiabetes: currentUser.hasDiabetes || prev.hasDiabetes,
        diabetesType: currentUser.diabetesType || prev.diabetesType,
        diabetesMedication: currentUser.diabetesMedication || prev.diabetesMedication,
      }));
    }
  }, [currentUser]);

  // Fetch verified profile from backend to ensure data persistence across page refreshes
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('ekawach_token') || localStorage.getItem('ekavach_token');
        if (!token) return;
        const res = await fetch('/api/patient/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            const p = data.profile;
            setProfile((prev) => ({
              ...prev,
              fullName: p.name || p.fullName || prev.fullName,
              abhaId: p.abhaNumber || prev.abhaId,
              phone: p.phone || prev.phone,
              aadhaarNumber: p.aadhaarNumber || prev.aadhaarNumber,
              email: p.email || prev.email,
              dob: p.dob ? (typeof p.dob === 'string' && p.dob.includes('T') ? p.dob.split('T')[0] : p.dob) : prev.dob,
              gender: p.gender || prev.gender,
              bloodGroup: p.bloodGroup || prev.bloodGroup,
              address: p.address || prev.address,
              pincode: p.pincode || prev.pincode,
              city: p.city || prev.city,
              state: p.state || prev.state,
              emergencyContactName: p.emergencyContactName || prev.emergencyContactName,
              emergencyContactRelation: p.emergencyContactRelation || prev.emergencyContactRelation,
              emergencyContactPhone: p.emergencyContactPhone || prev.emergencyContactPhone,
              bpLevel: p.bpLevel || prev.bpLevel,
              hasDiabetes: p.hasDiabetes || prev.hasDiabetes,
              diabetesType: p.diabetesType || prev.diabetesType,
              diabetesMedication: p.diabetesMedication || prev.diabetesMedication,
            }));

            if (p.emergencyContactName) {
              setContacts((prev) => {
                const saved = localStorage.getItem('ekawach_emergency_contacts') || localStorage.getItem('ekavach_emergency_contacts');
                let base = prev;
                if (saved) {
                  try { base = JSON.parse(saved); } catch (_e) {}
                }
                const p1Index = base.findIndex(c => c.priority === 'p1');
                const targetIdx = p1Index >= 0 ? p1Index : 0;
                const updated = [...base];
                updated[targetIdx] = {
                  ...updated[targetIdx],
                  name: p.emergencyContactName,
                  relation: p.emergencyContactRelation || updated[targetIdx]?.relation || 'Parent',
                  phone: p.emergencyContactPhone || updated[targetIdx]?.phone || '',
                  priority: 'p1',
                  priorityText: 'Primary Next-of-Kin (Priority 1)',
                  initials: (p.emergencyContactName || 'EM').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
                  verified: true,
                };
                localStorage.setItem('ekawach_emergency_contacts', JSON.stringify(updated));
                return updated;
              });
            }
          }
        }
      } catch (_e) {}
    };
    fetchPatientData();
  }, []);

  const handleProfileChange = (field, val) => {
    setProfile((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'state') {
        // Reset city if state changes and current city is not in new state
        const cities = CITIES_BY_STATE[val] || ['Other'];
        if (!cities.includes(prev.city)) {
          updated.city = cities[0] || '';
        }
      }
      return updated;
    });

    if (field === 'pincode' && val.replace(/\D/g, '').length === 6) {
      fetchPincodeDetails(val);
    }
  };

  // Auto-fetch location details based on Postal Pincode (Multi-source India Post API + Offline Prefix Engine)
  const fetchPincodeDetails = async (pinInput) => {
    const cleanPin = (pinInput || profile.pincode || '').replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setPincodeStatusMsg('Please enter a valid 6-digit Indian Pincode');
      return;
    }

    setPincodeLoading(true);
    setPincodeStatusMsg('Fetching verified location from India Post registry...');

    let fetchedState = '';
    let fetchedDistrict = '';
    let fetchedArea = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          fetchedState = normalizeState(po.State || po.Circle || '');
          fetchedDistrict = normalizeCity(po.District || po.Division || '', fetchedState);
          fetchedArea = po.Name || '';
        }
      }
    } catch (_err) {
      // Fallback seamlessly to offline prefix engine
    }

    // Local Offline Prefix Engine fallback
    const offlineMatch = getFallbackByPincode(cleanPin);

    const finalState = fetchedState || (offlineMatch ? offlineMatch.state : profile.state);
    const finalCity = fetchedDistrict || (offlineMatch ? offlineMatch.city : profile.city);
    const finalArea = fetchedArea || (offlineMatch ? offlineMatch.area : '');

    if (finalState && finalCity) {
      setProfile((prev) => {
        const currentAddr = prev.address || '';
        let updatedAddr = currentAddr;
        if (!currentAddr || currentAddr.includes('Greams Road') || currentAddr.includes('Connaught Place') || currentAddr.length < 5) {
          updatedAddr = `${finalArea ? finalArea + ', ' : ''}${finalCity}, ${finalState} - ${cleanPin}`;
        }
        return {
          ...prev,
          pincode: cleanPin,
          state: finalState,
          city: finalCity,
          address: updatedAddr,
        };
      });

      setPincodeStatusMsg(`✓ Auto-fetched: ${finalCity}, ${finalState}${finalArea ? ` (${finalArea})` : ''}`);
    } else {
      setPincodeStatusMsg('✓ Valid pincode format. Select State & City below.');
    }

    setPincodeLoading(false);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profile.pincode || !profile.address || !profile.bloodGroup) {
      alert('Please fill out all required demographic and clinical fields (Address, Pincode, Blood Group, BP, and Diabetic Status).');
      return;
    }

    try {
      localStorage.setItem('ekawach_patient_profile', JSON.stringify(profile));
      const updatedUserFields = {
        name: profile.fullName,
        fullName: profile.fullName,
        bloodGroup: profile.bloodGroup,
        gender: profile.gender,
        dob: profile.dob,
        age: calculateAge(profile.dob),
        phone: profile.phone,
        aadhaarNumber: profile.aadhaarNumber,
        aadhaar: profile.aadhaarNumber,
        email: profile.email,
        address: profile.address,
        pincode: profile.pincode,
        city: profile.city,
        state: profile.state,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactRelation: profile.emergencyContactRelation,
        emergencyContactPhone: profile.emergencyContactPhone,
        bpLevel: profile.bpLevel,
        hasDiabetes: profile.hasDiabetes,
        diabetesType: profile.hasDiabetes === 'Yes' ? profile.diabetesType : 'None',
        diabetesMedication: profile.hasDiabetes === 'Yes' ? profile.diabetesMedication : 'None',
        profileCompleted: true,
      };

      const mergedPatientData = {
        ...currentUser,
        ...profile,
        ...updatedUserFields,
      };

      // Automatically register/update patient emergency registry
      // Retains existing Patient Emergency ID and updates clinical triage payload
      savePatientToRegistry(mergedPatientData);

      if (updateProfileDetails) {
        updateProfileDetails(updatedUserFields);
      } else {
        const updatedUser = { ...currentUser, ...updatedUserFields, profileCompleted: true };
        if (setCurrentUser) setCurrentUser(updatedUser);
        localStorage.setItem('ekawach_user', JSON.stringify(updatedUser));
      }

      const token = localStorage.getItem('ekawach_token') || localStorage.getItem('ekavach_token');
      await fetch('/api/patient/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatedUserFields),
      }).catch(() => {});
    } catch (err) {
      console.warn('Profile sync fallback to local:', err);
    }
    triggerSignal('Patient profile & medical details successfully saved! Emergency QR automatically generated & synced.');
    setTimeout(() => {
      navigate('/patient/dashboard');
    }, 1200);
  };

  // Notification Preferences state
  const defaultPrefs = {
    appointmentReminders: true,
    approvalUpdates: true,
    refillAlerts: true,
    newRecordAdded: true,
    newDoctorMessages: true,
    videoReminders: true,
    schemeUpdates: true,
    platformAnnouncements: false,
    channelPush: true,
    channelSms: true,
    channelEmail: true,
  };

  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('ekawach_notification_prefs') || localStorage.getItem('ekavach_notification_prefs');
      return saved ? { ...defaultPrefs, ...JSON.parse(saved) } : defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  });

  const toggleNotificationPref = (key) => {
    const updated = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    setNotificationPrefs(updated);
    try {
      localStorage.setItem('ekawach_notification_prefs', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSaveNotificationPrefs = () => {
    try {
      localStorage.setItem('ekawach_notification_prefs', JSON.stringify(notificationPrefs));
    } catch (e) {}
    triggerSignal('Notification preferences updated. Synced to ABDM gateway node and encrypted dispatch relays.');
  };

  const handleRestoreNotificationDefaults = () => {
    setNotificationPrefs(defaultPrefs);
    try {
      localStorage.setItem('ekawach_notification_prefs', JSON.stringify(defaultPrefs));
    } catch (e) {}
    triggerSignal('Notification preferences restored to clinical defaults.');
  };

  // Emergency Contacts state
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('ekawach_emergency_contacts') || localStorage.getItem('ekavach_emergency_contacts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (currentUser?.emergencyContactName) {
          parsed[0] = {
            ...parsed[0],
            name: currentUser.emergencyContactName,
            relation: currentUser.emergencyContactRelation || parsed[0].relation || 'Parent',
            phone: currentUser.emergencyContactPhone || parsed[0].phone,
          };
        }
        return parsed;
      } catch (e) {}
    }
    const registeredName = currentUser?.emergencyContactName || 'Ananya S. Sharma';
    const registeredRel = currentUser?.emergencyContactRelation || 'Spouse';
    const registeredPhone = currentUser?.emergencyContactPhone || '+91 98401 22819';
    const initials = registeredName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'EM';

    return [
      {
        id: '1',
        initials: initials,
        name: registeredName,
        relation: registeredRel,
        priority: 'p1',
        priorityText: 'Primary Next-of-Kin (Priority 1)',
        phone: registeredPhone,
        workPhone: '',
        email: 'emergency.kin@ekawach.gov.in',
        timing: 'Instant (0s delay)',
        verified: true,
        permissions: [
          'Full Medical Decision Power (DPOA)',
          'Real-time ER Admittance SMS',
          'ICU Consent Tele-Authorization',
        ],
      },
      {
        id: '2',
        initials: 'VS',
        name: 'Dr. Vijay Sharma',
        relation: 'Brother (MD, Interventional Cardiology, Apollo)',
        priority: 'p2',
        priorityText: 'Secondary Medical Proxy (Priority 2)',
        phone: '+91 94440 18234',
        workPhone: '',
        email: 'dr.vijay@apollohealth.org',
        timing: 'Escalation (+2 mins delay)',
        verified: true,
        permissions: [
          'Clinical Consultation Proxy',
          'Prescription & Allergy Notification',
          'Secondary Trauma Escalation (if Primary unreachable after 2 mins)',
        ],
      },
    ];
  });

  const [permissions, setPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem('ekawach_patient_permissions') || localStorage.getItem('ekavach_patient_permissions');
      return saved ? JSON.parse(saved) : { allowMedicalHistory: true, receiveGps: true };
    } catch (e) {
      return { allowMedicalHistory: true, receiveGps: true };
    }
  });

  const [editingContactId, setEditingContactId] = useState(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');

  const [newContact, setNewContact] = useState({
    name: '',
    relation: 'Spouse',
    phone: '',
    email: '',
    priority: 'p2',
    allowMedicalHistory: permissions.allowMedicalHistory,
    receiveGps: permissions.receiveGps,
  });

  const triggerSignal = (target) => {
    setSignalStatus(
      target.startsWith('Encrypted') ||
        target.startsWith('Diagnostic') ||
        target.startsWith('Mobile') ||
        target.startsWith('Contact') ||
        target.startsWith('Emergency') ||
        target.startsWith('Dispatch') ||
        target.startsWith('Please') ||
        target.startsWith('Aadhaar') ||
        target.startsWith('Ingress') ||
        target.startsWith('Patient') ||
        target.startsWith('Notification') ||
        target.startsWith('Profile')
        ? target
        : `Encrypted test ingress packet routed to ${target || 'All Authorized Next-of-Kin'} via ABDM Gateway.`
    );
    setTimeout(() => setSignalStatus(null), 4500);
  };

  const handlePhoneChange = (val) => {
    setNewContact({ ...newContact, phone: val });
    setIsPhoneVerified(false);
    setOtpSent(false);
  };

  const triggerOtpPrompt = () => {
    const raw = newContact.phone.replace(/\D/g, '');
    if (!raw || raw.length < 10) {
      triggerSignal('Please enter a valid 10-digit mobile number first.');
      return;
    }
    setOtpSent(true);
    setEnteredOtp('');
    triggerSignal(`Aadhaar Registry (+91 ${newContact.phone}) — Mock OTP: 482910 dispatched.`);
  };

  const verifyOtp = () => {
    if (enteredOtp.trim() === '482910' || enteredOtp.trim().length === 6) {
      setIsPhoneVerified(true);
      setOtpSent(false);
      triggerSignal(`Mobile number +91 ${newContact.phone} verified via Aadhaar OTP.`);
    } else {
      triggerSignal('Invalid OTP code. Please enter 482910 or a valid 6-digit code.');
    }
  };

  const handleToggleTiming = (id) => {
    const updated = contacts.map((c) => {
      if (c.id === id) {
        const nextTiming = c.timing?.includes('Instant') ? 'Escalation (+2 mins delay)' : 'Instant (0s delay)';
        return { ...c, timing: nextTiming };
      }
      return c;
    });
    setContacts(updated);
    localStorage.setItem('ekawach_emergency_contacts', JSON.stringify(updated));
    const target = contacts.find((x) => x.id === id);
    triggerSignal(`Dispatch timing for ${target?.name || 'Contact'} updated to ${target?.timing || 'updated'}.`);
  };

  const handleEditContact = (contact) => {
    setEditingContactId(contact.id);
    const rel = contact.relation.split(' ')[0] || 'Spouse';
    setNewContact({
      name: contact.name,
      relation: ['Spouse', 'Parent', 'Child', 'Sibling', 'Trusted Physician', 'Legal Guardian'].includes(rel) ? rel : 'Spouse',
      phone: contact.phone.replace('+91', '').trim(),
      email: contact.email || '',
      priority: contact.priority || (contact.priorityText?.includes('Priority 1') ? 'p1' : contact.priorityText?.includes('Priority 2') ? 'p2' : 'p3'),
      allowMedicalHistory: contact.permissions?.some((p) => p.includes('History Access')) ?? true,
      receiveGps: contact.permissions?.some((p) => p.includes('GPS')) ?? true,
    });
    setIsPhoneVerified(true);
    setOtpSent(false);
    const formEl = document.getElementById('quick-add-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => document.getElementById('contact-name')?.focus(), 300);
    }
  };

  const handleRemoveContact = (id, name) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    localStorage.setItem('ekawach_emergency_contacts', JSON.stringify(updated));
    triggerSignal(`Contact "${name}" removed from active dispatch list.`);
    if (editingContactId === id) {
      handleResetForm();
    }
  };

  const handleResetForm = () => {
    setEditingContactId(null);
    setIsPhoneVerified(false);
    setOtpSent(false);
    setEnteredOtp('');
    setNewContact({
      name: '',
      relation: 'Spouse',
      phone: '',
      email: '',
      priority: 'p2',
      allowMedicalHistory: permissions.allowMedicalHistory,
      receiveGps: permissions.receiveGps,
    });
  };

  const handlePermissionChange = (key, val) => {
    const next = { ...permissions, [key]: val };
    setPermissions(next);
    localStorage.setItem('ekawach_patient_permissions', JSON.stringify(next));
    setNewContact((prev) => ({ ...prev, [key]: val }));
    triggerSignal('Ingress authorization and ambulatory GPS preferences saved.');
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      triggerSignal('Please provide Full Legal Name and Primary Mobile Number.');
      return;
    }
    const rawDigits = newContact.phone.replace(/\D/g, '').replace(/^91/, '');
    if (rawDigits.length !== 10) {
      triggerSignal('Please provide a valid 10-digit mobile number.');
      return;
    }
    const cleanPhone = `+91 ${rawDigits}`;
    const priorityText =
      newContact.priority === 'p1'
        ? 'Primary Next-of-Kin (Priority 1)'
        : newContact.priority === 'p2'
        ? 'Secondary Medical Proxy (Priority 2)'
        : 'Emergency Informational Proxy (Priority 3)';
    const timing =
      newContact.priority === 'p1'
        ? 'Instant (0s delay)'
        : newContact.priority === 'p2'
        ? 'Escalation (+2 mins delay)'
        : 'Informational (+5 mins delay)';
    const perms = [
      newContact.allowMedicalHistory ? 'Medical History Access Granted' : 'Restricted History Access',
      newContact.receiveGps ? 'Real-time ER Admittance GPS Tracking' : 'Standard SMS Telemetry',
    ];
    const initials =
      newContact.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'EC';

    let updated;
    if (editingContactId) {
      updated = contacts.map((c) =>
        c.id === editingContactId
          ? {
              ...c,
              name: newContact.name,
              relation: newContact.relation,
              priority: newContact.priority,
              priorityText,
              phone: cleanPhone,
              email: newContact.email || c.email,
              timing,
              permissions: perms,
              initials,
              verified: true,
            }
          : c
      );
      triggerSignal(`Emergency Contact "${newContact.name}" updated in ABHA Registry.`);
    } else {
      const created = {
        id: Date.now().toString(),
        initials,
        name: newContact.name,
        relation: newContact.relation,
        priority: newContact.priority,
        priorityText,
        phone: cleanPhone,
        workPhone: '',
        email: newContact.email || `${newContact.name.toLowerCase().replace(/\s+/g, '.')}@contact.in`,
        timing,
        permissions: perms,
        verified: true,
      };
      updated = [...contacts, created];
      triggerSignal(`Emergency Contact "${created.name}" successfully linked to ABHA Trauma Health Record.`);
    }

    const priorityWeight = { p1: 1, p2: 2, p3: 3 };
    updated.sort((a, b) => (priorityWeight[a.priority] || 2) - (priorityWeight[b.priority] || 2));

    setContacts(updated);
    localStorage.setItem('ekawach_emergency_contacts', JSON.stringify(updated));

    const p1 = updated.find((c) => c.priority === 'p1') || updated[0];
    if (p1) {
      const emergencyPayload = {
        emergencyContactName: p1.name,
        emergencyContactRelation: p1.relation,
        emergencyContactPhone: p1.phone,
      };
      if (updateProfileDetails) {
        updateProfileDetails(emergencyPayload);
      }
      try {
        const token = localStorage.getItem('ekawach_token') || localStorage.getItem('ekavach_token');
        if (token) {
          fetch('/api/patient/me', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(emergencyPayload),
          }).catch(() => {});
        }
      } catch (_e) {}
    }

    handleResetForm();
  };

  const openAddContact = (e) => {
    if (e) e.preventDefault();
    handleResetForm();
    const el = document.getElementById('quick-add-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => document.getElementById('contact-name')?.focus(), 300);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        {/* Dynamic Notification / Simulation Toast */}
        {signalStatus && (
          <div
            className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm px-space-md py-space-sm bg-primary text-on-primary rounded-xl shadow-xl transition-all"
            id="simulation-toast"
          >
            <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">satellite_alt</span>
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg font-semibold">Diagnostic Test Signal Dispatched</span>
              <span className="font-body-sm text-body-sm text-surface-variant">{signalStatus}</span>
            </div>
            <button
              onClick={() => setSignalStatus(null)}
              className="ml-space-md text-surface-variant hover:text-on-primary transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Settings Meta Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-space-sm">
          <div className="flex items-center gap-space-xs text-on-surface-variant flex-wrap">
            <span className="font-label-md text-label-md">Patient Portal</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-label-md text-label-md">System Preferences</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-label-md text-label-md text-primary font-semibold">
              {activeModule === 'profile' && 'Patient Profile & Demographic Record'}
              {activeModule === 'abha' && 'Health ID & ABHA Credentials'}
              {activeModule === 'emergency' && 'Emergency Contacts & SOS Dispatch'}
              {activeModule === 'notifications' && 'Notification Settings'}
            </span>
          </div>
          <div className="flex items-center gap-space-xs self-start sm:self-auto">
            <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded-full">
              <span className="inline-block w-2 h-2 rounded-full bg-tertiary"></span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">ABDM National Emergency Ingress: Operational</span>
            </div>
            <button
              onClick={handleSignOut}
              className="px-space-sm py-1 rounded-lg text-error hover:bg-error-container/20 font-label-md text-label-md transition-colors flex items-center gap-1 cursor-pointer ml-1"
              title="Sign Out of Session"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Two-Column Master Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-grid-gutter items-start">
          {/* LEFT COLUMN: Settings Mini-Navigation & Trust Anchor */}
          <aside className="lg:col-span-3 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col gap-1">
              <div className="px-space-sm py-space-xs mb-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Configuration Suites</span>
              </div>

              {/* Profile Module */}
              <button
                type="button"
                onClick={() => handleModuleChange('profile')}
                className={`flex items-center justify-between px-space-sm py-space-xs rounded-lg transition-colors text-left cursor-pointer w-full ${
                  activeModule === 'profile'
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <span className={`material-symbols-outlined text-[18px] ${activeModule === 'profile' ? 'text-tertiary-fixed' : ''}`}>account_circle</span>
                  <span className="font-label-lg text-label-lg">Profile</span>
                </div>
                {activeModule === 'profile' ? (
                  <span className="bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                ) : null}
              </button>

              {/* Health ID & ABHA Module */}
              <button
                type="button"
                onClick={() => handleModuleChange('abha')}
                className={`flex items-center justify-between px-space-sm py-space-xs rounded-lg transition-colors text-left cursor-pointer w-full ${
                  activeModule === 'abha'
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <span className={`material-symbols-outlined text-[18px] ${activeModule === 'abha' ? 'text-tertiary-fixed' : ''}`}>fingerprint</span>
                  <span className="font-label-lg text-label-lg">Health ID &amp; ABHA</span>
                </div>
                {activeModule === 'abha' ? (
                  <span className="bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                ) : null}
              </button>

              {/* Emergency Contacts Module */}
              <button
                type="button"
                onClick={() => handleModuleChange('emergency')}
                className={`flex items-center justify-between px-space-sm py-space-xs rounded-lg transition-colors text-left cursor-pointer w-full ${
                  activeModule === 'emergency'
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <span className={`material-symbols-outlined text-[18px] ${activeModule === 'emergency' ? 'text-tertiary-fixed' : ''}`}>emergency_share</span>
                  <span className="font-label-lg text-label-lg">Emergency Contacts</span>
                </div>
                <span
                  className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium ${
                    activeModule === 'emergency'
                      ? 'bg-tertiary-container text-tertiary-fixed'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                  id="active-contacts-count"
                >
                  {contacts.length} Active
                </span>
              </button>

              {/* Notifications Module */}
              <button
                type="button"
                onClick={() => handleModuleChange('notifications')}
                className={`flex items-center justify-between px-space-sm py-space-xs rounded-lg transition-colors text-left cursor-pointer w-full ${
                  activeModule === 'notifications'
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <span className={`material-symbols-outlined text-[18px] ${activeModule === 'notifications' ? 'text-tertiary-fixed' : ''}`}>notifications_active</span>
                  <span className="font-label-lg text-label-lg">Notifications</span>
                </div>
                <span
                  className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${
                    activeModule === 'notifications'
                      ? 'bg-tertiary-container text-tertiary-fixed font-medium'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  Automated
                </span>
              </button>
            </div>

            {/* Secure Keystore Architecture Card -> Clickable to Privacy & Security */}
            <Link
              to="/patient/privacy"
              className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-xs shadow-sm hover:bg-surface-container transition-colors no-underline block cursor-pointer group"
            >
              <div className="flex items-center gap-space-xs text-primary">
                <span className="material-symbols-outlined text-[20px] text-secondary group-hover:scale-105 transition-transform">encrypted</span>
                <span className="font-headline-sm text-headline-sm tracking-tight text-primary">Data Fortress</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Instant SOS Ingress broadcast encrypted under ABDM &amp; NDHM Section 29 emergency dispatch protocol. All dispatch tokens stored in patient FIPS 140-2 Level 3 hardware keystore.
              </p>
              <div className="pt-space-xs flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm uppercase font-semibold text-secondary">Break-Glass Clearance</span>
                <span className="font-label-sm text-label-sm font-semibold">Tier-1 Trauma</span>
              </div>
            </Link>

            {/* Quick Fast-Pass Status Card */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Pre-Linked Gateway</span>
                <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-primary">NHM 108 • Greams Trauma</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Apollo Greams Trauma Emergency Bay syncs triage protocol upon ingress flag.
              </p>
            </div>
          </aside>

          {/* RIGHT COLUMN: Active Content Panel */}
          <div className="lg:col-span-9 flex flex-col gap-space-md">

            {/* MODULE 1: PROFILE VIEW */}
            {activeModule === 'profile' && (
              <div className="flex flex-col gap-space-md">
                {/* Mandatory Completion Banner if profile is incomplete */}
                {(!currentUser?.profileCompleted || !profile.pincode || !profile.address) && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-space-md rounded-xl flex items-start gap-3 text-amber-950 dark:text-amber-100">
                    <span className="material-symbols-outlined text-amber-600 text-[24px] shrink-0 mt-0.5">priority_high</span>
                    <div className="flex flex-col gap-1">
                      <span className="font-headline-sm text-sm font-bold">Mandatory Demographic &amp; Health Details Required</span>
                      <p className="font-body-sm text-xs opacity-90 leading-relaxed">
                        To unlock full portal navigation, emergency responder sync, and prescription features, please complete your demographic and vital health details below (including Blood Pressure baseline and Diabetes status) and click <strong>Save Profile Changes</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Header & Action Row */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex flex-col gap-space-2xs max-w-2xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[24px] text-primary">account_circle</span>
                      <h1 className="font-headline-md text-headline-md text-primary">Patient Profile &amp; Demographics</h1>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Official legal identity and demographic records synchronized across Ayushman Bharat Digital Mission (ABDM) national health registers.
                    </p>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>ABDM Verified</span>
                    </div>
                  </div>
                </div>

                {/* Identity Summary Card */}
                <div className="bg-surface-container-low p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-14 h-14 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold shadow-sm flex-shrink-0">
                      {profile.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'RS'}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{profile.fullName}</span>
                        <span className="bg-tertiary text-on-tertiary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">verified</span> {profile.verificationStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-space-md mt-1 text-on-surface-variant flex-wrap">
                        <div className="flex items-center gap-space-2xs font-mono text-body-sm">
                          <span className="material-symbols-outlined text-[16px] text-secondary">fingerprint</span>
                          <span>ABHA: {profile.abhaId}</span>
                        </div>
                        {profile.phone && (
                          <div className="flex items-center gap-space-2xs font-mono text-body-sm">
                            <span className="material-symbols-outlined text-[16px] text-secondary">call</span>
                            <span>Phone: {profile.phone}</span>
                          </div>
                        )}
                        {profile.aadhaarNumber && (
                          <div className="flex items-center gap-space-2xs font-mono text-body-sm">
                            <span className="material-symbols-outlined text-[16px] text-secondary">badge</span>
                            <span>Aadhaar: {profile.aadhaarNumber}</span>
                          </div>
                        )}
                        {profile.bloodGroup && profile.bloodGroup.trim() !== '' && (
                          <div className="flex items-center gap-space-2xs text-body-sm">
                            <span className="material-symbols-outlined text-[16px] text-secondary">bloodtype</span>
                            <span className="font-semibold text-error">Blood Group: {profile.bloodGroup}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editable Profile Form */}
                <form onSubmit={handleSaveProfile} className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">badge</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm text-primary">Demographic Information</h2>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                      NDHM Standard Entity
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {/* Full Legal Name (Locked from Registration) */}
                    <div className="flex flex-col gap-space-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Full Legal Name</label>
                        <span className="font-label-sm text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">lock</span> ABDM Locked
                        </span>
                      </div>
                      <input
                        type="text"
                        value={profile.fullName}
                        readOnly
                        className="w-full px-space-md py-space-xs bg-surface-container-low text-on-surface-variant rounded-lg font-body-md text-body-md cursor-not-allowed shadow-inner"
                      />
                    </div>

                    {/* ABHA ID (Read-only / Locked) */}
                    <div className="flex flex-col gap-space-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface-variant font-semibold">ABHA ID (National Health ID)</label>
                        <span className="font-label-sm text-[11px] text-secondary font-semibold">Verified &amp; Locked</span>
                      </div>
                      <div className="flex gap-space-xs">
                        <input
                          type="text"
                          value={profile.abhaId}
                          readOnly
                          className="flex-1 px-space-md py-space-xs bg-surface-container-low text-on-surface-variant rounded-lg font-body-md text-body-md font-mono cursor-not-allowed shadow-inner"
                        />
                        <span className="px-space-sm py-space-xs bg-secondary-container text-on-secondary-container rounded-lg font-label-md text-label-md flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-[14px]">lock</span> Linked
                        </span>
                      </div>
                    </div>

                    {/* Primary Mobile Number (Locked from Registration) */}
                    <div className="flex flex-col gap-space-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Primary Mobile Number</label>
                        <span className="font-label-sm text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">lock</span> Registered Lock
                        </span>
                      </div>
                      <input
                        type="tel"
                        value={profile.phone}
                        readOnly
                        className="w-full px-space-md py-space-xs bg-surface-container-low text-on-surface-variant rounded-lg font-body-md text-body-md font-mono cursor-not-allowed shadow-inner"
                      />
                    </div>

                    {/* Aadhaar Card Number (Locked from Registration) */}
                    <div className="flex flex-col gap-space-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Aadhaar Card Number</label>
                        <span className="font-label-sm text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">verified</span> UIDAI Locked
                        </span>
                      </div>
                      <input
                        type="text"
                        value={profile.aadhaarNumber}
                        readOnly
                        className="w-full px-space-md py-space-xs bg-surface-container-low text-on-surface-variant rounded-lg font-body-md text-body-md cursor-not-allowed shadow-inner font-mono"
                      />
                    </div>

                    {/* Date of Birth & Live Age */}
                    <div className="flex flex-col gap-space-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Date of Birth</label>
                        {profile.dob && (
                          <span className="font-label-sm text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">cake</span> Age: {calculateAge(profile.dob)}
                          </span>
                        )}
                      </div>
                      <input
                        type="date"
                        value={profile.dob}
                        onChange={(e) => handleProfileChange('dob', e.target.value)}
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        required
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Gender</label>
                      <div className="relative">
                        <select
                          value={profile.gender}
                          onChange={(e) => handleProfileChange('gender', e.target.value)}
                          className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
                        >
                          <option value="">Select Gender...</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-Binary">Non-Binary</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>

                    {/* Blood Group */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Blood Group</label>
                      <div className="relative">
                        <select
                          value={profile.bloodGroup}
                          onChange={(e) => handleProfileChange('bloodGroup', e.target.value)}
                          className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none font-semibold text-error"
                        >
                          <option value="">Select Blood Group...</option>
                          <option value="A+ (Rh Pos)">A+ (Rh Pos)</option>
                          <option value="A- (Rh Neg)">A- (Rh Neg)</option>
                          <option value="B+ (Rh Pos)">B+ (Rh Pos)</option>
                          <option value="B- (Rh Neg)">B- (Rh Neg)</option>
                          <option value="O+ (Rh Pos)">O+ (Rh Pos)</option>
                          <option value="O- (Rh Neg)">O- (Rh Neg)</option>
                          <option value="AB+ (Rh Pos)">AB+ (Rh Pos)</option>
                          <option value="AB- (Rh Neg)">AB- (Rh Neg)</option>
                          <option value="Bombay Blood Group (hh)">Bombay Blood Group (hh)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>

                    {/* Postal Pincode with Auto-Fetch */}
                    <div className="flex flex-col gap-space-2xs md:col-span-1">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Postal Pincode</label>
                        {pincodeLoading && (
                          <span className="font-label-sm text-xs text-primary font-medium animate-pulse flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] animate-spin">sync</span> Auto-Fetching...
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={profile.pincode}
                        onChange={(e) => handleProfileChange('pincode', e.target.value)}
                        required
                        placeholder="e.g. 600006"
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-mono"
                      />
                      {pincodeStatusMsg && (
                        <span className={`font-label-sm text-[11px] ${pincodeStatusMsg.startsWith('✓') ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-amber-700 dark:text-amber-400'}`}>
                          {pincodeStatusMsg}
                        </span>
                      )}
                    </div>

                    {/* State Pop-up Dropdown */}
                    <div className="flex flex-col gap-space-2xs md:col-span-1">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">State / Union Territory</label>
                      <div className="relative">
                        <select
                          value={profile.state}
                          onChange={(e) => handleProfileChange('state', e.target.value)}
                          required
                          className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>

                    {/* City Pop-up Dropdown */}
                    <div className="flex flex-col gap-space-2xs md:col-span-1">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">City / District</label>
                      <div className="relative">
                        <select
                          value={profile.city}
                          onChange={(e) => handleProfileChange('city', e.target.value)}
                          required
                          className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
                        >
                          {(CITIES_BY_STATE[profile.state] || ['Main City', 'Other District']).map((ct) => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                          {!CITIES_BY_STATE[profile.state]?.includes(profile.city) && profile.city && (
                            <option value={profile.city}>{profile.city} (Fetched)</option>
                          )}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>

                    {/* Residential Address */}
                    <div className="md:col-span-3 flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Residential Address (House / Street / Landmark)</label>
                      <textarea
                        rows={2}
                        value={profile.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        required
                        placeholder="House / Flat No., Street, Area, Landmark"
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-none"
                      />
                    </div>

                    {/* Primary Emergency Contact (SOS Kin) */}
                    <div className="md:col-span-3 p-4 rounded-xl bg-error-container/15 border border-error-container/40 flex flex-col gap-3 mt-1">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md font-bold text-error flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[20px]">contact_emergency</span>
                          Primary Emergency SOS Contact Details
                        </span>
                        <span className="font-label-sm text-[11px] text-error font-semibold bg-error/10 px-2 py-0.5 rounded-full">
                          Trauma &amp; Triage Required
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                        <div className="flex flex-col gap-space-2xs">
                          <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Contact Person Name</label>
                          <input
                            type="text"
                            value={profile.emergencyContactName}
                            onChange={(e) => handleProfileChange('emergencyContactName', e.target.value)}
                            placeholder="e.g. Ramesh Kumar / Ananya Sharma"
                            className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-error shadow-sm"
                          />
                        </div>

                        <div className="flex flex-col gap-space-2xs">
                          <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Relationship</label>
                          <div className="relative">
                            <select
                              value={profile.emergencyContactRelation}
                              onChange={(e) => handleProfileChange('emergencyContactRelation', e.target.value)}
                              className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-error shadow-sm appearance-none"
                            >
                              <option value="Parent">Parent</option>
                              <option value="Spouse">Spouse</option>
                              <option value="Sibling">Sibling</option>
                              <option value="Child">Child</option>
                              <option value="Guardian">Guardian</option>
                              <option value="Friend">Friend</option>
                              <option value="Relative">Relative</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-space-2xs">
                          <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Emergency Phone Number</label>
                          <input
                            type="tel"
                            value={profile.emergencyContactPhone}
                            onChange={(e) => handleProfileChange('emergencyContactPhone', e.target.value)}
                            placeholder="+91 98401 22819"
                            className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-error shadow-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CLINICAL VITAL HISTORY SECTION (BP & Diabetes) */}
                  <div className="pt-space-md border-t border-surface-container-high mt-space-sm flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">monitor_heart</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm text-primary">Baseline Health &amp; Vitals Profile</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      {/* Blood Pressure Level */}
                      <div className="flex flex-col gap-space-2xs">
                        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary text-[18px]">favorite</span>
                          Blood Pressure Status (BP)
                        </label>
                        <div className="relative">
                          <select
                            value={profile.bpLevel}
                            onChange={(e) => handleProfileChange('bpLevel', e.target.value)}
                            className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
                          >
                            <option value="Normal (120/80 mmHg)">Normal (Systolic &lt; 120 / Diastolic &lt; 80 mmHg)</option>
                            <option value="Elevated / Pre-Hypertension (120-129/<80 mmHg)">Elevated / Pre-Hypertension (120-129 / &lt;80 mmHg)</option>
                            <option value="High Blood Pressure Stage 1 (130-139/80-89 mmHg)">High Blood Pressure Stage 1 (130-139 / 80-89 mmHg)</option>
                            <option value="High Blood Pressure Stage 2 (140+/90+ mmHg)">High Blood Pressure Stage 2 (140+ / 90+ mmHg)</option>
                            <option value="Low Blood Pressure / Hypotension (<90/<60 mmHg)">Low Blood Pressure / Hypotension (&lt;90 / &lt;60 mmHg)</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                        </div>
                      </div>

                      {/* Diabetes Status Toggle */}
                      <div className="flex flex-col gap-space-2xs">
                        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary text-[18px]">bloodpressure</span>
                          Diabetic / Blood Sugar History
                        </label>
                        <div className="flex items-center gap-4 mt-1">
                          <label className="flex items-center gap-2 cursor-pointer font-label-lg text-sm text-on-surface">
                            <input
                              type="radio"
                              name="hasDiabetes"
                              value="No"
                              checked={profile.hasDiabetes === 'No'}
                              onChange={(e) => handleProfileChange('hasDiabetes', e.target.value)}
                              className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            No (Non-Diabetic)
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-label-lg text-sm text-on-surface font-semibold text-amber-700 dark:text-amber-400">
                            <input
                              type="radio"
                              name="hasDiabetes"
                              value="Yes"
                              checked={profile.hasDiabetes === 'Yes'}
                              onChange={(e) => handleProfileChange('hasDiabetes', e.target.value)}
                              className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            Yes (Diabetic)
                          </label>
                        </div>
                      </div>

                      {/* Conditional Diabetes Detailed Fields */}
                      {profile.hasDiabetes === 'Yes' && (
                        <>
                          <div className="flex flex-col gap-space-2xs">
                            <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Diabetes Type</label>
                            <div className="relative">
                              <select
                                value={profile.diabetesType}
                                onChange={(e) => handleProfileChange('diabetesType', e.target.value)}
                                className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
                              >
                                <option value="Type 1 Diabetes Mellitus">Type 1 Diabetes Mellitus (Insulin Dependent)</option>
                                <option value="Type 2 Diabetes Mellitus">Type 2 Diabetes Mellitus</option>
                                <option value="Gestational Diabetes">Gestational Diabetes</option>
                                <option value="Pre-Diabetic / Borderline">Pre-Diabetic / Impaired Glucose Tolerance</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-space-2xs">
                            <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Current Medication / Therapy</label>
                            <div className="relative">
                              <select
                                value={profile.diabetesMedication}
                                onChange={(e) => handleProfileChange('diabetesMedication', e.target.value)}
                                className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
                              >
                                <option value="Oral Hypoglycemic Agents (Metformin)">Oral Medication (e.g. Metformin, Gliptins)</option>
                                <option value="Insulin Injections (Daily)">Daily Insulin Injections</option>
                                <option value="Combined Oral + Insulin Therapy">Combined (Oral Meds + Insulin)</option>
                                <option value="Dietary &amp; Lifestyle Management">Dietary &amp; Exercise Control</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-space-sm border-t border-surface-container-high mt-space-xs gap-space-sm">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Edits persist locally and synchronize across ABDM-connected trauma nodes.
                    </span>
                    <button
                      type="submit"
                      className="px-space-xl py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* MODULE 2: HEALTH ID & ABHA VIEW */}
            {activeModule === 'abha' && (
              <div className="flex flex-col gap-space-md">
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex flex-col gap-space-2xs max-w-2xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[24px] text-primary">fingerprint</span>
                      <h1 className="font-headline-md text-headline-md text-primary">Health ID &amp; ABHA Credentials</h1>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Your Ayushman Bharat Health Account (ABHA) is your unique 14-digit identifier for digital health records under the Ayushman Bharat Digital Mission (ABDM).
                    </p>
                  </div>
                  <Link
                    to="/patient/abha"
                    className="px-space-md py-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg rounded-lg transition-colors flex items-center gap-space-2xs shadow-sm no-underline shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    <span>Open Dedicated ABHA Portal</span>
                  </Link>
                </div>

                {/* ABHA Digital Card */}
                <div className="p-space-lg rounded-2xl bg-gradient-to-br from-primary via-primary-container to-secondary text-on-primary shadow-lg flex flex-col md:flex-row justify-between gap-space-lg">
                  <div className="flex flex-col justify-between gap-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-headline-sm text-headline-sm font-bold tracking-tight">ABHA CARD</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-on-primary text-label-sm font-semibold">National Health Authority</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-surface-variant text-label-sm uppercase tracking-wider">Ayushman Bharat Health Account Number</span>
                      <span className="font-headline-md text-headline-md font-mono tracking-widest">{profile.abhaId}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-space-md text-body-sm">
                      <div>
                        <span className="text-surface-variant text-label-sm block">Name</span>
                        <span className="font-semibold text-body-md">{profile.fullName}</span>
                      </div>
                      <div>
                        <span className="text-surface-variant text-label-sm block">ABHA Address</span>
                        <span className="font-semibold font-mono text-body-md">rahul.sharma@abdm</span>
                      </div>
                      <div>
                        <span className="text-surface-variant text-label-sm block">Gender / DOB</span>
                        <span className="font-semibold">{profile.gender} / {profile.dob}</span>
                      </div>
                      <div>
                        <span className="text-surface-variant text-label-sm block">Mobile</span>
                        <span className="font-semibold">{profile.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-space-md bg-white rounded-xl text-primary shrink-0 self-center md:self-auto shadow-sm">
                    <div className="w-32 h-32 bg-surface-container flex items-center justify-center rounded-lg border-2 border-primary/20">
                      <span className="material-symbols-outlined text-[72px] text-primary">qr_code_2</span>
                    </div>
                    <span className="font-label-sm text-[10px] font-mono mt-2 text-on-surface-variant">ABDM SECURE QR</span>
                  </div>
                </div>

                {/* Verification Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                  <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-[24px] text-tertiary">check_circle</span>
                    <div>
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">Aadhaar Linked</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Biometrically verified with UIDAI registry.</p>
                    </div>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-[24px] text-tertiary">shield</span>
                    <div>
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">Consent Manager Active</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Section 29 break-glass protocol enabled.</p>
                    </div>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-[24px] text-secondary">cloud_sync</span>
                    <div>
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">Live EHR Sync</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Connected across 42 partner hospitals.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 3: EMERGENCY CONTACTS VIEW */}
            {activeModule === 'emergency' && (
              <div className="flex flex-col gap-space-md">
                {/* Header & Action Row */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex flex-col gap-space-2xs max-w-2xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[24px] text-primary">contact_emergency</span>
                      <h1 className="font-headline-md text-headline-md text-primary">Emergency Contacts &amp; SOS Dispatch</h1>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Designated individuals and clinical proxies authorized for instant automated SMS, GPS trauma ingress telemetry, and ICU break-glass consent.
                    </p>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0 flex-wrap">
                    <button
                      onClick={() => triggerSignal('Trauma Beacon Network (Apollo Greams Trauma Bay)')}
                      className="px-space-md py-space-xs bg-surface-container-high hover:bg-surface-container text-primary font-label-lg text-label-lg rounded-lg transition-colors flex items-center gap-space-2xs shadow-sm cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">wifi_tethering</span>
                      <span>Broadcast Test Ping</span>
                    </button>
                    <a
                      className="px-space-md py-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg rounded-lg transition-colors flex items-center gap-space-2xs shadow-sm cursor-pointer"
                      href="#quick-add-form"
                      onClick={openAddContact}
                    >
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                      <span>+ Add Emergency Contact</span>
                    </a>
                  </div>
                </div>

                {/* Callout: Trauma Beacon Integration Ribbon */}
                <div className="bg-surface-container-low p-space-md rounded-xl shadow-sm flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
                  </div>
                  <div className="flex flex-col gap-space-2xs">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-headline-sm text-headline-sm text-primary">Trauma Beacon Integration</span>
                      <span className="bg-surface-container-high text-secondary text-label-sm font-label-sm px-2 py-0.5 rounded-full font-semibold">Latency: 0.18s</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      In an emergency or Level-1 trauma triage scan, automated real-time SMS alerts with live hospital bay location, telemetry packets, and attending clinician contact are dispatched within 0.18s to your Primary Contact.
                    </p>
                  </div>
                </div>

                {/* Priority Contact Cards */}
                <div className="flex flex-col gap-space-md" id="contacts-container">
                  {contacts.map((contact) => {
                    const isP1 = contact.priority === 'p1';
                    const isP2 = contact.priority === 'p2';
                    const badgeClass = isP1
                      ? 'bg-tertiary text-on-tertiary'
                      : isP2
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-high text-on-surface';
                    const badgeIcon = isP1 ? 'verified' : isP2 ? 'medical_information' : 'info';
                    const timingColor = isP1 ? 'text-primary' : isP2 ? 'text-secondary' : 'text-on-surface-variant';

                    return (
                      <div
                        key={contact.id}
                        className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md relative overflow-hidden transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                          <div className="flex items-center gap-space-md">
                            <div
                              className={`w-14 h-14 rounded-xl ${
                                isP1 ? 'bg-surface-container-high text-primary' : 'bg-surface-container-high text-secondary'
                              } flex items-center justify-center font-headline-md text-headline-md font-bold shadow-sm flex-shrink-0`}
                            >
                              {contact.initials || 'EC'}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-space-xs flex-wrap">
                                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{contact.name}</span>
                                <span className="font-label-md text-label-md text-on-surface-variant">• {contact.relation}</span>
                                <span className={`${badgeClass} font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1`}>
                                  <span className="material-symbols-outlined text-[12px]">{badgeIcon}</span> {contact.priorityText}
                                </span>
                              </div>
                              <div className="flex items-center gap-space-md mt-1 flex-wrap text-on-surface-variant">
                                <div className="flex items-center gap-space-2xs">
                                  <span className="material-symbols-outlined text-[16px] text-secondary">call</span>
                                  <span className="font-body-md text-body-md font-medium text-on-surface">{contact.phone}</span>
                                  <span className="bg-surface-container-high text-tertiary font-label-sm text-label-sm px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1">
                                    <span className="material-symbols-outlined text-[12px]">verified_user</span> Aadhaar OTP Verified
                                  </span>
                                </div>
                                {contact.workPhone && (
                                  <div className="flex items-center gap-space-2xs">
                                    <span className="material-symbols-outlined text-[16px]">work</span>
                                    <span className="font-body-sm text-body-sm">{contact.workPhone}</span>
                                  </div>
                                )}
                                {contact.email && (
                                  <div className="flex items-center gap-space-2xs">
                                    <span className="material-symbols-outlined text-[16px]">mail</span>
                                    <span className="font-body-sm text-body-sm">{contact.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div
                            className="bg-surface-container-low px-space-md py-space-xs rounded-lg flex flex-col md:items-end justify-center cursor-pointer hover:bg-surface-container transition-colors"
                            onClick={() => handleToggleTiming(contact.id)}
                            title="Click to toggle timing"
                          >
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Dispatch Timing</span>
                            <span className={`font-headline-sm text-headline-sm ${timingColor} font-bold`}>{contact.timing || 'Instant (0s delay)'}</span>
                          </div>
                        </div>

                        {/* Privileges & Badges */}
                        <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                          <div className="flex flex-col gap-1">
                            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Emergency Permissions &amp; Legal Authorities</span>
                            <div className="flex flex-wrap gap-space-xs mt-1">
                              {(contact.permissions || ['Medical History Access Granted', 'Real-time ER Admittance GPS Tracking']).map((perm, idx) => (
                                <span key={idx} className="bg-surface-container-lowest text-primary font-label-sm text-label-sm px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span> {perm}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-space-xs self-end md:self-center shrink-0">
                            <button
                              className="px-space-sm py-1.5 bg-surface-container-lowest hover:bg-surface-container-high text-primary font-label-md text-label-md rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                              onClick={() => triggerSignal(contact.name)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">cell_tower</span> Simulate Test Alert
                            </button>
                            <button
                              className="px-space-sm py-1.5 bg-surface-container-lowest hover:bg-surface-container-high text-primary font-label-md text-label-md rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                              onClick={() => handleEditContact(contact)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                            </button>
                            <button
                              className="text-on-surface-variant hover:text-error font-label-md text-label-md px-2 py-1 transition-colors cursor-pointer"
                              onClick={() => handleRemoveContact(contact.id, contact.name)}
                              type="button"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Add / Ingress Proxy Form Drawer Card */}
                <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md" id="quick-add-form">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm text-primary">
                        {editingContactId ? 'Edit Emergency Contact / Proxy' : 'Add Authorized Emergency Contact / Proxy'}
                      </h2>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">NDHM Sec 29 Standard Form</span>
                  </div>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-space-md" onSubmit={handleSaveContact}>
                    {/* Full Name */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="contact-name">Full Legal Name</label>
                      <input
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        id="contact-name"
                        placeholder="e.g. Meera Sharma"
                        required
                        type="text"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      />
                    </div>
                    {/* Relationship Dropdown */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="contact-relation">Relationship to Patient</label>
                      <div className="relative">
                        <select
                          className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
                          id="contact-relation"
                          value={newContact.relation}
                          onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                        >
                          <option>Spouse</option>
                          <option>Parent</option>
                          <option>Child</option>
                          <option>Sibling</option>
                          <option>Trusted Physician</option>
                          <option>Legal Guardian</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>
                    {/* Primary Mobile with Verification trigger */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="contact-phone">Primary Mobile Number</label>
                      <div className="flex gap-space-xs">
                        <span className="px-space-sm py-space-xs bg-surface-container text-on-surface rounded-lg font-label-md text-label-md flex items-center font-bold">+91</span>
                        <input
                          className="flex-1 px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                          id="contact-phone"
                          placeholder="98400 00000"
                          required
                          type="tel"
                          value={newContact.phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                        />
                        <button
                          className="px-space-md py-space-xs bg-surface-container-high hover:bg-surface-container text-primary font-label-md text-label-md rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                          type="button"
                          onClick={triggerOtpPrompt}
                        >
                          Send OTP
                        </button>
                      </div>
                      {/* Dynamic Inline OTP Input Group */}
                      {otpSent && (
                        <div className="flex gap-space-xs mt-2 transition-all">
                          <input
                            className="flex-1 px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                            placeholder="Enter 6-digit OTP (Mock: 482910)"
                            maxLength={6}
                            type="text"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                          />
                          <button
                            className="px-space-md py-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                            type="button"
                            onClick={verifyOtp}
                          >
                            Verify OTP
                          </button>
                        </div>
                      )}
                      {isPhoneVerified && (
                        <div className="mt-1 inline-flex items-center gap-1 text-tertiary font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[14px]">verified_user</span> Aadhaar OTP Verified
                        </div>
                      )}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Instant OTP required for Aadhaar-linked break-glass authority.</span>
                    </div>
                    {/* Email Address */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="contact-email">Email (Telemetry Delivery)</label>
                      <input
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        id="contact-email"
                        placeholder="e.g. meera.sharma@domain.in"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      />
                    </div>
                    {/* Dispatch Priority Level Selector */}
                    <div className="md:col-span-2 flex flex-col gap-space-xs pt-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Dispatch Ingress Tier</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                        <label className="flex items-start gap-space-xs p-space-sm rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                          <input
                            className="mt-1 accent-primary"
                            name="priority"
                            type="radio"
                            value="p1"
                            checked={newContact.priority === 'p1'}
                            onChange={() => setNewContact({ ...newContact, priority: 'p1' })}
                          />
                          <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg font-semibold text-primary">Priority 1 (Primary)</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Instant SMS dispatch + DPOA authority</span>
                          </div>
                        </label>
                        <label className="flex items-start gap-space-xs p-space-sm rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                          <input
                            className="mt-1 accent-primary"
                            name="priority"
                            type="radio"
                            value="p2"
                            checked={newContact.priority === 'p2'}
                            onChange={() => setNewContact({ ...newContact, priority: 'p2' })}
                          />
                          <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg font-semibold text-primary">Priority 2 (Secondary)</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Escalation dispatch if P1 unreachable (+2 mins)</span>
                          </div>
                        </label>
                        <label className="flex items-start gap-space-xs p-space-sm rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                          <input
                            className="mt-1 accent-primary"
                            name="priority"
                            type="radio"
                            value="p3"
                            checked={newContact.priority === 'p3'}
                            onChange={() => setNewContact({ ...newContact, priority: 'p3' })}
                          />
                          <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg font-semibold text-primary">Priority 3 (Informational)</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Post-stabilization SMS notification</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    {/* Authorization Checkboxes */}
                    <div className="md:col-span-2 flex flex-col gap-space-xs pt-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Authorization &amp; Legal Permissions</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                        <label className="flex items-center gap-space-sm p-space-sm bg-surface-container-low rounded-lg cursor-pointer">
                          <input
                            className="w-4 h-4 accent-primary rounded"
                            type="checkbox"
                            checked={newContact.allowMedicalHistory}
                            onChange={(e) => handlePermissionChange('allowMedicalHistory', e.target.checked)}
                          />
                          <span className="font-body-md text-body-md text-on-surface">Allow Medical History Access during Trauma Ingress</span>
                        </label>
                        <label className="flex items-center gap-space-sm p-space-sm bg-surface-container-low rounded-lg cursor-pointer">
                          <input
                            className="w-4 h-4 accent-primary rounded"
                            type="checkbox"
                            checked={newContact.receiveGps}
                            onChange={(e) => handlePermissionChange('receiveGps', e.target.checked)}
                          />
                          <span className="font-body-md text-body-md text-on-surface">Receive Ambulatory GPS Tracking updates</span>
                        </label>
                      </div>
                    </div>
                    {/* Form Buttons */}
                    <div className="md:col-span-2 flex items-center justify-end gap-space-sm pt-space-md">
                      <button
                        className="px-space-md py-space-xs text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer"
                        type="button"
                        onClick={handleResetForm}
                      >
                        Cancel
                      </button>
                      <button className="px-space-xl py-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg rounded-lg shadow-sm transition-colors flex items-center gap-space-2xs cursor-pointer" type="submit">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>{editingContactId ? 'Update Emergency Contact' : 'Save Emergency Contact'}</span>
                      </button>
                    </div>
                  </form>
                </section>

                {/* SOS Ambulance & Hospital Fast-Pass Integration Strip */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[28px]">airport_shuttle</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-primary">Pre-Linked Ambulance Fast-Pass • NHM 108 &amp; Apollo Trauma</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Pre-linked to National Health Mission (NHM 108) Ambulance &amp; Apollo Greams Trauma Emergency Bay. Authorized contacts will automatically receive live ambulance dispatch GPS telemetry upon trauma activation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0 self-start md:self-center">
                    <span className="bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">cell_tower</span> Live Sync Ready
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: NOTIFICATIONS VIEW */}
            {activeModule === 'notifications' && (
              <div className="flex flex-col gap-space-lg">
                {/* Workspace Header Banner */}
                <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                      <span className="material-symbols-outlined text-[15px]">tune</span>
                      <span>Patient Preferences &amp; Safety Protocols / Notifications</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Notification Settings</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">Choose how and when E-KAWACH keeps you informed across clinical updates and critical care.</p>
                  </div>
                  <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-2 flex-shrink-0">
                    <button
                      className="inline-flex items-center justify-center gap-2 px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                      onClick={handleSaveNotificationPrefs}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      <span>Save Preferences</span>
                    </button>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
                      <span>ABDM Sync: Active (0.04s)</span>
                    </div>
                  </div>
                </div>

                {/* Card 1: Appointments */}
                <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Appointments</h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ backgroundColor: '#E4E4FB', color: '#2e2a72' }}>
                      Clinical Schedule
                    </span>
                  </div>
                  <div className="flex flex-col">
                    {/* Toggle 1 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">Appointment Reminders</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Get notified 24 hours and 1 hour before your appointment.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.appointmentReminders}
                          onChange={() => toggleNotificationPref('appointmentReminders')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                    <div className="h-px w-full bg-surface-container-high my-1"></div>
                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">Approval Status Updates</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Know when a doctor approves, reschedules, or declines your request.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.approvalUpdates}
                          onChange={() => toggleNotificationPref('approvalUpdates')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Card 2: Prescriptions & Health Records */}
                <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">medication</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Prescriptions &amp; Health Records</h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ backgroundColor: '#E4E4FB', color: '#2e2a72' }}>
                      EHR &amp; Pharmacy
                    </span>
                  </div>
                  <div className="flex flex-col">
                    {/* Toggle 1 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">Prescription Refill Alerts</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Reminders when your medication is about to run out.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.refillAlerts}
                          onChange={() => toggleNotificationPref('refillAlerts')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                    <div className="h-px w-full bg-surface-container-high my-1"></div>
                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">New Health Record Added</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Notify me when a doctor updates my health history.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.newRecordAdded}
                          onChange={() => toggleNotificationPref('newRecordAdded')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Card 3: Messages & Consults */}
                <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Messages &amp; Consults</h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ backgroundColor: '#E4E4FB', color: '#2e2a72' }}>
                      Telehealth
                    </span>
                  </div>
                  <div className="flex flex-col">
                    {/* Toggle 1 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">New Doctor Messages</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Get notified when a doctor sends you a message.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.newDoctorMessages}
                          onChange={() => toggleNotificationPref('newDoctorMessages')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                    <div className="h-px w-full bg-surface-container-high my-1"></div>
                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">Video Consult Reminders</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Reminders 10 minutes before a scheduled video call.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.videoReminders}
                          onChange={() => toggleNotificationPref('videoReminders')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Card 4: Emergency & Critical Alerts (LOCKED ON) */}
                <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md relative overflow-hidden" style={{ boxShadow: '0 0 0 1.5px #ba1a1a' }}>
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-error"></div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-error-container text-error flex items-center justify-center">
                        <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
                      </div>
                      <div>
                        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                          <span>Emergency &amp; Critical Alerts</span>
                        </h2>
                        <p className="font-body-sm text-body-sm text-outline">Real-time patient safety safeguards governed by National Emergency Grid.</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                      <span>MANDATORY PROTOCOL</span>
                    </div>
                  </div>
                  <div className="flex flex-col bg-surface-container-low/50 p-space-md rounded-lg gap-space-md">
                    {/* Locked Row 1 */}
                    <div className="flex items-start justify-between gap-space-md">
                      <div className="flex flex-col gap-1 pr-space-md">
                        <div className="flex items-center gap-2">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">Emergency SOS Confirmations</span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-mono">PRIORITY 0</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Instant broadcast confirmations when an ER dispatch, crash cart alert, or ambulance routing is triggered.</p>
                        <div className="flex items-center gap-1.5 mt-1 text-error font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[15px]">lock</span>
                          <span>Required for patient safety — cannot be disabled.</span>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center flex-shrink-0 cursor-not-allowed opacity-90">
                        <div className="w-11 h-6 rounded-full bg-primary flex items-center justify-end px-1 shadow-inner">
                          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
                            <span className="material-symbols-outlined text-[10px] text-primary">lock</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-px w-full bg-surface-container-highest"></div>
                    {/* Locked Row 2 */}
                    <div className="flex items-start justify-between gap-space-md">
                      <div className="flex flex-col gap-1 pr-space-md">
                        <div className="flex items-center gap-2">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">Critical Health Flag Alerts</span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-mono">CLINICAL VITAL</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Immediate alerts for drug-drug contraindications, verified allergy conflict warnings, and triage escalations.</p>
                        <div className="flex items-center gap-1.5 mt-1 text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[15px]">gavel</span>
                          <span>Required by National Health Authority (ABDM) — Non-optional.</span>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center flex-shrink-0 cursor-not-allowed opacity-90">
                        <div className="w-11 h-6 rounded-full bg-primary flex items-center justify-end px-1 shadow-inner">
                          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
                            <span className="material-symbols-outlined text-[10px] text-primary">lock</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Card 5: Government Schemes & General */}
                <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">assured_workload</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Government Schemes &amp; General</h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ backgroundColor: '#E4E4FB', color: '#2e2a72' }}>
                      National Programs
                    </span>
                  </div>
                  <div className="flex flex-col">
                    {/* Toggle 1 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">Scheme Eligibility Updates</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Notify me when I qualify for a new government health scheme or subsidized surgery program.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.schemeUpdates}
                          onChange={() => toggleNotificationPref('schemeUpdates')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                    <div className="h-px w-full bg-surface-container-high my-1"></div>
                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">Platform Announcements</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Occasional updates about new E-KAWACH features, partner hospitals, and educational modules.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.platformAnnouncements}
                          onChange={() => toggleNotificationPref('platformAnnouncements')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Delivery Preferences ("Notify Me Via") */}
                <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary">alt_route</span>
                        <span>Notify Me Via</span>
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Select authorized channels for receiving critical healthcare notifications.</p>
                    </div>
                    <span className="text-secondary font-label-sm text-label-sm font-mono font-semibold">
                      {[notificationPrefs.channelPush, notificationPrefs.channelSms, notificationPrefs.channelEmail].filter(Boolean).length} OF 3 ACTIVE
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-1">
                    {/* Push Notification Channel */}
                    <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between gap-space-sm">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            checked={notificationPrefs.channelPush}
                            onChange={() => toggleNotificationPref('channelPush')}
                            className="sr-only peer"
                            type="checkbox"
                          />
                          <div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-label-lg text-label-lg font-bold text-on-surface">Push Notification</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">Instant mobile app and browser alerts.</p>
                      </div>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          Encrypted Push
                        </span>
                      </div>
                    </div>

                    {/* SMS Channel */}
                    <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between gap-space-sm">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">sms</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            checked={notificationPrefs.channelSms}
                            onChange={() => toggleNotificationPref('channelSms')}
                            className="sr-only peer"
                            type="checkbox"
                          />
                          <div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-label-lg text-label-lg font-bold text-on-surface">SMS Cellular</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant font-mono text-[12px]">{profile.phone}</p>
                      </div>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          Verified Carrier
                        </span>
                      </div>
                    </div>

                    {/* Email Channel */}
                    <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between gap-space-sm">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">mail</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            checked={notificationPrefs.channelEmail}
                            onChange={() => toggleNotificationPref('channelEmail')}
                            className="sr-only peer"
                            type="checkbox"
                          />
                          <div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-label-lg text-label-lg font-bold text-on-surface">Encrypted Email</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate text-[12px]">{profile.email}</p>
                      </div>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          S/MIME Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Action Footer Bar */}
                <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
                    <span>Changes apply immediately across all authorized ABDM and trauma endpoints.</span>
                  </div>
                  <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
                    <button
                      className="px-space-md py-2.5 rounded-lg text-primary hover:bg-surface-container-low font-label-lg text-label-lg font-medium transition-colors cursor-pointer"
                      onClick={handleRestoreNotificationDefaults}
                      type="button"
                    >
                      Restore Defaults
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 px-space-xl py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                      onClick={handleSaveNotificationPrefs}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
