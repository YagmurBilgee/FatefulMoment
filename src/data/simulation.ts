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
// DNA profiles
// ---------------------------------------------------------------------------

/*
 * Mock archetype profiles shown on the DNA screen. Brave Visionary is the
 * Figma frame's copy; the other two are placeholders in the same shape.
 * Scores are fixed per profile, not the raw sum of the player's impacts.
 */
export type DnaProfileId =
  | 'brave-visionary'
  | 'pragmatic-strategist'
  | 'crisis-survivor';

export interface DnaProfile {
  id: DnaProfileId;
  archetype: string;
  quote: string;
  scores: DnaScore;
  /** Pattern detection cards, numbered 01, 02, 03 on screen. */
  patterns: string[];
  /** The lowest-scoring dimension. */
  blindSpot: DnaDimension;
  blindSpotQuestion: string;
  blindSpotBody: string;
}

export const DNA_PROFILES: Record<DnaProfileId, DnaProfile> = {
  'brave-visionary': {
    id: 'brave-visionary',
    archetype: 'BRAVE VISIONARY',
    quote:
      'You see the big picture and walk towards it - no matter the cost. ' +
      'Ethics sometimes take a back seat, but few surpass you in the ' +
      'courage to take action.',
    scores: {
      vision: 88,
      courage: 82,
      risk: 79,
      control: 55,
      empathy: 38,
      ethics: 31,
    },
    patterns: [
      'You are not afraid to take action under pressure. While others hesitate, you have already taken a step. This positions you as a natural leader in crisis moments.',
      'You prioritize long-term impact over short-term costs. You see the big picture — but this sometimes makes it difficult for you to see the people in front of you.',
      'When ethics conflict with interests, your tendency is clear: you choose the interest. This pattern repeated in 5 out of 8 scenarios. It works in the short term — but creates erosion of trust in the long term.',
    ],
    blindSpot: 'ethics',
    blindSpotQuestion: 'How much will you pay to win?',
    blindSpotBody:
      'Your vision and courage are strong — but your ethics score is your lowest dimension. While reaching big goals, you often overlook how those around you feel and what they sacrifice. Your leadership capacity is high, but the mark you leave is not always positive.',
  },
  'pragmatic-strategist': {
    id: 'pragmatic-strategist',
    archetype: 'PRAGMATIC STRATEGIST',
    quote:
      'You calculate every risk and move with cold precision. Speed takes ' +
      'a back seat, but your plans rarely fail.',
    scores: {
      vision: 65,
      courage: 60,
      risk: 34,
      control: 86,
      empathy: 42,
      ethics: 58,
    },
    patterns: [
      'You keep options open until the last responsible moment. You gather leverage first and act only when the outcome is under your control.',
      'You prefer negotiation and pressure over open confrontation. Your moves are measured — rarely spectacular, rarely disastrous.',
      'When the stakes rise, you narrow the risk instead of taking it. This protects you from big losses — but also from big wins.',
    ],
    blindSpot: 'risk',
    blindSpotQuestion: 'What will you miss while you wait?',
    blindSpotBody:
      'Your control is exceptional — but your risk score is your lowest dimension. Some windows close before the plan is perfect. Your caution keeps you safe, but it can leave the initiative to those willing to move first.',
  },
  'crisis-survivor': {
    id: 'crisis-survivor',
    archetype: 'CRISIS SURVIVOR',
    quote:
      'You let events unfold and react only when forced. Survival was ' +
      'achieved, but the initiative was lost.',
    scores: {
      vision: 35,
      courage: 40,
      risk: 28,
      control: 45,
      empathy: 60,
      ethics: 65,
    },
    patterns: [
      'When the clock ran out, you had not decided yet. Under pressure your first instinct is to wait for more information.',
      'You avoid choices that could hurt others. Your ethics and empathy stay intact — but events decide in your place.',
      'Hesitation is also a decision. In a crisis, the side that moves first sets the terms everyone else must accept.',
    ],
    blindSpot: 'risk',
    blindSpotQuestion: 'Who decides when you do not?',
    blindSpotBody:
      'Your ethics and empathy are your strongest dimensions — but your risk score is your lowest. Avoiding every risk left the outcome to others. You survived the crisis, but you did not shape it.',
  },
};

/** How the player got to the DNA screen. */
export interface SimulationPath {
  /** Summed score from the player's picks; absent before playing. */
  score?: DnaScore;
  /** A decision timer ran out at least once. */
  timedOut?: boolean;
}

/**
 * Picks the profile for a simulation path: any timeout makes a Crisis
 * Survivor; otherwise bold picks (courage and risk) outweighing control
 * make a Brave Visionary, and cautious ones a Pragmatic Strategist.
 * Without a played path the Figma default is shown.
 */
export function selectDnaProfile({
  score,
  timedOut,
}: SimulationPath): DnaProfile {
  if (timedOut) {
    return DNA_PROFILES['crisis-survivor'];
  }
  if (!score) {
    return DNA_PROFILES['brave-visionary'];
  }
  const boldness = (score.courage + score.risk) / 2;
  return boldness >= score.control
    ? DNA_PROFILES['brave-visionary']
    : DNA_PROFILES['pragmatic-strategist'];
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
  /**
   * Turns the decision into two picks. After the outcome clip the same
   * options return in place as a consequence review: the first pick is
   * marked "Your Choice" and locked, the others stay open, and the second
   * pick plays this clip before the flow moves on. Both picks are scored.
   */
  reviewVideo?: string;
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
      // The review's second pick, whichever option it is, then the profile.
      reviewVideo: 'iraq-war-3',
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
