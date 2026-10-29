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
    title: 'Go Directly to Jail',
    description: 'Do not pass GO, do not collect $200.',
    action: 'go_to_jail'
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
    description: 'Advance to New York.',
    action: 'advance_to_39'
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
