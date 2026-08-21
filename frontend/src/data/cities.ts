export interface CityHub {
  name: string;
  state: string;
  coords: [number, number];
  tier: 1 | 2 | 3;
  region: 'North' | 'South' | 'West' | 'East' | 'Central' | 'North-East';
}

export const PAN_INDIA_CITIES: CityHub[] = [
  // North
  { name: "Delhi NCR", state: "Delhi", coords: [28.6139, 77.2090], tier: 1, region: "North" },
  { name: "Noida", state: "Uttar Pradesh", coords: [28.5355, 77.3910], tier: 2, region: "North" },
  { name: "Gurugram", state: "Haryana", coords: [28.4595, 77.0266], tier: 2, region: "North" },
  { name: "Faridabad", state: "Haryana", coords: [28.4089, 77.3178], tier: 2, region: "North" },
  { name: "Ghaziabad", state: "Uttar Pradesh", coords: [28.6692, 77.4538], tier: 2, region: "North" },
  { name: "Jaipur", state: "Rajasthan", coords: [26.9124, 75.7873], tier: 2, region: "North" },
  { name: "Jodhpur", state: "Rajasthan", coords: [26.2389, 73.0243], tier: 2, region: "North" },
  { name: "Udaipur", state: "Rajasthan", coords: [24.5854, 73.7125], tier: 3, region: "North" },
  { name: "Kota", state: "Rajasthan", coords: [25.2138, 75.8648], tier: 2, region: "North" },
  { name: "Chandigarh", state: "Chandigarh", coords: [30.7333, 76.7794], tier: 2, region: "North" },
  { name: "Ludhiana", state: "Punjab", coords: [30.9010, 75.8573], tier: 2, region: "North" },
  { name: "Amritsar", state: "Punjab", coords: [31.6340, 74.8723], tier: 2, region: "North" },
  { name: "Jalandhar", state: "Punjab", coords: [31.3260, 75.5762], tier: 2, region: "North" },
  { name: "Lucknow", state: "Uttar Pradesh", coords: [26.8467, 80.9462], tier: 2, region: "North" },
  { name: "Kanpur", state: "Uttar Pradesh", coords: [26.4499, 80.3319], tier: 2, region: "North" },
  { name: "Varanasi", state: "Uttar Pradesh", coords: [25.3176, 82.9739], tier: 2, region: "North" },
  { name: "Agra", state: "Uttar Pradesh", coords: [27.1767, 78.0081], tier: 2, region: "North" },
  { name: "Prayagraj", state: "Uttar Pradesh", coords: [25.4358, 81.8463], tier: 2, region: "North" },
  { name: "Meerut", state: "Uttar Pradesh", coords: [28.9845, 77.7064], tier: 2, region: "North" },
  { name: "Dehradun", state: "Uttarakhand", coords: [30.3165, 78.0322], tier: 2, region: "North" },
  { name: "Haridwar", state: "Uttarakhand", coords: [29.9457, 78.1642], tier: 3, region: "North" },
  { name: "Shimla", state: "Himachal Pradesh", coords: [31.1048, 77.1734], tier: 3, region: "North" },
  { name: "Jammu", state: "Jammu & Kashmir", coords: [32.7266, 74.8570], tier: 2, region: "North" },
  { name: "Srinagar", state: "Jammu & Kashmir", coords: [34.0837, 74.7973], tier: 2, region: "North" },

  // West
  { name: "Mumbai", state: "Maharashtra", coords: [19.0760, 72.8777], tier: 1, region: "West" },
  { name: "Navi Mumbai", state: "Maharashtra", coords: [19.0330, 73.0297], tier: 2, region: "West" },
  { name: "Thane", state: "Maharashtra", coords: [19.2183, 72.9781], tier: 2, region: "West" },
  { name: "Pune", state: "Maharashtra", coords: [18.5204, 73.8567], tier: 1, region: "West" },
  { name: "Nagpur", state: "Maharashtra", coords: [21.1458, 79.0882], tier: 2, region: "West" },
  { name: "Nashik", state: "Maharashtra", coords: [19.9975, 73.7898], tier: 2, region: "West" },
  { name: "Aurangabad", state: "Maharashtra", coords: [19.8762, 75.3433], tier: 2, region: "West" },
  { name: "Kolhapur", state: "Maharashtra", coords: [16.7050, 74.2433], tier: 3, region: "West" },
  { name: "Ahmedabad", state: "Gujarat", coords: [23.0225, 72.5714], tier: 1, region: "West" },
  { name: "Surat", state: "Gujarat", coords: [21.1702, 72.8311], tier: 2, region: "West" },
  { name: "Vadodara", state: "Gujarat", coords: [22.3072, 73.1812], tier: 2, region: "West" },
  { name: "Rajkot", state: "Gujarat", coords: [22.3039, 70.8022], tier: 2, region: "West" },
  { name: "Indore", state: "Madhya Pradesh", coords: [22.7196, 75.8577], tier: 2, region: "West" },
  { name: "Bhopal", state: "Madhya Pradesh", coords: [23.2599, 77.4126], tier: 2, region: "West" },
  { name: "Gwalior", state: "Madhya Pradesh", coords: [26.2183, 78.1828], tier: 2, region: "West" },
  { name: "Jabalpur", state: "Madhya Pradesh", coords: [23.1815, 79.9864], tier: 2, region: "West" },
  { name: "Panaji (Goa)", state: "Goa", coords: [15.4909, 73.8278], tier: 3, region: "West" },

  // South
  { name: "Bengaluru", state: "Karnataka", coords: [12.9716, 77.5946], tier: 1, region: "South" },
  { name: "Mysuru", state: "Karnataka", coords: [12.2958, 76.6394], tier: 2, region: "South" },
  { name: "Hubballi", state: "Karnataka", coords: [15.3647, 75.1240], tier: 2, region: "South" },
  { name: "Mangaluru", state: "Karnataka", coords: [12.9141, 74.8560], tier: 2, region: "South" },
  { name: "Chennai", state: "Tamil Nadu", coords: [13.0827, 80.2707], tier: 1, region: "South" },
  { name: "Coimbatore", state: "Tamil Nadu", coords: [11.0168, 76.9558], tier: 2, region: "South" },
  { name: "Madurai", state: "Tamil Nadu", coords: [9.9252, 78.1198], tier: 2, region: "South" },
  { name: "Salem", state: "Tamil Nadu", coords: [11.6643, 78.1460], tier: 2, region: "South" },
  { name: "Tiruppur", state: "Tamil Nadu", coords: [11.1085, 77.3411], tier: 2, region: "South" },
  { name: "Hyderabad", state: "Telangana", coords: [17.3850, 78.4867], tier: 1, region: "South" },
  { name: "Warangal", state: "Telangana", coords: [17.9689, 79.5941], tier: 3, region: "South" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", coords: [17.6868, 83.2185], tier: 2, region: "South" },
  { name: "Vijayawada", state: "Andhra Pradesh", coords: [16.5062, 80.6480], tier: 2, region: "South" },
  { name: "Kochi", state: "Kerala", coords: [9.9312, 76.2673], tier: 2, region: "South" },
  { name: "Thiruvananthapuram", state: "Kerala", coords: [8.5241, 76.9366], tier: 2, region: "South" },
  { name: "Kozhikode", state: "Kerala", coords: [11.2588, 75.7804], tier: 2, region: "South" },

  // East & Central (Bihar & Neighboring States)
  { name: "Patna", state: "Bihar", coords: [25.5941, 85.1376], tier: 2, region: "East" },
  { name: "Muzaffarpur", state: "Bihar", coords: [26.1209, 85.3647], tier: 2, region: "East" },
  { name: "Darbhanga", state: "Bihar", coords: [26.1542, 85.8918], tier: 2, region: "East" },
  { name: "Samastipur", state: "Bihar", coords: [25.8630, 85.7810], tier: 3, region: "East" },
  { name: "Madhubani", state: "Bihar", coords: [26.3549, 86.0717], tier: 3, region: "East" },
  { name: "Begusarai", state: "Bihar", coords: [25.4182, 86.1272], tier: 3, region: "East" },
  { name: "Purnea", state: "Bihar", coords: [25.7771, 87.4753], tier: 3, region: "East" },
  { name: "Bhagalpur", state: "Bihar", coords: [25.2425, 86.9842], tier: 2, region: "East" },
  { name: "Gaya", state: "Bihar", coords: [24.7914, 85.0002], tier: 2, region: "East" },
  { name: "Hajipur", state: "Bihar", coords: [25.6858, 85.2146], tier: 3, region: "East" },
  { name: "Motihari", state: "Bihar", coords: [26.6470, 84.9089], tier: 3, region: "East" },
  { name: "Siwan", state: "Bihar", coords: [26.2196, 84.3567], tier: 3, region: "East" },
  { name: "Kolkata", state: "West Bengal", coords: [22.5726, 88.3639], tier: 1, region: "East" },
  { name: "Howrah", state: "West Bengal", coords: [22.5958, 88.2636], tier: 2, region: "East" },
  { name: "Siliguri", state: "West Bengal", coords: [26.7271, 88.3953], tier: 2, region: "East" },
  { name: "Asansol", state: "West Bengal", coords: [23.6739, 86.9524], tier: 2, region: "East" },
  { name: "Durgapur", state: "West Bengal", coords: [23.5204, 87.3119], tier: 2, region: "East" },
  { name: "Ranchi", state: "Jharkhand", coords: [23.3441, 85.3096], tier: 2, region: "East" },
  { name: "Jamshedpur", state: "Jharkhand", coords: [22.8046, 86.2029], tier: 2, region: "East" },
  { name: "Dhanbad", state: "Jharkhand", coords: [23.7957, 86.4304], tier: 2, region: "East" },
  { name: "Bokaro", state: "Jharkhand", coords: [23.6693, 86.1511], tier: 3, region: "East" },
  { name: "Raipur", state: "Chhattisgarh", coords: [21.2514, 81.6296], tier: 2, region: "Central" },
  { name: "Bilaspur", state: "Chhattisgarh", coords: [22.0796, 82.1391], tier: 3, region: "Central" },
  { name: "Durg-Bhilai", state: "Chhattisgarh", coords: [21.1904, 81.2849], tier: 2, region: "Central" },
  { name: "Bhubaneswar", state: "Odisha", coords: [20.2961, 85.8245], tier: 2, region: "East" },
  { name: "Cuttack", state: "Odisha", coords: [20.4625, 85.8828], tier: 2, region: "East" },
  { name: "Rourkela", state: "Odisha", coords: [22.2604, 84.8536], tier: 3, region: "East" },

  // North-East
  { name: "Guwahati", state: "Assam", coords: [26.1445, 91.7362], tier: 2, region: "North-East" },
  { name: "Silchar", state: "Assam", coords: [24.8333, 92.7789], tier: 3, region: "North-East" },
  { name: "Dibrugarh", state: "Assam", coords: [27.4728, 94.9120], tier: 3, region: "North-East" },
  { name: "Jorhat", state: "Assam", coords: [26.7509, 94.2037], tier: 3, region: "North-East" },
  { name: "Shillong", state: "Meghalaya", coords: [25.5788, 91.8933], tier: 3, region: "North-East" },
  { name: "Agartala", state: "Tripura", coords: [23.8315, 91.2868], tier: 3, region: "North-East" },
  { name: "Imphal", state: "Manipur", coords: [24.8170, 93.9368], tier: 3, region: "North-East" },
  { name: "Dimapur", state: "Nagaland", coords: [25.9095, 93.7266], tier: 3, region: "North-East" },
  { name: "Gangtok", state: "Sikkim", coords: [27.3314, 88.6138], tier: 3, region: "North-East" }
];

export function findCity(name: string): CityHub | undefined {
  return PAN_INDIA_CITIES.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
}

export function searchCities(query: string): CityHub[] {
  if (!query || query.trim() === '') return PAN_INDIA_CITIES;
  const q = query.toLowerCase().trim();
  return PAN_INDIA_CITIES.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.state.toLowerCase().includes(q) ||
    c.region.toLowerCase().includes(q)
  );
}
