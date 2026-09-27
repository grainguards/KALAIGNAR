export const MOCK_ARTISANS = [
  { id: '1', name: 'Daksh Sharma', craft: 'Pottery', state: 'Rajasthan', verified: true, score: 710 },
  { id: '2', name: 'Abdul Khatri', craft: 'Block Printing', state: 'Gujarat', verified: true, score: 820 },
  { id: '3', name: 'Sujata Weavers', craft: 'Silk Weaving', state: 'Tamil Nadu', verified: false, score: 640 },
  { id: '4', name: 'Ramesh Kumawat', craft: 'Terracotta', state: 'Rajasthan', verified: true, score: 780 }
];

export const MOCK_ORDERS = [
  { id: 'ORD-2901', status: 'IN_PRODUCTION', artisan: 'Ramesh Kumawat', item: 'Terracotta Planters', qty: 200, date: '14 Nov 2026' },
  { id: 'ORD-2855', status: 'SHIPPED', artisan: 'Sujata Weavers', item: 'Ikat Silk Sarees', qty: 50, date: '02 Nov 2026' },
  { id: 'ORD-2710', status: 'DELIVERED', artisan: 'Abdul Khatri', item: 'Ajrakh Block Print Fabric', qty: 1000, date: '15 Oct 2026' },
];

export const MOCK_GOVT_ORDERS = [
  { id: 'GOV-2026-A', title: 'Republic Day Parade Decor', dept: 'Ministry of Culture', value: '₹14,50,000', status: 'IN_PROGRESS' },
  { id: 'GOV-2026-B', title: 'International Summit Gifts', dept: 'Ministry of External Affairs', value: '₹32,00,000', status: 'SOURCING' },
  { id: 'GOV-2026-C', title: 'State Guest House Furnishings', dept: 'Tourism Board', value: '₹8,40,000', status: 'COMPLETED' },
];
