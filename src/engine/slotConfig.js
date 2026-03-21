export const REELS = 5;
export const VISIBLE_ROWS = 3;

// Pembobotan (Weight) yang menentukan probabilitas asli
export const SYMBOLS = [
  { id: 1, name: 'Wild', image_url: 'https://cdn-icons-png.flaticon.com/512/3662/3662817.png', weight: 5 },
  { id: 2, name: 'Scatter', image_url: 'https://cdn-icons-png.flaticon.com/512/5842/5842068.png', weight: 12 },
  { id: 3, name: 'Red Dragon', image_url: 'https://cdn-icons-png.flaticon.com/512/3069/3069172.png', weight: 35 },
  { id: 4, name: 'Green Dragon', image_url: 'https://cdn-icons-png.flaticon.com/512/3069/3069186.png', weight: 45 },
  { id: 5, name: 'Golden Tile', image_url: 'https://cdn-icons-png.flaticon.com/512/138/138292.png', weight: 60 },
  { id: 6, name: 'Bamboo 1', image_url: 'https://cdn-icons-png.flaticon.com/512/287/287226.png', weight: 90 },
  { id: 7, name: 'Circle 1', image_url: 'https://cdn-icons-png.flaticon.com/512/1042/1042352.png', weight: 120 },
];

// Paylines (5 Garis)
export const PAYLINES = [
  { id: 0, label: 'Top', color: '#f59e0b', coords: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
  { id: 1, label: 'Middle', color: '#22c55e', coords: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]] },
  { id: 2, label: 'Bottom', color: '#3b82f6', coords: [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]] },
  { id: 3, label: 'V', color: '#a855f7', coords: [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]] },
  { id: 4, label: 'Inv-V', color: '#ef4444', coords: [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]] },
];

// Paytable Bersih & Terstruktur
export const PAYTABLE = {
  'Wild': { 3: 15, 4: 50, 5: 250 },
  'Red Dragon': { 3: 8, 4: 25, 5: 100 },
  'Green Dragon': { 3: 5, 4: 15, 5: 60 },
  'Golden Tile': { 3: 3, 4: 10, 5: 40 },
  'Bamboo 1': { 3: 2, 4: 6, 5: 20 },
  'Circle 1': { 3: 1, 4: 3, 5: 10 },
};

// Scatter Payout (Multipliers)
export const SCATTER_PAY = {
  3: 5,   // 3 Scatter = 5x Bet
  4: 20,  // 4 Scatter = 20x Bet
  5: 100  // 5 Scatter = 100x Bet
};