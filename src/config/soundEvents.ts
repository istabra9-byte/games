/**
 * ============================================================================
 * MONOPOLY SOUND & MEME EVENT REGISTRY
 * ============================================================================
 * Single source of truth for all game sound events and memes.
 * 
 * TO ADD A NEW SOUND:
 * 1. Place the .mp3 file into `public/sounds/`
 * 2. Add the filename to the `files` array of the appropriate event below.
 * 3. Add the file path to `public/sw.js` `STATIC_ASSETS` for offline caching.
 * 
 * TO REMOVE A SOUND:
 * Simply remove its filename from the `files` array below.
 */

export type SoundEventId =
  | 'WELCOME'                  // Game starts from lobby
  | 'EARNINGS_TAX'             // Landing on Earnings Tax (Tile 4)
  | 'PREMIUM_TAX'              // Landing on Premium Tax (Tile 38)
  | 'PRISON'                   // Going to prison / landing on Go to Prison
  | 'PRISON_ESCAPE'            // Getting out of prison (doubles, bail, served time)
  | 'PRISON_ESCAPE_FIRST_ROLL' // Escaping prison on the first dice roll
  | 'VACATION'                 // Landing on Vacation (Tile 20)
  | 'LAND_ON_START'            // Stopping directly on Start (Tile 0)
  | 'CHINA_NEAR_MONOPOLY'      // Buying 2 of 3 properties in China
  | 'CHINA_FULL_MONOPOLY'      // Acquiring all 3 properties in China
  | 'CHINA_3_HOUSES'           // Having 3 houses across all 3 China cities
  | 'ARAB_AIRPORT'             // Buying Emirates or Qatar Airways airport
  | 'TRADE_ONE_WAY_CASH'       // Giving money in a trade and receiving nothing back
  | 'NEGATIVE_BALANCE'         // Cash drops below $0 (entering debt)
  | 'DEBT_CLEARED'             // Cash recovers from negative to positive (>= $0)
  | 'BAD_SURPRISE'             // Bad card drawn from Surprise / Chance
  | 'BIG_LOSS_500'             // Losing $500+ at once
  | 'BIG_RENT_COLLECT_400'     // Owner receives $400+ in rent
  | 'BANKRUPT'                 // Player declared bankruptcy
  | 'WINNER';                  // Player wins the match

export interface SoundEventConfig {
  id: SoundEventId;
  name: string;
  description: string;
  files: string[];
  volumeMultiplier?: number;
}

export const SOUND_EVENTS_REGISTRY: Record<SoundEventId, SoundEventConfig> = {
  WELCOME: {
    id: 'WELCOME',
    name: 'Game Start Welcome',
    description: 'Triggered when the host starts the match or match transitions from lobby to playing',
    files: [
      'welcome_merhba.mp3',
      'welcome_meow.mp3',
      'welcome_muhehehe.mp3',
      'welcome_putin.mp3'
    ],
    volumeMultiplier: 1.0
  },

  EARNINGS_TAX: {
    id: 'EARNINGS_TAX',
    name: 'Earnings Tax',
    description: 'Triggered when a player lands on Earnings Tax (Tile 4)',
    files: [
      'tax_amoun.mp3',
      'tax_wallahi.mp3',
      'tax_raaaaaah.mp3'
    ],
    volumeMultiplier: 1.15
  },

  PREMIUM_TAX: {
    id: 'PREMIUM_TAX',
    name: 'Premium Tax',
    description: 'Triggered when a player lands on Premium Tax (Tile 38)',
    files: [
      'tax_premium_ack.mp3',
      'tax_raaaaaah.mp3'
    ],
    volumeMultiplier: 1.15
  },

  PRISON: {
    id: 'PRISON',
    name: 'Go to Prison',
    description: 'Triggered when a player is sent to prison or lands on Go to Prison (Tile 30)',
    files: [
      'prison_fbi.mp3',
      'prison_hnt.mp3',
      'prison_vacation_jey.mp3'
    ],
    volumeMultiplier: 1.1
  },

  PRISON_ESCAPE: {
    id: 'PRISON_ESCAPE',
    name: 'Get Out of Prison',
    description: 'Triggered when a jailed player is released (doubles, bail, or served 3 turns)',
    files: [
      'prison_escape_mbappe.mp3',
      'prison_escape_byebye.mp3',
      'oui_slow.mp3',
      'prison_escape_amogus.mp3'
    ],
    volumeMultiplier: 1.15
  },

  PRISON_ESCAPE_FIRST_ROLL: {
    id: 'PRISON_ESCAPE_FIRST_ROLL',
    name: 'Prison Escape On 1st Roll',
    description: 'Triggered when a jailed player throws doubles on their very first attempt and escapes',
    files: [
      'prison_escape_amogus.mp3',
      'prison_escape_mbappe.mp3',
      'prison_escape_byebye.mp3',
      'oui_slow.mp3'
    ],
    volumeMultiplier: 1.15
  },

  VACATION: {
    id: 'VACATION',
    name: 'Vacation',
    description: 'Triggered when a player stops on Vacation (Tile 20)',
    files: [
      'vacation_snore.mp3',
      'prison_vacation_jey.mp3',
      'vacation_xue_hua.mp3',
      'oui_slow.mp3'
    ],
    volumeMultiplier: 1.1
  },

  LAND_ON_START: {
    id: 'LAND_ON_START',
    name: 'Landed on Start',
    description: 'Triggered when a player stops directly on Start (Tile 0), not just passing by',
    files: [
      'land_start_cena.mp3'
    ],
    volumeMultiplier: 1.15
  },

  CHINA_NEAR_MONOPOLY: {
    id: 'CHINA_NEAR_MONOPOLY',
    name: 'China 2 of 3 Owned',
    description: 'Triggered when a player acquires 2 out of 3 properties in China (Shanghai, Beijing, Shenzhen)',
    files: [
      'china_chino.mp3'
    ],
    volumeMultiplier: 1.1
  },

  CHINA_FULL_MONOPOLY: {
    id: 'CHINA_FULL_MONOPOLY',
    name: 'China All 3 Countries Owned',
    description: 'Triggered when a player acquires all 3 properties in China',
    files: [
      'china_full_monopoly.mp3'
    ],
    volumeMultiplier: 1.2
  },

  CHINA_3_HOUSES: {
    id: 'CHINA_3_HOUSES',
    name: 'China 3 Houses on All 3 Countries',
    description: 'Triggered when all 3 China properties have 3 houses built',
    files: [
      'china_3houses.mp3'
    ],
    volumeMultiplier: 1.2
  },

  ARAB_AIRPORT: {
    id: 'ARAB_AIRPORT',
    name: 'Emirates or Qatar Airport Bought',
    description: 'Triggered when a player buys Emirates (Tile 35) or Qatar Airways (Tile 15)',
    files: [
      'airport_arab_apoio.mp3'
    ],
    volumeMultiplier: 1.15
  },

  TRADE_ONE_WAY_CASH: {
    id: 'TRADE_ONE_WAY_CASH',
    name: 'Trade One-Way Cash (Let Her Go)',
    description: 'Triggered when a player gives cash in a trade and receives nothing back',
    files: [
      'trade_let_her_go.mp3'
    ],
    volumeMultiplier: 1.2
  },

  NEGATIVE_BALANCE: {
    id: 'NEGATIVE_BALANCE',
    name: 'Negative Money (< $0)',
    description: 'Triggered when a player balance falls below 0 (entering debt)',
    files: [
      'debt_chawali.mp3',
      'debt_social_credit.mp3'
    ],
    volumeMultiplier: 1.15
  },

  DEBT_CLEARED: {
    id: 'DEBT_CLEARED',
    name: 'Debt Cleared (>= $0)',
    description: 'Triggered when a player who had negative money recovers to >= $0',
    files: [
      'debt_cleared_levelup.mp3'
    ],
    volumeMultiplier: 1.1
  },

  BAD_SURPRISE: {
    id: 'BAD_SURPRISE',
    name: 'Bad Surprise Card',
    description: 'Triggered when a player draws a negative Chance card (loss of money or sent to jail)',
    files: [
      'surprise_bad_cat.mp3',
      'surprise_bad_dundun.mp3'
    ],
    volumeMultiplier: 1.1
  },

  BIG_LOSS_500: {
    id: 'BIG_LOSS_500',
    name: 'Big Loss (>= $500)',
    description: 'Triggered when a player loses $500 or more at once',
    files: [
      'surprise_bad_cat.mp3',
      'debt_social_credit.mp3'
    ],
    volumeMultiplier: 1.15
  },

  BIG_RENT_COLLECT_400: {
    id: 'BIG_RENT_COLLECT_400',
    name: 'Big Rent Collected (>= $400)',
    description: 'Triggered when a property owner collects $400 or more from someone landing on their house',
    files: [
      'debt_cleared_levelup.mp3',
      'vacation_snore.mp3'
    ],
    volumeMultiplier: 1.1
  },

  BANKRUPT: {
    id: 'BANKRUPT',
    name: 'Bankruptcy',
    description: 'Triggered when a player goes bankrupt',
    files: [
      'bankrupt_spongebob.mp3'
    ],
    volumeMultiplier: 1.1
  },

  WINNER: {
    id: 'WINNER',
    name: 'Match Winner',
    description: 'Triggered when the final winner is crowned',
    files: [
      'winner_gta.mp3'
    ],
    volumeMultiplier: 1.2
  }
};

/**
 * All unique sound filenames currently registered across all events
 */
export const ALL_REGISTERED_SOUND_FILES: string[] = Array.from(
  new Set(Object.values(SOUND_EVENTS_REGISTRY).flatMap(e => e.files))
);
