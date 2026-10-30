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
  // 1: Salvador (Brazil)
  {
    index: 1,
    name: 'Salvador',
    country: 'Brazil',
    countryCode: 'br',
    flag: '🇧🇷',
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
  // 2: Treasure (Chest)
  {
    index: 2,
    name: 'Treasure',
    type: 'chest',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 3: Rio (Brazil)
  {
    index: 3,
    name: 'Rio',
    country: 'Brazil',
    countryCode: 'br',
    flag: '🇧🇷',
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
  // 4: Bank (19% of player cash)
  {
    index: 4,
    name: 'Bank',
    type: 'tax',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 5: Tunis-Carthage (Tunisia)
  {
    index: 5,
    name: 'Tunis-Carthage',
    country: 'Tunisia',
    countryCode: 'tn',
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
  // 6: Sousse (Tunisia)
  {
    index: 6,
    name: 'Sousse',
    country: 'Tunisia',
    countryCode: 'tn',
    flag: '🇹🇳',
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
  // 7: Sfax (Tunisia)
  {
    index: 7,
    name: 'Sfax',
    country: 'Tunisia',
    countryCode: 'tn',
    flag: '🇹🇳',
    type: 'property',
    group: 'light_blue',
    price: 110,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 55
  },
  // 8: Surprise (Chance)
  {
    index: 8,
    name: 'Surprise',
    type: 'chance',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 9: Bizerte (Tunisia)
  {
    index: 9,
    name: 'Bizerte',
    country: 'Tunisia',
    countryCode: 'tn',
    flag: '🇹🇳',
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
  // 10: In Prison (Visiting / Jail)
  {
    index: 10,
    name: 'In Prison',
    type: 'jail',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 11: Venice (Italy)
  {
    index: 11,
    name: 'Venice',
    country: 'Italy',
    countryCode: 'it',
    flag: '🇮🇹',
    type: 'property',
    group: 'pink',
    price: 130,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 65
  },
  // 12: STEG (Tunisia Electricity)
  {
    index: 12,
    name: 'STEG',
    country: 'Tunisia',
    countryCode: 'tn',
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
  // 13: Milan (Italy)
  {
    index: 13,
    name: 'Milan',
    country: 'Italy',
    countryCode: 'it',
    flag: '🇮🇹',
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
  // 14: Rome (Italy)
  {
    index: 14,
    name: 'Rome',
    country: 'Italy',
    countryCode: 'it',
    flag: '🇮🇹',
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
  // 15: Qatar Airways
  {
    index: 15,
    name: 'Qatar Airways',
    country: 'Qatar',
    countryCode: 'qa',
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
  // 16: Frankfurt (Germany)
  {
    index: 16,
    name: 'Frankfurt',
    country: 'Germany',
    countryCode: 'de',
    flag: '🇩🇪',
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
  // 17: Treasure
  {
    index: 17,
    name: 'Treasure',
    type: 'chest',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 18: Munich (Germany)
  {
    index: 18,
    name: 'Munich',
    country: 'Germany',
    countryCode: 'de',
    flag: '🇩🇪',
    type: 'property',
    group: 'orange',
    price: 190,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 95
  },
  // 19: Berlin (Germany)
  {
    index: 19,
    name: 'Berlin',
    country: 'Germany',
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
  // 20: Vacation
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
  // 21: Shenzhen (China)
  {
    index: 21,
    name: 'Shenzhen',
    country: 'China',
    countryCode: 'cn',
    flag: '🇨🇳',
    type: 'property',
    group: 'red',
    price: 210,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 105
  },
  // 22: Surprise
  {
    index: 22,
    name: 'Surprise',
    type: 'chance',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 23: Beijing (China)
  {
    index: 23,
    name: 'Beijing',
    country: 'China',
    countryCode: 'cn',
    flag: '🇨🇳',
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
  // 24: Shanghai (China)
  {
    index: 24,
    name: 'Shanghai',
    country: 'China',
    countryCode: 'cn',
    flag: '🇨🇳',
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
  // 25: Nouvelair (Tunisia)
  {
    index: 25,
    name: 'Nouvelair',
    country: 'Tunisia',
    countryCode: 'tn',
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
  // 26: Lyon (France)
  {
    index: 26,
    name: 'Lyon',
    country: 'France',
    countryCode: 'fr',
    flag: '🇫🇷',
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
  // 27: SONEDE (Tunisia Water)
  {
    index: 27,
    name: 'SONEDE',
    country: 'Tunisia',
    countryCode: 'tn',
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
  // 28: Toulouse (France)
  {
    index: 28,
    name: 'Toulouse',
    country: 'France',
    countryCode: 'fr',
    flag: '🇫🇷',
    type: 'property',
    group: 'yellow',
    price: 270,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 135
  },
  // 29: Paris (France)
  {
    index: 29,
    name: 'Paris',
    country: 'France',
    countryCode: 'fr',
    flag: '🇫🇷',
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
  // 30: Go to prison
  {
    index: 30,
    name: 'Go to prison',
    type: 'go_to_jail',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 31: Liverpool (UK)
  {
    index: 31,
    name: 'Liverpool',
    country: 'United Kingdom',
    countryCode: 'gb',
    flag: '🇬🇧',
    type: 'property',
    group: 'green',
    price: 290,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 145
  },
  // 32: Manchester (UK)
  {
    index: 32,
    name: 'Manchester',
    country: 'United Kingdom',
    countryCode: 'gb',
    flag: '🇬🇧',
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
  // 33: Treasure
  {
    index: 33,
    name: 'Treasure',
    type: 'chest',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 34: London (UK)
  {
    index: 34,
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'gb',
    flag: '🇬🇧',
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
  // 35: Emirates
  {
    index: 35,
    name: 'Emirates',
    country: 'UAE',
    countryCode: 'ae',
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
  // 36: Surprise
  {
    index: 36,
    name: 'Surprise',
    type: 'chance',
    price: 0,
    rent: [0],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 37: San Francisco (USA)
  {
    index: 37,
    name: 'San Francisco',
    country: 'United States',
    countryCode: 'us',
    flag: '🇺🇸',
    type: 'property',
    group: 'dark_blue',
    price: 360,
    rent: [35, 175, 500, 1100, 1300, 1500],
    houseCost: 200,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 180
  },
  // 38: Poste ($100 fee)
  {
    index: 38,
    name: 'Poste',
    type: 'tax',
    price: 0,
    rent: [100],
    ownerId: null,
    houses: 0,
    isMortgaged: false,
    mortgageValue: 0
  },
  // 39: New York (USA)
  {
    index: 39,
    name: 'New York',
    country: 'United States',
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

export const PROPERTY_GROUPS: Record<string, { name: string; country: string; color: string; count: number }> = {
  brown: { name: 'Brazil', country: 'Brazil', color: '#45322E', count: 2 },
  light_blue: { name: 'Tunisia', country: 'Tunisia', color: '#B45309', count: 3 },
  pink: { name: 'Italy', country: 'Italy', color: '#1B6B60', count: 3 },
  orange: { name: 'Germany', country: 'Germany', color: '#882233', count: 3 },
  red: { name: 'China', country: 'China', color: '#6A2576', count: 3 },
  yellow: { name: 'France', country: 'France', color: '#205493', count: 3 },
  green: { name: 'United Kingdom', country: 'United Kingdom', color: '#8A2060', count: 3 },
  dark_blue: { name: 'United States', country: 'United States', color: '#3A1E68', count: 2 },
  station: { name: 'Airports', country: 'Airports', color: '#334155', count: 4 },
  utility: { name: 'Utilities', country: 'Utilities', color: '#0F766E', count: 2 }
};
