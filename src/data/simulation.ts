/**
 * Local scenario data and the DNA scoring model. There is no backend: all
 * content and scores live here and in component state.
 *
 * Card copy (title, duration, description) is from the Figma Home V2 frame.
 * Briefing, decisions and DNA impacts are illustrative placeholders until
 * the Simulation Briefing frames are provided.
 */

import type { Localized } from '../locales';

// ---------------------------------------------------------------------------
// DNA model
// ---------------------------------------------------------------------------

export const DNA_DIMENSIONS = [
  'vision',
  'courage',
  'risk',
  'control',
  'empathy',
  'ethics',
] as const;

export type DnaDimension = (typeof DNA_DIMENSIONS)[number];

/** Score per dimension on a 0–100 scale. */
export type DnaScore = Record<DnaDimension, number>;

/** Signed change applied to a score; omitted dimensions are unchanged. */
export type DnaImpact = Partial<Record<DnaDimension, number>>;

export const DNA_LABELS: Record<DnaDimension, string> = {
  vision: 'Vision',
  courage: 'Courage',
  risk: 'Risk',
  control: 'Control',
  empathy: 'Empathy',
  ethics: 'Ethics',
};

export const DNA_MIN = 0;
export const DNA_MAX = 100;

/** Neutral starting profile before any decision is made. */
export const BASELINE_DNA: DnaScore = {
  vision: 50,
  courage: 50,
  risk: 50,
  control: 50,
  empathy: 50,
  ethics: 50,
};

const clamp = (value: number) => Math.min(DNA_MAX, Math.max(DNA_MIN, value));

/** Applies impacts in order, clamping every dimension to 0–100. */
export function applyImpacts(base: DnaScore, impacts: DnaImpact[]): DnaScore {
  const next = { ...base };
  for (const impact of impacts) {
    for (const dimension of DNA_DIMENSIONS) {
      next[dimension] = clamp(next[dimension] + (impact[dimension] ?? 0));
    }
  }
  return next;
}

// ---------------------------------------------------------------------------
// Scenario content
// ---------------------------------------------------------------------------

export interface DecisionOption {
  id: string;
  label: Localized;
  impact: DnaImpact;
  /** Consequence clip for this choice; overrides the decision's clip. */
  outcomeVideo?: string;
}

export interface DecisionNode {
  id: string;
  title: string;
  /** What has happened, shown before the question. */
  situation: string;
  prompt: string;
  options: DecisionOption[];
  /**
   * Consequence clip played after this decision (or when its time runs
   * out) before the next decision appears. Without one the next decision
   * follows directly.
   */
  outcomeVideo?: string;
}

/**
 * Applied when the decision timer runs out: hesitating under pressure is
 * scored as a choice of its own.
 */
export const TIMEOUT_IMPACT: DnaImpact = { courage: -10, control: -10 };

/*
 * Copy shown on screen (scenario title, duration, description and option
 * labels) is kept per language. Fields the UI no longer shows (role,
 * briefing, decision title, situation and prompt) stay English only.
 */
export interface Scenario {
  id: string;
  title: Localized;
  /** Estimated play time shown on the card, e.g. "1:37 min". */
  duration: Localized;
  /** Teaser on the scenario card. */
  description: Localized;
  /** The player's role in the scenario. */
  role: string;
  briefing: string;
  /** `false` keeps the card listed with its Start button disabled. */
  playable: boolean;
  /** Clip played after Start Simulation, before the first decision. */
  introVideo?: string;
  decisions: DecisionNode[];
}

const IRAQ_WAR: Scenario = {
  id: 'iraq-war',
  title: { en: 'Iraq War', tr: 'Irak Savaşı' },
  duration: { en: '1:37 min', tr: '1:37 dk' },
  description: {
    en:
      '2003. The Chemical Weapon Allegations Are On Your Desk. Your Decision ' +
      'Will Determine The Fate Of Millions.',
    tr:
      '2003. Kimyasal Silah İddiaları Masanızda. Kararınız Milyonların ' +
      'Kaderini Belirleyecek.',
  },
  role: 'President of the United States',
  briefing:
    'March 2003. Intelligence reports claim Iraq holds chemical weapons. ' +
    'The evidence is disputed, allies are divided and the UN inspectors ' +
    'have asked for more time. The decision is yours.',
  playable: true,
  introVideo: 'iraq-war',
  decisions: [
    {
      id: 'intelligence',
      title: 'The dossier',
      situation:
        'Your advisers present the intelligence as conclusive, but analysts ' +
        'inside the agencies say key sources are unverified.',
      prompt: 'How do you treat the intelligence?',
      // Consequence scene; the same clip follows every option for now.
      outcomeVideo: 'iraq-war-2',
      // Option copy follows the Figma decision frame, in row order (1 left,
      // 1 right, 2 left, 2 right, 3); Figma mixes the two languages, so
      // each line keeps its Figma wording in that language and is
      // translated for the other. Impacts are placeholders.
      options: [
        {
          id: 'naval-quarantine',
          label: {
            en: 'Naval Quarantine: Blockade Cuba and stop Soviet ships while negotiating in secret.',
            tr: "Deniz Karantinası: Küba'yı kuşatıp Sovyet gemilerini engelleyerek gizli pazarlık yürütmek.",
          },
          impact: { control: 10, courage: 5, risk: 5, ethics: 5 },
        },
        {
          id: 'wait-for-moscow',
          label: {
            en: 'Wait for Signal from Moscow',
            tr: "Moskova'dan Sinyal Bekle",
          },
          impact: { empathy: 5, courage: -10, risk: -5 },
        },
        {
          id: 'launch-on-schedule',
          label: {
            en: 'Bow to Time Pressure: Launch on the set schedule despite the risks, under political and media pressure.',
            tr: 'Zaman Baskısına Uyum: Siyasi ve medya baskısı nedeniyle risklere rağmen belirlenen takvimde fırlatmayı başlat.',
          },
          impact: { courage: 10, risk: 15, ethics: -10 },
        },
        {
          id: 'sonar-signal',
          label: {
            en: 'Signal US Ships with Sonar',
            tr: 'ABD Gemilerine Sonarla Sinyal Ver',
          },
          impact: { control: 5, risk: 5, vision: 5 },
        },
        {
          // Same copy as the card above in Figma.
          id: 'sonar-signal-2',
          label: {
            en: 'Signal US Ships with Sonar',
            tr: 'ABD Gemilerine Sonarla Sinyal Ver',
          },
          impact: { control: 5, risk: 5, vision: 5 },
        },
      ],
    },
    {
      id: 'deadline',
      title: 'The deadline',
      situation:
        'The UN Security Council is split. Inspectors want months; your ' +
        'military commanders say the window for action is closing.',
      prompt: 'What is your next move?',
      outcomeVideo: 'iraq-war-2',
      options: [
        {
          id: 'invade',
          label: {
            en: 'Launch the invasion with a coalition of willing allies',
            tr: 'Gönüllü müttefiklerden oluşan bir koalisyonla işgali başlat',
          },
          impact: { vision: 10, courage: 10, risk: 15, empathy: -10 },
        },
        {
          id: 'extend-inspections',
          label: {
            en: 'Give the inspectors more time and keep pressure on Iraq',
            tr: 'Denetçilere daha fazla zaman ver ve Irak üzerindeki baskıyı sürdür',
          },
          impact: { empathy: 10, ethics: 10, risk: -10, vision: -5 },
        },
        {
          id: 'seek-resolution',
          label: {
            en: 'Push for a second UN resolution before any action',
            tr: 'Herhangi bir adımdan önce ikinci bir BM kararı için bastır',
          },
          impact: { control: 10, ethics: 5, courage: -5 },
        },
        {
          id: 'targeted-strikes',
          label: {
            en: 'Order limited air strikes on the suspected weapon sites',
            tr: 'Şüpheli silah tesislerine sınırlı hava saldırısı emri ver',
          },
          impact: { courage: 5, risk: 10, control: 5, empathy: -5 },
        },
        {
          id: 'back-channel',
          label: {
            en: 'Open a secret back channel to negotiate with Baghdad',
            tr: 'Bağdat ile pazarlık için gizli bir kanal aç',
          },
          impact: { vision: 10, empathy: 5, risk: 5, control: -5 },
        },
      ],
    },
  ],
};

const CUBAN_MISSILE_CRISIS: Scenario = {
  id: 'cuban-missile-crisis',
  title: {
    en: 'Cuban Missile Crisis (1962)',
    tr: 'Küba Füze Krizi (1962)',
  },
  duration: { en: '1:25 min', tr: '1:25 dk' },
  description: {
    en: "A World On The Brink Of Nuclear Annihilation. You Are In Kennedy's Seat.",
    tr: "Dünya Nükleer Yok Oluşun Eşiğinde. Kennedy'nin Koltuğundasınız.",
  },
  role: 'President of the United States',
  briefing: '',
  playable: false,
  decisions: [],
};

export const SCENARIOS: Scenario[] = [IRAQ_WAR, CUBAN_MISSILE_CRISIS];

export function findScenario(id: string): Scenario | undefined {
  return SCENARIOS.find(scenario => scenario.id === id);
}
