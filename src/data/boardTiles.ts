import { Tile } from '../types/game';

export const INITIAL_BOARD_TILES: Tile[] = [
  // 0: START
  {
    index: 0,
    name: 'START',
    type: 'start',
    price: 0,
    rent: [200],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 1: Greece
  {
    index: 1,
    name: 'Greece',
    countryCode: 'gr',
    flag: '🇬🇷',
    type: 'property',
    group: 'brown',
    price: 60,
    rent: [2, 10, 30, 90, 160, 250],
    houseCost: 50,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 30
  },
  // 2: Community Chest
  {
    index: 2,
    name: 'Community Chest',
    type: 'chest',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 3: Cyprus
  {
    index: 3,
    name: 'Cyprus',
    countryCode: 'cy',
    flag: '🇨🇾',
    type: 'property',
    group: 'brown',
    price: 60,
    rent: [4, 20, 60, 180, 320, 450],
    houseCost: 50,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 30
  },
  // 4: Income Tax
  {
    index: 4,
    name: 'Income Tax',
    type: 'tax',
    price: 200,
    rent: [200],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 5: Heathrow Airport
  {
    index: 5,
    name: 'Heathrow Airport',
    flag: '✈️',
    type: 'railroad',
    group: 'station',
    price: 200,
    rent: [25, 50, 100, 200],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 100
  },
  // 6: Italy
  {
    index: 6,
    name: 'Italy',
    countryCode: 'it',
    flag: '🇮🇹',
    type: 'property',
    group: 'light_blue',
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 50
  },
  // 7: Chance
  {
    index: 7,
    name: 'Chance',
    type: 'chance',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 8: Spain
  {
    index: 8,
    name: 'Spain',
    countryCode: 'es',
    flag: '🇪🇸',
    type: 'property',
    group: 'light_blue',
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 50
  },
  // 9: Portugal
  {
    index: 9,
    name: 'Portugal',
    countryCode: 'pt',
    flag: '🇵🇹',
    type: 'property',
    group: 'light_blue',
    price: 120,
    rent: [8, 40, 100, 300, 450, 600],
    houseCost: 50,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 60
  },
  // 10: JAIL
  {
    index: 10,
    name: 'In Jail / Visiting',
    type: 'jail',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 11: Mexico
  {
    index: 11,
    name: 'Mexico',
    countryCode: 'mx',
    flag: '🇲🇽',
    type: 'property',
    group: 'pink',
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 70
  },
  // 12: Clean Energy
  {
    index: 12,
    name: 'Clean Energy',
    flag: '⚡',
    type: 'utility',
    group: 'utility',
    price: 150,
    rent: [4, 10],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 75
  },
  // 13: Argentina
  {
    index: 13,
    name: 'Argentina',
    countryCode: 'ar',
    flag: '🇦🇷',
    type: 'property',
    group: 'pink',
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 70
  },
  // 14: Brazil
  {
    index: 14,
    name: 'Brazil',
    countryCode: 'br',
    flag: '🇧🇷',
    type: 'property',
    group: 'pink',
    price: 160,
    rent: [12, 60, 180, 500, 700, 900],
    houseCost: 100,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 80
  },
  // 15: Tokyo Haneda Airport
  {
    index: 15,
    name: 'Tokyo Haneda',
    flag: '✈️',
    type: 'railroad',
    group: 'station',
    price: 200,
    rent: [25, 50, 100, 200],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 100
  },
  // 16: Netherlands
  {
    index: 16,
    name: 'Netherlands',
    countryCode: 'nl',
    flag: '🇳🇱',
    type: 'property',
    group: 'orange',
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 90
  },
  // 17: Community Chest
  {
    index: 17,
    name: 'Community Chest',
    type: 'chest',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 18: Belgium
  {
    index: 18,
    name: 'Belgium',
    countryCode: 'be',
    flag: '🇧🇪',
    type: 'property',
    group: 'orange',
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 90
  },
  // 19: Germany
  {
    index: 19,
    name: 'Germany',
    countryCode: 'de',
    flag: '🇩🇪',
    type: 'property',
    group: 'orange',
    price: 200,
    rent: [16, 80, 220, 600, 800, 1000],
    houseCost: 100,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 100
  },
  // 20: VACATION
  {
    index: 20,
    name: 'Vacation',
    type: 'vacation',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 21: Switzerland
  {
    index: 21,
    name: 'Switzerland',
    countryCode: 'ch',
    flag: '🇨🇭',
    type: 'property',
    group: 'red',
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 110
  },
  // 22: Chance
  {
    index: 22,
    name: 'Chance',
    type: 'chance',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 23: Austria
  {
    index: 23,
    name: 'Austria',
    countryCode: 'at',
    flag: '🇦🇹',
    type: 'property',
    group: 'red',
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 110
  },
  // 24: France
  {
    index: 24,
    name: 'France',
    countryCode: 'fr',
    flag: '🇫🇷',
    type: 'property',
    group: 'red',
    price: 240,
    rent: [20, 100, 300, 750, 925, 1100],
    houseCost: 150,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 120
  },
  // 25: Paris CDG Airport
  {
    index: 25,
    name: 'Paris CDG',
    flag: '✈️',
    type: 'railroad',
    group: 'station',
    price: 200,
    rent: [25, 50, 100, 200],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 100
  },
  // 26: Sweden
  {
    index: 26,
    name: 'Sweden',
    countryCode: 'se',
    flag: '🇸🇪',
    type: 'property',
    group: 'yellow',
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 130
  },
  // 27: Norway
  {
    index: 27,
    name: 'Norway',
    countryCode: 'no',
    flag: '🇳🇴',
    type: 'property',
    group: 'yellow',
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 130
  },
  // 28: Water Supply
  {
    index: 28,
    name: 'Water Supply',
    flag: '💧',
    type: 'utility',
    group: 'utility',
    price: 150,
    rent: [4, 10],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 75
  },
  // 29: Denmark
  {
    index: 29,
    name: 'Denmark',
    countryCode: 'dk',
    flag: '🇩🇰',
    type: 'property',
    group: 'yellow',
    price: 280,
    rent: [24, 120, 360, 850, 1025, 1200],
    houseCost: 150,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 140
  },
  // 30: GO TO JAIL
  {
    index: 30,
    name: 'Go to Jail',
    type: 'go_to_jail',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 31: Japan
  {
    index: 31,
    name: 'Japan',
    countryCode: 'jp',
    flag: '🇯🇵',
    type: 'property',
    group: 'green',
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 150
  },
  // 32: South Korea
  {
    index: 32,
    name: 'South Korea',
    countryCode: 'kr',
    flag: '🇰🇷',
    type: 'property',
    group: 'green',
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 150
  },
  // 33: Community Chest
  {
    index: 33,
    name: 'Community Chest',
    type: 'chest',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 34: China
  {
    index: 34,
    name: 'China',
    countryCode: 'cn',
    flag: '🇨🇳',
    type: 'property',
    group: 'green',
    price: 320,
    rent: [28, 150, 450, 1000, 1200, 1400],
    houseCost: 200,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 160
  },
  // 35: JFK New York Airport
  {
    index: 35,
    name: 'JFK New York',
    flag: '✈️',
    type: 'railroad',
    group: 'station',
    price: 200,
    rent: [25, 50, 100, 200],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 100
  },
  // 36: Chance
  {
    index: 36,
    name: 'Chance',
    type: 'chance',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 37: United Kingdom
  {
    index: 37,
    name: 'United Kingdom',
    countryCode: 'gb',
    flag: '🇬🇧',
    type: 'property',
    group: 'dark_blue',
    price: 350,
    rent: [35, 175, 500, 1100, 1300, 1500],
    houseCost: 200,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 175
  },
  // 38: Luxury Tax
  {
    index: 38,
    name: 'Luxury Tax',
    type: 'tax',
    price: 100,
    rent: [100],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 39: United States
  {
    index: 39,
    name: 'United States',
    countryCode: 'us',
    flag: '🇺🇸',
    type: 'property',
    group: 'dark_blue',
    price: 400,
    rent: [50, 200, 600, 1400, 1700, 2000],
    houseCost: 200,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 200
  }
];

export const PROPERTY_GROUPS: Record<string, { name: string; color: string; count: number }> = {
  brown: { name: 'Brown', color: '#8B5A2B', count: 2 },
  light_blue: { name: 'Sky Blue', color: '#38bdf8', count: 3 },
  pink: { name: 'Pink', color: '#ec4899', count: 3 },
  orange: { name: 'Orange', color: '#f97316', count: 3 },
  red: { name: 'Red', color: '#ef4444', count: 3 },
  yellow: { name: 'Yellow', color: '#eab308', count: 3 },
  green: { name: 'Green', color: '#22c55e', count: 3 },
  dark_blue: { name: 'Royal Blue', color: '#2563eb', count: 2 },
  station: { name: 'Airport', color: '#64748b', count: 4 },
  utility: { name: 'Utility', color: '#94a3b8', count: 2 }
};
