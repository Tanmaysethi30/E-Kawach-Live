const fs = require('fs');
const path = require('path');

// NIT Delhi is located in Zone P1/Narela, Delhi (approx lat: 28.8530, lng: 77.0940)
// Key surrounding clusters: Narela, Bawana, Alipur, Kundli, Rohini (Sec 1-34), Pitampura, Shalimar Bagh, 
// Jahangirpuri, Model Town, Civil Lines, GTB Nagar, Kashmere Gate, Ashok Vihar, Paschim Vihar, Janakpuri, 
// Central Delhi (Connaught Place, Karol Bagh, Daryaganj, Ansari Nagar), South Delhi (Saket, Vasant Kunj, Okhla), 
// East Delhi (Dilshad Garden, Mayur Vihar, Karkardooma, Patparganj), West Delhi (Dwarka, Punjabi Bagh, Rajouri).

const hospitalTemplates = [
  // Cluster 1: NIT Delhi / Narela / Alipur / Bawana Vicinity (Closest to NIT Delhi: 0-10 km)
  { name: "Satyawadi Raja Harishchandra Hospital (SRHC)", area: "Narela, Near NIT Delhi Campus", pin: "110040", lat: 28.8475, lng: 77.1025, type: "Government Apex Trauma", beds: 300, icu: 35 },
  { name: "Maharishi Valmiki Hospital", area: "Pooth Khurd, Bawana Road", pin: "110039", lat: 28.8021, lng: 77.0425, type: "Government Multi-specialty", beds: 250, icu: 30 },
  { name: "Narela Multispeciality Hospital", area: "Pocket 4, Sector A-6, Narela", pin: "110040", lat: 28.8512, lng: 77.0911, type: "Private Tertiary", beds: 120, icu: 18 },
  { name: "Shree Bala Ji Hospital", area: "Alipur Main Road, Near GT Karnal Road", pin: "110036", lat: 28.7990, lng: 77.1350, type: "Private Super-specialty", beds: 110, icu: 15 },
  { name: "Bawana Lifeline Hospital", area: "Main Bawana Chowk", pin: "110039", lat: 28.7950, lng: 77.0380, type: "Trauma & General", beds: 90, icu: 12 },
  { name: "Raja Harishchandra Super Speciality Center", area: "Sector A-7, Narela", pin: "110040", lat: 28.8580, lng: 77.0870, type: "Government Satellite Center", beds: 140, icu: 20 },
  { name: "Apex Trauma & Critical Care Center Narela", area: "Singhu Border Road, Narela", pin: "110040", lat: 28.8680, lng: 77.0990, type: "Emergency & Trauma", beds: 80, icu: 14 },
  { name: "Alipur Health City Hospital", area: "Bakhtawarpur Road, Alipur", pin: "110036", lat: 28.8050, lng: 77.1420, type: "General Multi-specialty", beds: 100, icu: 12 },
  { name: "Santokh Multi-Specialty Hospital", area: "Holambi Kalan, Narela Link Road", pin: "110082", lat: 28.8210, lng: 77.0980, type: "Multi-specialty", beds: 75, icu: 10 },
  { name: "Lifeline Medicare Hospital", area: "GT Karnal Road, Kundli-Narela Border", pin: "110040", lat: 28.8710, lng: 77.1120, type: "Emergency Hub", beds: 130, icu: 22 },

  // Cluster 2: Rohini & Pitampura (North-West Delhi: 10-18 km from NIT Delhi)
  { name: "Dr. Baba Saheb Ambedkar Hospital (BSA)", area: "Sector 6, Rohini", pin: "110085", lat: 28.7159, lng: 77.1147, type: "Govt Medical College & Hospital", beds: 550, icu: 65 },
  { name: "Max Super Speciality Hospital Rohini", area: "FC-50, C&D Block, Shalimar Bagh / Rohini", pin: "110088", lat: 28.7180, lng: 77.1585, type: "Private Quaternary", beds: 350, icu: 70 },
  { name: "Rajiv Gandhi Cancer Institute & Research Centre (RGCI)", area: "Sector 5, Rohini", pin: "110085", lat: 28.7120, lng: 77.1110, type: "Autonomous Oncology Center", beds: 500, icu: 60 },
  { name: "Saroj Super Speciality Hospital", area: "Sector 14, Rohini", pin: "110085", lat: 28.7240, lng: 77.1265, type: "Private Tertiary Hub", beds: 200, icu: 35 },
  { name: "Bhagwan Mahavir Hospital", area: "H-4/5, Sector 14 Extn, Rohini", pin: "110085", lat: 28.7280, lng: 77.1320, type: "Government Multi-specialty", beds: 300, icu: 40 },
  { name: "Jaipur Golden Hospital", area: "Sector 3, Rohini", pin: "110085", lat: 28.6995, lng: 77.1080, type: "Private Super-specialty", beds: 250, icu: 45 },
  { name: "Fortis Hospital Shalimar Bagh", area: "AA Block, Poorbi Shalimar Bagh", pin: "110088", lat: 28.7065, lng: 77.1640, type: "Private Quaternary", beds: 260, icu: 50 },
  { name: "Brahm Shakti Hospital", area: "U-1/78, Budh Vihar, Phase 1, Rohini", pin: "110086", lat: 28.7110, lng: 77.0850, type: "Multi-specialty", beds: 150, icu: 25 },
  { name: "Sri Balaji Action Medical Institute", area: "FC-34, A-4, Paschim Vihar", pin: "110063", lat: 28.6720, lng: 77.1040, type: "Private Tertiary", beds: 400, icu: 60 },
  { name: "Kasturi Hospital", area: "Sector 8, Rohini", pin: "110085", lat: 28.7080, lng: 77.1230, type: "Multi-specialty", beds: 80, icu: 12 },
  { name: "North Delhi Advanced Trauma & ICU Center", area: "Sector 22, Rohini", pin: "110086", lat: 28.7350, lng: 77.0650, type: "Trauma Specialist", beds: 110, icu: 24 },
  { name: "Cura Multispeciality Hospital", area: "Sector 11, Rohini", pin: "110085", lat: 28.7215, lng: 77.1190, type: "Private Multi-specialty", beds: 90, icu: 15 },
  { name: "Garg Multispeciality Hospital", area: "Sector 24, Rohini", pin: "110085", lat: 28.7390, lng: 77.0820, type: "Private Care Hub", beds: 85, icu: 14 },
  { name: "Maharaja Agrasen Hospital", area: "West Punjabi Bagh, Rohtak Road", pin: "110026", lat: 28.6710, lng: 77.1350, type: "Trust Multi-specialty", beds: 400, icu: 65 },
  { name: "Max Multi Speciality Centre Pitampura", area: "HB Twin Tower, Netaji Subhash Place", pin: "110034", lat: 28.6920, lng: 77.1510, type: "Daycare & Multi-specialty", beds: 70, icu: 12 },

  // Cluster 3: Jahangirpuri, Burari, Azadpur, Model Town & GTB Nagar
  { name: "Babu Jagjivan Ram Memorial Hospital (BJRM)", area: "E-Block, Jahangirpuri", pin: "110033", lat: 28.7340, lng: 77.1720, type: "Government Emergency & Trauma", beds: 300, icu: 40 },
  { name: "Burari Government Hospital", area: "Kaushik Enclave, Burari", pin: "110084", lat: 28.7510, lng: 77.2020, type: "Government General & Infectious", beds: 800, icu: 90 },
  { name: "Sant Parmanand Hospital", area: "18 Alipur Road, Civil Lines", pin: "110054", lat: 28.6815, lng: 77.2250, type: "Orthopedic & Trauma Apex", beds: 160, icu: 30 },
  { name: "Tirath Ram Shah Charitable Hospital", area: "2A Battery Lane, Rajpur Road, Civil Lines", pin: "110054", lat: 28.6750, lng: 77.2200, type: "Trust Super-specialty", beds: 200, icu: 32 },
  { name: "Vinayak Hospital", area: "Derawal Nagar, Gujranwala Town, Model Town", pin: "110009", lat: 28.7010, lng: 77.1920, type: "Private Super-specialty", beds: 120, icu: 20 },
  { name: "Kalyani Hospital", area: "Near Model Town Metro, GT Road", pin: "110009", lat: 28.7050, lng: 77.1940, type: "Critical Care", beds: 80, icu: 15 },
  { name: "Deepak Memorial Trauma & Eye Hospital", area: "Vikas Marg Extn / Azadpur Node", pin: "110033", lat: 28.7120, lng: 77.1780, type: "Trauma Hub", beds: 95, icu: 16 },
  { name: "ESI Hospital Jahangirpuri", area: "Industrial Area, Jahangirpuri", pin: "110033", lat: 28.7280, lng: 77.1650, type: "Government Social Security", beds: 220, icu: 28 },
  { name: "Metro Hospital & Heart Institute North", area: "GT Road, Near Azadpur", pin: "110033", lat: 28.7180, lng: 77.1810, type: "Cardiology Specialist", beds: 110, icu: 25 },
  { name: "St. Stephen's Hospital", area: "Tis Hazari, Near Kashmere Gate", pin: "110054", lat: 28.6655, lng: 77.2185, type: "Christian Missionary Apex", beds: 600, icu: 80 },

  // Cluster 4: University / North Delhi Medical Hub
  { name: "Vallabhbhai Patel Chest Institute (VPCI)", area: "University Enclave, North Campus", pin: "110007", lat: 28.6910, lng: 77.2150, type: "National Pulmonology Apex", beds: 150, icu: 30 },
  { name: "Rajan Babu Institute of Pulmonary Medicine and Tuberculosis (RBIPMT)", area: "Kingsway Camp, GTB Nagar", pin: "110009", lat: 28.7030, lng: 77.2080, type: "Government Chest Apex", beds: 700, icu: 50 },
  { name: "Hindu Rao Hospital", area: "Near Malka Ganj, Sabzi Mandi", pin: "110007", lat: 28.6730, lng: 77.2110, type: "Municipal Medical College & Hospital", beds: 900, icu: 95 },
  { name: "Kasturba Hospital", area: "Near Jama Masjid, Daryaganj", pin: "110006", lat: 28.6500, lng: 77.2340, type: "Govt Women & Child Apex", beds: 450, icu: 40 },
  { name: "Sanjivani Multispecialty Hospital", area: "Burari Main Market", pin: "110084", lat: 28.7450, lng: 77.1980, type: "Private General", beds: 65, icu: 10 },
  { name: "Nulife Multispeciality Hospital", area: "Outram Lines, Kingsway Camp, GTB Nagar", pin: "110009", lat: 28.6980, lng: 77.2070, type: "Private Tertiary", beds: 100, icu: 18 },
  { name: "Sunder Lal Jain Charitable Hospital", area: "Ashok Vihar Phase III", pin: "110052", lat: 28.6870, lng: 77.1760, type: "Trust Multi-specialty", beds: 200, icu: 30 },
  { name: "Jeewan Mala Hospital", area: "67/1, New Rohtak Road, Karol Bagh", pin: "110005", lat: 28.6570, lng: 77.1890, type: "Private Tertiary", beds: 140, icu: 25 },
  { name: "Dr. N.C. Joshi Memorial Hospital", area: "Karol Bagh", pin: "110005", lat: 28.6520, lng: 77.1950, type: "Government Hospital", beds: 100, icu: 15 },
  { name: "G.B. Pant Hospital (GIPMER)", area: "1, Jawaharlal Nehru Marg, Delhi Gate", pin: "110002", lat: 28.6380, lng: 77.2380, type: "Govt Super-Specialty Institute", beds: 750, icu: 110 },

  // Cluster 5: Central Delhi & Major Apex Government Institutions
  { name: "Lok Nayak Hospital (LNJP)", area: "Jawaharlal Nehru Marg, Delhi Gate", pin: "110002", lat: 28.6375, lng: 77.2400, type: "Government Apex Hospital", beds: 2000, icu: 250 },
  { name: "Dr. Ram Manohar Lohia Hospital (RML)", area: "Baba Kharak Singh Marg, Connaught Place", pin: "110001", lat: 28.6250, lng: 77.2010, type: "Central Govt Apex Trauma", beds: 1400, icu: 180 },
  { name: "Sir Ganga Ram Hospital", area: "Rajinder Nagar", pin: "110060", lat: 28.6385, lng: 77.1895, type: "Trust Premier Super-Specialty", beds: 675, icu: 120 },
  { name: "BLK-Max Super Speciality Hospital", area: "Pusa Road, Karol Bagh", pin: "110005", lat: 28.6435, lng: 77.1800, type: "Private Quaternary", beds: 650, icu: 125 },
  { name: "Lady Hardinge Medical College & Smt. Sucheta Kriplani Hospital", area: "Connaught Place", pin: "110001", lat: 28.6320, lng: 77.2150, type: "Central Govt Medical College", beds: 870, icu: 90 },
  { name: "Kalawati Saran Children's Hospital", area: "Bangla Sahib Marg, Connaught Place", pin: "110001", lat: 28.6315, lng: 77.2140, type: "Govt Pediatric Apex", beds: 400, icu: 60 },
  { name: "Northern Railway Central Hospital", area: "Basant Lane, Connaught Place / Paharganj", pin: "110055", lat: 28.6410, lng: 77.2180, type: "Central Govt Railway Apex", beds: 500, icu: 55 },
  { name: "Shroff Eye Hospital", area: "Kailash Colony / Daryaganj", pin: "110002", lat: 28.6450, lng: 77.2420, type: "Super-specialty Ophthalmology", beds: 60, icu: 8 },
  { name: "Tirath Ram Shah Hospital North", area: "Near Tis Hazari", pin: "110054", lat: 28.6710, lng: 77.2230, type: "Trust Care Node", beds: 110, icu: 18 },
  { name: "City Clinic Trauma Center", area: "Asaf Ali Road, Delhi Gate", pin: "110002", lat: 28.6420, lng: 77.2350, type: "Emergency Daycare", beds: 50, icu: 10 },

  // Cluster 6: South Delhi & AIIMS Supercluster
  { name: "All India Institute of Medical Sciences (AIIMS New Delhi)", area: "Ansari Nagar East, Ring Road", pin: "110029", lat: 28.5672, lng: 77.2100, type: "National Apex Institute & Level-1 Trauma", beds: 2500, icu: 350 },
  { name: "Safdarjung Hospital & VMMC", area: "Ring Road, Opposite AIIMS", pin: "110029", lat: 28.5700, lng: 77.2080, type: "Central Govt Apex Level-1 Trauma", beds: 2800, icu: 320 },
  { name: "Max Super Speciality Hospital Saket", area: "1, 2 Press Enclave Marg, Saket", pin: "110017", lat: 28.5280, lng: 77.2120, type: "Private Quaternary", beds: 550, icu: 110 },
  { name: "Indraprastha Apollo Hospitals", area: "Delhi-Mathura Road, Sarita Vihar", pin: "110076", lat: 28.5410, lng: 77.2830, type: "Private Flagship Quaternary", beds: 710, icu: 140 },
  { name: "Fortis Escorts Heart Institute", area: "Okhla Road, New Friends Colony", pin: "110025", lat: 28.5610, lng: 77.2730, type: "Cardiac Apex", beds: 310, icu: 75 },
  { name: "Fortis Flt. Lt. Rajan Dhall Hospital", area: "Sector B, Pocket 1, Aruna Asaf Ali Marg, Vasant Kunj", pin: "110070", lat: 28.5240, lng: 77.1580, type: "Private Multi-specialty", beds: 200, icu: 45 },
  { name: "Institute of Liver and Biliary Sciences (ILBS)", area: "D-1, Vasant Kunj", pin: "110070", lat: 28.5080, lng: 77.1610, type: "Autonomous Hepatic Apex", beds: 450, icu: 85 },
  { name: "Moolchand Medcity", area: "Lajpat Nagar III, Near Moolchand Metro", pin: "110024", lat: 28.5670, lng: 77.2370, type: "Private Super-specialty", beds: 300, icu: 55 },
  { name: "Holy Family Hospital", area: "Okhla Road, Jamia Nagar", pin: "110025", lat: 28.5620, lng: 77.2790, type: "Trust Multi-specialty", beds: 350, icu: 60 },
  { name: "National Heart Institute", area: "49-50, Community Centre, East of Kailash", pin: "110065", lat: 28.5580, lng: 77.2480, type: "Cardiovascular Apex", beds: 120, icu: 30 },
  { name: "Bansal Hospital", area: "Friends Colony West, Mathura Road", pin: "110065", lat: 28.5690, lng: 77.2650, type: "Private Tertiary", beds: 110, icu: 22 },
  { name: "Pt. Madan Mohan Malaviya Hospital", area: "Malviya Nagar", pin: "110017", lat: 28.5350, lng: 77.2140, type: "Government Multi-specialty", beds: 200, icu: 25 },
  { name: "Sardar Vallabh Bhai Patel Hospital", area: "East Patel Nagar", pin: "110008", lat: 28.6490, lng: 77.1720, type: "Government Hospital", beds: 150, icu: 20 },
  { name: "Sitaram Bhartia Institute of Science and Research", area: "B-16, Qutab Institutional Area", pin: "110016", lat: 28.5390, lng: 77.1850, type: "Research & Tertiary", beds: 80, icu: 15 },
  { name: "Pushpawati Singhania Hospital & Research Institute (PSRI)", area: "Press Enclave Marg, Sheikh Sarai II", pin: "110017", lat: 28.5310, lng: 77.2280, type: "Gastro & Renal Apex", beds: 200, icu: 40 },

  // Cluster 7: West & South-West Delhi (Dwarka, Janakpuri, Vikaspuri, Tilak Nagar)
  { name: "Indira Gandhi Hospital (IGH Dwarka)", area: "Sector 9, Dwarka", pin: "110077", lat: 28.5780, lng: 77.0650, type: "Government Mega Hospital", beds: 1240, icu: 150 },
  { name: "Venkateshwar Hospital", area: "Sector 18A, Dwarka", pin: "110075", lat: 28.5910, lng: 77.0420, type: "Private Quaternary", beds: 325, icu: 65 },
  { name: "Manipal Hospital Dwarka", area: "Sector 6, Dwarka", pin: "110075", lat: 28.5890, lng: 77.0720, type: "Private Quaternary", beds: 380, icu: 75 },
  { name: "Deen Dayal Upadhyay Hospital (DDU)", area: "Hari Nagar, Clock Tower", pin: "110064", lat: 28.6280, lng: 77.1120, type: "Government Apex Trauma", beds: 650, icu: 80 },
  { name: "Janakpuri Super Speciality Hospital", area: "C-2B, Janakpuri", pin: "110058", lat: 28.6210, lng: 77.0870, type: "Autonomous Govt Super-specialty", beds: 300, icu: 45 },
  { name: "Mata Chanan Devi Hospital", area: "C-1, Janakpuri", pin: "110058", lat: 28.6250, lng: 77.0940, type: "Trust Multi-specialty", beds: 210, icu: 35 },
  { name: "Aakash Healthcare Super Speciality Hospital", area: "Road No 201, Sector 3, Dwarka", pin: "110075", lat: 28.6010, lng: 77.0490, type: "Private Super-specialty", beds: 230, icu: 50 },
  { name: "Maharaja Agrasen Hospital Dwarka", area: "Sector 1, Dwarka", pin: "110075", lat: 28.6050, lng: 77.0750, type: "Trust Care Node", beds: 180, icu: 30 },
  { name: "Bhagat Chandra Hospital", area: "RZ-F 1/1, Mahavir Enclave, Palam", pin: "110045", lat: 28.5980, lng: 77.0850, type: "Multi-specialty", beds: 120, icu: 20 },
  { name: "Ayushman Hospital & Health Services", area: "Sector 10, Dwarka", pin: "110075", lat: 28.5820, lng: 77.0580, type: "Private Tertiary", beds: 140, icu: 25 },
  { name: "Khetarpal Hospital", area: "F-95, Bali Nagar, Main Najafgarh Road", pin: "110015", lat: 28.6550, lng: 77.1320, type: "Surgical Hub", beds: 70, icu: 12 },
  { name: "Sehgal Neo Hospital", area: "B-362, 363, 364, Meera Bagh, Outer Ring Road, Paschim Vihar", pin: "110063", lat: 28.6650, lng: 77.0950, type: "Super-specialty", beds: 100, icu: 18 },
  { name: "Sonia Hospital", area: "1, Gulshan Park, Rohtak Road, Nangloi", pin: "110041", lat: 28.6820, lng: 77.0580, type: "Trauma & General", beds: 80, icu: 14 },
  { name: "Satyabhama Hospital", area: "Nangloi Najafgarh Road", pin: "110041", lat: 28.6750, lng: 77.0620, type: "Emergency Center", beds: 75, icu: 10 },
  { name: "Goyal Hospital & Urology Centre", area: "E-4/8, Krishna Nagar", pin: "110051", lat: 28.6590, lng: 77.2850, type: "Urology & Super-specialty", beds: 90, icu: 15 },

  // Cluster 8: East Delhi & Trans-Yamuna Healthcare Hubs
  { name: "Guru Teg Bahadur Hospital (GTB) & UCMS", area: "Dilshad Garden, Shahdara", pin: "110095", lat: 28.6830, lng: 77.3110, type: "Govt Medical College & Level-1 Trauma", beds: 1700, icu: 220 },
  { name: "Rajiv Gandhi Super Speciality Hospital (RGSSH)", area: "Tahirpur, Dilshad Garden", pin: "110093", lat: 28.6880, lng: 77.3190, type: "Autonomous Govt Super-specialty", beds: 650, icu: 100 },
  { name: "Max Super Speciality Hospital Patparganj", area: "108A, I.P. Extension, Patparganj", pin: "110092", lat: 28.6310, lng: 77.3050, type: "Private Quaternary", beds: 400, icu: 85 },
  { name: "Dharamshila Narayana Superspeciality Hospital", area: "Vasundhara Enclave, Near New Ashok Nagar", pin: "110096", lat: 28.6010, lng: 77.3250, type: "Narayana Oncology & Super-specialty", beds: 350, icu: 70 },
  { name: "Lal Bahadur Shastri Hospital (LBS)", area: "Khichripur, Mayur Vihar Phase II", pin: "110091", lat: 28.6210, lng: 77.3120, type: "Government Multi-specialty", beds: 300, icu: 40 },
  { name: "Dr. Hedgewar Aarogya Sansthan", area: "Karkardooma, Institutional Area", pin: "110032", lat: 28.6540, lng: 77.3020, type: "Government Hospital", beds: 200, icu: 30 },
  { name: "Shanti Mukand Hospital", area: "2, Institutional Area, Vikas Marg Extn, Karkardooma", pin: "110092", lat: 28.6480, lng: 77.2990, type: "Trust Super-specialty", beds: 200, icu: 35 },
  { name: "Metro Hospital & Cancer Institute Preet Vihar", area: "21, Community Centre, Preet Vihar", pin: "110092", lat: 28.6380, lng: 77.2920, type: "Oncology & Heart Hub", beds: 155, icu: 30 },
  { name: "Cosmos Hospital", area: "Anand Vihar, Near Railway Station", pin: "110092", lat: 28.6510, lng: 77.3150, type: "Emergency & Multi-specialty", beds: 80, icu: 14 },
  { name: "East Delhi Medical Centre", area: "1/550, GT Road, Mansarovar Park, Shahdara", pin: "110032", lat: 28.6780, lng: 77.2980, type: "Multi-specialty", beds: 75, icu: 12 },

  // Cluster 9: Northern Outskirts & Delhi-Sonipat-Kundli Corridor (Immediate NIT Delhi Perimeter)
  { name: "FIMS Multi Super Speciality Hospital Sonipat-Kundli", area: "GT Karnal Road, Kundli (Adjacent to NIT Delhi)", pin: "131028", lat: 28.8750, lng: 77.1250, type: "Private Super-specialty", beds: 250, icu: 45 },
  { name: "Apex Green Hospital Kundli", area: "Near KMP Expressway & NIT Delhi Link", pin: "131028", lat: 28.8820, lng: 77.1180, type: "Emergency Trauma", beds: 120, icu: 20 },
  { name: "Narela Trauma & Critical Care Center", area: "Main Road, Sector A-5, Narela", pin: "110040", lat: 28.8550, lng: 77.0980, type: "Trauma Care", beds: 90, icu: 18 },
  { name: "Bawana Industrial Emergency Medical Center", area: "Sector 3, DSIIDC Bawana", pin: "110039", lat: 28.8080, lng: 77.0320, type: "Industrial & Burn Trauma", beds: 100, icu: 20 },
  { name: "Alipur Community Health Center & Trauma Unit", area: "GT Karnal Road, Alipur", pin: "110036", lat: 28.8020, lng: 77.1320, type: "Community Trauma", beds: 85, icu: 12 },
  { name: "Sir Aspi Hospital Narela", area: "Khatri Enclave, Narela", pin: "110040", lat: 28.8490, lng: 77.1080, type: "Private Care Center", beds: 60, icu: 10 },
  { name: "Kisan Health Trauma Centre Singhu", area: "Singhu Border National Highway 44", pin: "110040", lat: 28.8850, lng: 77.1300, type: "Highway Emergency Post", beds: 70, icu: 15 },
  { name: "Divine Multispeciality Hospital", area: "Sector 16, Rohini", pin: "110089", lat: 28.7310, lng: 77.1380, type: "Multi-specialty", beds: 80, icu: 12 },
  { name: "Saroj Medical Institute", area: "Sector 19, Rohini", pin: "110089", lat: 28.7360, lng: 77.1420, type: "Tertiary Node", beds: 150, icu: 28 },
  { name: "Agrasen Multi-Speciality Node", area: "Sector 22, Rohini", pin: "110086", lat: 28.7410, lng: 77.0720, type: "Trust Satellite", beds: 90, icu: 16 },

  // Cluster 10: Expanded Metropolitan & Institutional Healthcare Centers
  { name: "National Institute of Tuberculosis and Respiratory Diseases (NITRD)", area: "Sri Aurobindo Marg, Near Qutub Minar", pin: "110030", lat: 28.5250, lng: 77.1950, type: "National Pulmonology Apex", beds: 520, icu: 60 },
  { name: "Army Hospital Research & Referral (AHRR)", area: "Subroto Park, Dhaula Kuan", pin: "110010", lat: 28.5850, lng: 77.1550, type: "Armed Forces Apex Quaternary", beds: 1000, icu: 150 },
  { name: "Base Hospital Delhi Cantt", area: "Delhi Cantonment", pin: "110010", lat: 28.5950, lng: 77.1350, type: "Armed Forces General", beds: 800, icu: 90 },
  { name: "Chacha Nehru Bal Chikitsalaya", area: "Geeta Colony, Delhi", pin: "110031", lat: 28.6520, lng: 77.2720, type: "Autonomous Pediatric Super-specialty", beds: 220, icu: 45 },
  { name: "Institute of Human Behaviour & Allied Sciences (IHBAS)", area: "Dilshad Garden", pin: "110095", lat: 28.6810, lng: 77.3150, type: "National Neuro-Psychiatry Apex", beds: 500, icu: 50 },
  { name: "Delhi State Cancer Institute (DSCI)", area: "GTB Hospital Complex, Dilshad Garden", pin: "110095", lat: 28.6840, lng: 77.3090, type: "State Cancer Apex", beds: 200, icu: 35 },
  { name: "Attaining Peace Medicare", area: "Sector 28, Rohini", pin: "110042", lat: 28.7520, lng: 77.1120, type: "Multi-specialty", beds: 65, icu: 10 },
  { name: "North-West Medanta Care Clinic & Trauma", area: "Sector 9, Rohini", pin: "110085", lat: 28.7110, lng: 77.1290, type: "Specialized Node", beds: 70, icu: 12 },
  { name: "Holy Cross Hospital", area: "Kamla Nagar, North Delhi", pin: "110007", lat: 28.6820, lng: 77.2020, type: "Missionary Hospital", beds: 85, icu: 14 },
  { name: "Sushruta Trauma Centre (Govt of NCT of Delhi)", area: "9, Metcalf Road, Civil Lines", pin: "110054", lat: 28.6790, lng: 77.2280, type: "Government Level-1 Apex Trauma", beds: 150, icu: 40 },
  { name: "Maharaja Surajmal Institute Hospital", area: "Janakpuri", pin: "110058", lat: 28.6270, lng: 77.0910, type: "Multi-specialty", beds: 90, icu: 15 },
  { name: "MGS Hospital", area: "Rohtak Road, West Punjabi Bagh", pin: "110026", lat: 28.6690, lng: 77.1390, type: "Private Super-specialty", beds: 100, icu: 20 },
  { name: "Batra Hospital & Medical Research Centre", area: "1, Tughlakabad Institutional Area, MB Road", pin: "110062", lat: 28.5140, lng: 77.2510, type: "Private Multi-specialty", beds: 495, icu: 80 },
  { name: "Primus Super Speciality Hospital", area: "Chandragupta Marg, Chanakyapuri", pin: "110021", lat: 28.5910, lng: 77.1890, type: "Diplomatic & Ortho Apex", beds: 250, icu: 45 },
  { name: "Vimhans Nayati Super Speciality Hospital", area: "1, Institutional Area, Nehru Nagar", pin: "110065", lat: 28.5710, lng: 77.2540, type: "Neuro & Mental Health Apex", beds: 150, icu: 30 }
];

const doctorFirstNames = [
  "Aarav", "Aditi", "Ajay", "Amit", "Ananya", "Anil", "Anita", "Ankit", "Anshul", "Anuradha",
  "Arjun", "Ashok", "Deepak", "Deepika", "Devendra", "Divya", "Gaurav", "Harish", "Hemant", "Ishaan",
  "Kavita", "Karan", "Manish", "Meenakshi", "Mohit", "Mukesh", "Naveen", "Neha", "Nikhil", "Nitin",
  "Pankaj", "Pooja", "Pradeep", "Prashant", "Praveen", "Priya", "Rahul", "Rajeev", "Rajendra", "Rajesh",
  "Rakesh", "Ramesh", "Rashmi", "Ritu", "Rohan", "Rohit", "Sachin", "Sameer", "Sandeep", "Sangeeta",
  "Sanjay", "Sanjeev", "Santosh", "Sarita", "Satish", "Shailesh", "Shalini", "Shashi", "Shikha", "Shivam",
  "Shreya", "Siddharth", "Smriti", "Sneha", "Subhash", "Sudhir", "Sumit", "Sunil", "Sunita", "Suresh",
  "Surya", "Swati", "Tarun", "Umesh", "Varun", "Vikas", "Vikram", "Vinay", "Vinod", "Virendra",
  "Vivek", "Yash", "Yogesh", "Abhishek", "Alok", "Amrita", "Archana", "Bharat", "Bhavna", "Chirag"
];

const doctorLastNames = [
  "Sharma", "Verma", "Gupta", "Malhotra", "Kapoor", "Bhatia", "Bhardwaj", "Aggarwal", "Mittal", "Chopra",
  "Singhal", "Garg", "Jain", "Bansal", "Mehta", "Saxena", "Srivastava", "Chawla", "Dua", "Grover",
  "Khanna", "Sethi", "Arora", "Khurana", "Dhawan", "Tandon", "Kashyap", "Pandey", "Tripathi", "Mishra",
  "Dubey", "Shukla", "Tiwari", "Yadav", "Singh", "Chauhan", "Tomar", "Rathi", "Dahiya", "Kadyan",
  "Rana", "Malik", "Sehrawat", "Dabas", "Solanki", "Khatri", "Mann", "Chhikara", "Mathur", "Rawat"
];

const medicalSpecialties = [
  { dept: "Emergency & Trauma", degrees: ["MBBS, MD (Emergency Medicine)", "MBBS, MS (Trauma Surgery)"], roles: ["Chief Trauma Specialist", "Emergency Care Lead", "Consultant Emergency Physician"] },
  { dept: "Cardiology", degrees: ["MBBS, MD (Medicine), DM (Cardiology)", "MBBS, MD, DNB (Cardiology)"], roles: ["Senior Interventional Cardiologist", "Consultant Cardiologist", "Director Cardiac Catheterization"] },
  { dept: "Orthopedics & Joint Replacement", degrees: ["MBBS, MS (Orthopedics)", "MBBS, DNB (Ortho), MCh (Ortho)"], roles: ["Senior Orthopedic Surgeon", "Consultant Trauma & Arthroscopy", "Lead Spine Surgeon"] },
  { dept: "ICU & Critical Care", degrees: ["MBBS, MD (Anesthesia), IDCCM", "MBBS, MD, FNB (Critical Care)"], roles: ["Head Critical Care Medicine", "Senior Intensivist", "Consultant ICU Specialist"] },
  { dept: "Neurology & Neurosurgery", degrees: ["MBBS, MS, MCh (Neurosurgery)", "MBBS, MD, DM (Neurology)"], roles: ["Senior Consultant Neurosurgeon", "Director Stroke & Neurocare", "Consultant Neurologist"] },
  { dept: "General & Laparoscopic Surgery", degrees: ["MBBS, MS (General Surgery)", "MBBS, MS, FMAS, FIAGES"], roles: ["Chief Laparoscopic Surgeon", "Consultant General Surgeon", "Senior Surgical Specialist"] },
  { dept: "Pediatrics & Neonatology", degrees: ["MBBS, MD (Pediatrics)", "MBBS, DNB (Pediatrics), Fellowship Neonatology"], roles: ["Head Pediatric Intensive Care", "Senior Consultant Pediatrician", "Consultant Neonatologist"] },
  { dept: "Pulmonology & Respiratory Care", degrees: ["MBBS, MD (Pulmonary Medicine)", "MBBS, MD (TBRD), DNB (Respiratory)"], roles: ["Director Pulmonology & Sleep Medicine", "Senior Pulmonologist", "Consultant Chest Specialist"] },
  { dept: "Nephrology & Dialysis", degrees: ["MBBS, MD, DM (Nephrology)", "MBBS, DNB (Nephrology)"], roles: ["Chief Nephrologist & Transplant Specialist", "Consultant Renal Physician", "Lead Dialysis Unit"] },
  { dept: "Obstetrics & Gynecology", degrees: ["MBBS, MS (OB-GYN)", "MBBS, DGO, DNB (OBG)"], roles: ["Senior Obstetrician & Gynecologist", "Consultant High-Risk Pregnancy", "Lead Fetal Medicine"] },
  { dept: "Anesthesiology & Pain Management", degrees: ["MBBS, MD (Anesthesiology)", "MBBS, DA, DNB (Anesthesia)"], roles: ["Chief Anesthesiologist", "Consultant Onco-Anesthesia", "Interventional Pain Specialist"] },
  { dept: "Radiology & Imaging", degrees: ["MBBS, MD (Radiodiagnosis)", "MBBS, DMRD, DNB (Radiology)"], roles: ["Chief Radiologist", "Interventional Radiologist", "Consultant MRI & CT Specialist"] }
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function generateDataset() {
  const hospitals = [];
  const doctors = [];
  const adminCredentials = [];
  const doctorCredentials = [];
  const bloodInventories = [];

  let doctorCounter = 1001;

  hospitalTemplates.forEach((template, hIndex) => {
    const hospId = `HOSP-DL-${String(hIndex + 1).padStart(3, '0')}`;
    const hospCode = `DEL-HSP-${String(100 + hIndex + 1)}`;
    const regId = `REG-DL-HOSP-${String(hIndex + 1).padStart(4, '0')}`;
    
    // Pick clean slug from name
    const cleanSlug = template.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);
    
    const adminEmail = `admin.${cleanSlug}@ekawach.health`;
    const adminCode = `ADM-${hospCode}`;

    const contactER = `+91 11 27${String(100000 + (hIndex * 873) % 899999).padStart(6, '0')}`;
    const helpline = `1800-11-${String(1000 + (hIndex * 19) % 8999)}`;
    const ambulance = "108";

    // Dynamic bed calculation
    const icuOccupied = Math.floor(template.icu * (0.65 + (hIndex % 5) * 0.06));
    const wardOccupied = Math.floor(template.beds * (0.60 + (hIndex % 7) * 0.05));
    const ventTotal = Math.floor(template.icu * 0.6);
    const ventOccupied = Math.floor(ventTotal * 0.75);

    // Selected departments for this hospital
    const depts = [
      "Emergency & Trauma",
      "ICU & Critical Care",
      "Cardiology",
      "Orthopedics & Joint Replacement",
      "General & Laparoscopic Surgery",
      "Pulmonology & Respiratory Care",
      "Pediatrics & Neonatology",
      "Neurology & Neurosurgery",
      "Nephrology & Dialysis",
      "Anesthesiology & Pain Management"
    ];

    const hospitalRecord = {
      id: hospId,
      registration_id: regId,
      name: template.name,
      code: hospCode,
      type: template.type,
      category: template.type.includes("Government") ? "GOVERNMENT" : template.type.includes("Trust") ? "TRUST" : "PRIVATE",
      address: template.area,
      city: "Delhi",
      state: "Delhi",
      pinCode: template.pin,
      geoLat: template.lat,
      geoLng: template.lng,
      distanceFromNITDelhiKm: (Math.hypot((template.lat - 28.8530) * 111, (template.lng - 77.0940) * 102)).toFixed(1),
      departments: depts,
      contactNumbers: { er: contactER, helpline: helpline, ambulance: ambulance },
      icuBedsTotal: template.icu,
      icuBedsOccupied: icuOccupied,
      icuBedsAvailable: template.icu - icuOccupied,
      ventilatorsTotal: ventTotal,
      ventilatorsOccupied: ventOccupied,
      ventilatorsAvailable: ventTotal - ventOccupied,
      wardBedsTotal: template.beds,
      wardBedsOccupied: wardOccupied,
      wardBedsAvailable: template.beds - wardOccupied,
      oxygenSupplyStatus: "99.4% Liquid O2 Bulk Plant Operational",
      traumaLevel: template.icu >= 50 ? "LEVEL-1 APEX TRAUMA" : template.icu >= 25 ? "LEVEL-2 ADVANCED TRAUMA" : "LEVEL-3 COMMUNITY TRAUMA",
      adminProfile: {
        adminName: `Dr. ${doctorFirstNames[hIndex % doctorFirstNames.length]} ${doctorLastNames[(hIndex + 3) % doctorLastNames.length]} (Medical Superintendent)`,
        email: adminEmail,
        adminCode: adminCode,
        password: "password123",
        role: "hospital"
      },
      status: "ACTIVE"
    };

    hospitals.push(hospitalRecord);

    adminCredentials.push({
      hospitalIndex: hIndex + 1,
      hospitalName: template.name,
      hospitalCode: hospCode,
      registrationId: regId,
      pinCode: template.pin,
      distanceFromNITDelhi: `${hospitalRecord.distanceFromNITDelhiKm} km`,
      adminName: hospitalRecord.adminProfile.adminName,
      loginIdentifier: adminEmail,
      alternativeIdentifier: adminCode,
      password: "password123",
      role: "hospital"
    });

    // Generate 12 to 16 Doctors for each hospital
    const numDoctors = 12 + (hIndex % 5); // 12, 13, 14, 15, or 16 doctors
    const hospitalDoctorList = [];

    for (let d = 0; d < numDoctors; d++) {
      const docId = `DOC-DL-${doctorCounter}`;
      const docRegId = `DMC-${String(20000 + doctorCounter)}`;
      const firstName = doctorFirstNames[(hIndex * 7 + d * 3) % doctorFirstNames.length];
      const lastName = doctorLastNames[(hIndex * 5 + d * 2) % doctorLastNames.length];
      const fullName = `Dr. ${firstName} ${lastName}`;
      const spec = medicalSpecialties[d % medicalSpecialties.length];
      const degree = spec.degrees[d % spec.degrees.length];
      const designation = spec.roles[d % spec.roles.length];
      const docEmail = `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${hIndex + 1}@ekawach.health`;
      const docPhone = `+91 98${String(10000000 + (doctorCounter * 491) % 89999999)}`;
      const expYears = 6 + ((hIndex + d) % 22);

      const doctorRecord = {
        id: docId,
        registration_id: docRegId,
        hospitalId: hospId,
        hospitalName: template.name,
        name: fullName,
        email: docEmail,
        phone: docPhone,
        department: spec.dept,
        specialization: spec.dept,
        designation: designation,
        qualification: degree,
        experienceYears: expYears,
        delhiMedicalCouncilReg: docRegId,
        opdRoom: `OPD-${100 + (d * 3) % 80}`,
        shiftTiming: d % 3 === 0 ? "08:00 AM - 02:00 PM" : d % 3 === 1 ? "02:00 PM - 08:00 PM" : "08:00 PM - 08:00 AM (Emergency On-Call)",
        consultationFee: template.type.includes("Government") ? 0 : 500 + (expYears * 40),
        rating: (4.4 + ((hIndex + d) % 6) * 0.1).toFixed(1),
        status: "ACTIVE",
        credentials: {
          loginIdentifier: docEmail,
          alternativeIdentifier: docRegId,
          password: "password123",
          role: "doctor"
        }
      };

      doctors.push(doctorRecord);
      hospitalDoctorList.push(doctorRecord);

      doctorCredentials.push({
        doctorName: fullName,
        hospitalName: template.name,
        department: spec.dept,
        designation: designation,
        email: docEmail,
        dmcRegistrationNo: docRegId,
        password: "password123",
        role: "doctor"
      });

      doctorCounter++;
    }

    // Blood bank inventory for this hospital
    const bloodStock = {};
    bloodGroups.forEach((bg, bgIdx) => {
      bloodStock[bg] = {
        unitsAvailable: 15 + ((hIndex * 3 + bgIdx * 5) % 60),
        status: (15 + ((hIndex * 3 + bgIdx * 5) % 60)) < 20 ? "LOW_RESERVE" : "STABLE"
      };
    });

    bloodInventories.push({
      hospitalId: hospId,
      hospitalName: template.name,
      pinCode: template.pin,
      inventory: bloodStock,
      lastAudited: "2026-09-12 18:30 IST"
    });
  });

  return {
    totalHospitals: hospitals.length,
    totalDoctors: doctors.length,
    referenceCenter: "NIT Delhi Campus, Plot No. FA-1, Zone P1, GT Karnal Road, Narela, Delhi 110040",
    hospitals,
    doctors,
    adminCredentials,
    doctorCredentials,
    bloodInventories
  };
}

const dataset = generateDataset();

const outputPath = path.join(__dirname, 'delhi_hospitals_100.json');
fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2), 'utf8');
console.log(`Successfully created Delhi 100 Hospitals Dataset with ${dataset.totalHospitals} hospitals and ${dataset.totalDoctors} doctors at ${outputPath}`);
