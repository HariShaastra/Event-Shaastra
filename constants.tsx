
import React from 'react';

export const EVENT_TYPES = [
  'Wedding/ Engagement',
  'Birthday',
  'Pooja',
  'Housewarming/ Grihapravesh',
  'Corporate',
  'Festival',
  'Family function',
  'Friends get together',
  'Other'
];

export const VENUE_TYPES = [
  { value: 'home', label: 'Individual House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hall', label: 'Community Hall' },
  { value: 'auditorium', label: 'Auditorium' },
  { value: 'online', label: 'Online' },
  { value: 'office', label: 'Office' },
  { value: 'others', label: 'Other' }
];

export const EVENT_TEMPLATES: Record<string, any> = {
  'Wedding/ Engagement': {
    decor: ['Floral Mandap', 'Entrance Arch', 'Stage Backdrop', 'Aisle Runners', 'LED Ambient Lighting', 'Seating Name Cards'],
    food: ['Traditional Thali', 'Live Chaat Counter', 'Sweet Stall', 'Mocktail Bar', 'Regional Specialty Main', 'Artisanal Coffee'],
    supplies: ['Pooja Samagri', 'Return Gifts', 'Garlands', 'Seating Cards', 'Envelopes', 'Safety Pins', 'First Aid Kit'],
    suggestion: 'Human behavior studies show guests value comfort over complexity. Ensure ample seating and clear signage for rituals. Morning ceremonies often lead to 20% higher guest engagement in traditional settings.'
  },
  'Birthday': {
    decor: ['Balloon Arch', 'Theme Banner', 'Table Centerpieces', 'Photo Booth', 'Custom Cutouts', 'Fairy Lights'],
    food: ['Cake', 'Finger Foods', 'Pasta Station', 'Ice Cream Sundae', 'Mini Sliders', 'Fruit Punch'],
    supplies: ['Party Hats', 'Goodie Bags', 'Candles', 'Balloons', 'Cake Knife', 'Paper Plates', 'Tissue Boxes'],
    suggestion: 'For children birthdays, peak energy levels are usually 1 hour after start. Schedule the cake cutting then. Adults appreciate a quiet "retreat" zone away from the main noise.'
  },
  'Pooja': {
    decor: ['Marigold Hangings', 'Rangoli', 'Brass Lamps', 'Banana Leaves', 'Incense Holders', 'Traditional Fabric Drapes'],
    food: ['Prasadam', 'Sattvic Lunch', 'Panakam', 'Fruit Salad', 'Curd Rice', 'Traditional Sweets'],
    supplies: ['Incense Sticks', 'Camphor', 'Flowers', 'Coconuts', 'Matchbox', 'Ghee', 'Cotton Wicks'],
    suggestion: 'Psychologically, a clean and fragrant environment enhances spiritual focus. Use natural marigolds and sandalwood incense. Ensure the priest has a comfortable, elevated seating area.'
  },
  'Housewarming/ Grihapravesh': {
    decor: ['Mango Leaf Toran', 'Floral Rangoli', 'Traditional Lamps', 'Wall Hangings', 'Entrance Bell', 'Fresh Flower Garlands'],
    food: ['Traditional Lunch', 'Sweets', 'Coffee/Tea', 'Snacks', 'Regional Delicacy', 'Buttermilk'],
    supplies: ['Milk for Boiling', 'New Vessel', 'Pooja Kit', 'Gifts for Guests', 'Sugar', 'Turmeric', 'Kumkum'],
    suggestion: 'Guests often feel awkward in new spaces. A guided "mini-tour" or a small card explaining the house features makes them feel more welcome and connected to your new journey.'
  },
  'Corporate': {
    decor: ['Brand Banners', 'Minimalist Centerpieces', 'Professional Lighting', 'Directional Signage', 'Digital Displays'],
    food: ['Gourmet Buffet', 'Coffee Station', 'Assorted Sandwiches', 'Healthy Salads', 'Energy Bars', 'Infused Water'],
    supplies: ['ID Badges', 'Notepads', 'Pens', 'Projector Kit', 'Business Cards', 'Feedback Forms'],
    suggestion: 'Networking is the primary goal for 70% of attendees. Use "standing tables" to encourage movement. Ensure high-speed Wi-Fi and ample charging stations are clearly marked.'
  }
};

export const COLORS = {
  primary: '#1e3a3a', 
  secondary: '#d4af37', 
  accent: '#e67e22', 
  background: '#fcfbf7' 
};

export const Icons = {
  Marigold: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="#e67e22" />
    </svg>
  )
};
