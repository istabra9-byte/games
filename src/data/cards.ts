export interface GameCard {
  id: string;
  type: 'chance' | 'chest';
  title: string;
  description: string;
  action: (state: any, playerId: string) => { text: string; potChange?: number };
}

export const CHANCE_CARDS = [
  {
    id: 'ch_1',
    type: 'chance',
    title: 'Advance to GO',
    description: 'Collect your $200 salary immediately.',
    action: 'advance_to_go'
  },
  {
    id: 'ch_2',
    type: 'chance',
    title: 'Speeding Fine',
    description: 'Pay $50 to the Free Parking pot.',
    action: 'pay_pot_50'
  },
  {
    id: 'ch_3',
    type: 'chance',
    title: 'Bank Dividend',
    description: 'The bank pays you a dividend of $100.',
    action: 'receive_100'
  },
  {
    id: 'ch_4',
    type: 'chance',
    title: 'Tourism Grant',
    description: 'Mediterranean Tourism Board awards you $100 for your hospitality projects.',
    action: 'receive_100'
  },
  {
    id: 'ch_5',
    type: 'chance',
    title: 'Get Out of Jail Free',
    description: 'This card may be kept until needed.',
    action: 'jail_card'
  },
  {
    id: 'ch_6',
    type: 'chance',
    title: 'Trip to New York',
    description: 'Advance to New York. If unowned, you may buy it. If owned, pay rent.',
    action: 'advance_to_39'
  },
  {
    id: 'ch_7',
    type: 'chance',
    title: 'Take a Flight',
    description: 'Advance to the nearest Airport. If unowned, you may buy it. If owned, pay rent.',
    action: 'advance_to_nearest_airport'
  },
  {
    id: 'ch_8',
    type: 'chance',
    title: 'Utility Inspection',
    description: 'Advance to the nearest Utility (STEG / SONEDE). If unowned, you may buy it. If owned, pay rent.',
    action: 'advance_to_nearest_utility'
  },
  {
    id: 'ch_9',
    type: 'chance',
    title: 'Royal Visit',
    description: 'Advance directly to London. If unowned, you may buy it. If owned, pay rent.',
    action: 'advance_to_london'
  },
  {
    id: 'ch_10',
    type: 'chance',
    title: 'Wrong Direction',
    description: 'Go back 3 spaces and resolve that space.',
    action: 'go_back_3'
  },
  {
    id: 'ch_11',
    type: 'chance',
    title: 'Double Boost',
    description: 'Velocity surge! Roll the dice again immediately!',
    action: 'free_roll'
  },
  {
    id: 'ch_12',
    type: 'chance',
    title: 'Tech Startup IPO',
    description: 'Your venture yields windfall returns. Collect $150 from the bank.',
    action: 'receive_150'
  },
  {
    id: 'ch_13',
    type: 'chance',
    title: 'City Development Bonus',
    description: 'Municipal council rewards infrastructure development. Collect $75.',
    action: 'receive_75'
  },
  {
    id: 'ch_14',
    type: 'chance',
    title: 'Commercial Airfreight',
    description: 'Advance to the nearest Airport. If unowned, you may buy it. If owned, pay rent.',
    action: 'advance_to_nearest_airport'
  },
  {
    id: 'ch_15',
    type: 'chance',
    title: 'Solar Energy Rebate',
    description: 'Green energy transition incentive! Receive $50 government rebate.',
    action: 'receive_50'
  },
  {
    id: 'ch_16',
    type: 'chance',
    title: 'Direct Investigation',
    description: 'Rare financial audit! Sent directly to Jail for investigation.',
    action: 'go_to_jail'
  }
];

export const CHEST_CARDS = [
  {
    id: 'cc_1',
    type: 'chest',
    title: 'Bank Error in Your Favor',
    description: 'Collect $200 from the bank.',
    action: 'receive_200'
  },
  {
    id: 'cc_2',
    type: 'chest',
    title: "Doctor's Fees",
    description: 'Pay $50 to the pot.',
    action: 'pay_pot_50'
  },
  {
    id: 'cc_3',
    type: 'chest',
    title: 'Holiday Fund Matures',
    description: 'Receive $100 from your matured bond.',
    action: 'receive_100'
  },
  {
    id: 'cc_4',
    type: 'chest',
    title: 'It is your Birthday',
    description: 'Collect $20 from every active player.',
    action: 'collect_from_all_20'
  },
  {
    id: 'cc_5',
    type: 'chest',
    title: 'Income Tax Refund',
    description: 'Collect $50 tax refund.',
    action: 'receive_50'
  },
  {
    id: 'cc_6',
    type: 'chest',
    title: 'Consultancy Fee',
    description: 'Receive $75 for professional services.',
    action: 'receive_75'
  }
];
