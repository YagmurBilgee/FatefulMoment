/**
 * Local scenario data and the DNA scoring model. There is no backend: all
 * content and scores live here and in component state.
 *
 * Card copy (title, duration, description) is from the Figma Home V2 frame.
 * Briefing, decisions and DNA impacts are illustrative placeholders until
 * the Simulation Briefing frames are provided.
 */

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
  label: string;
  impact: DnaImpact;
}

export interface DecisionNode {
  id: string;
  title: string;
  /** What has happened, shown before the question. */
  situation: string;
  prompt: string;
  options: DecisionOption[];
}

/**
 * Applied when the decision timer runs out: hesitating under pressure is
 * scored as a choice of its own.
 */
export const TIMEOUT_IMPACT: DnaImpact = { courage: -10, control: -10 };

export interface Scenario {
  id: string;
  title: string;
  /** Estimated play time shown on the card, e.g. "1:37 min". */
  duration: string;
  /** Teaser on the scenario card. */
  description: string;
  /** The player's role in the scenario. */
  role: string;
  briefing: string;
  /** `false` keeps the card listed with its Start button disabled. */
  playable: boolean;
  decisions: DecisionNode[];
}

const IRAQ_WAR: Scenario = {
  id: 'iraq-war',
  title: 'Iraq War',
  duration: '1:37 min',
  description:
    '2003. The Chemical Weapon Allegations Are On Your Desk. Your Decision ' +
    'Will Determine The Fate Of Millions.',
  role: 'President of the United States',
  briefing:
    'March 2003. Intelligence reports claim Iraq holds chemical weapons. ' +
    'The evidence is disputed, allies are divided and the UN inspectors ' +
    'have asked for more time. The decision is yours.',
  playable: true,
  decisions: [
    {
      id: 'intelligence',
      title: 'The dossier',
      situation:
        'Your advisers present the intelligence as conclusive, but analysts ' +
        'inside the agencies say key sources are unverified.',
      prompt: 'How do you treat the intelligence?',
      options: [
        {
          id: 'act-on-it',
          label: 'Accept the dossier and prepare for military action',
          impact: { courage: 10, risk: 15, ethics: -10, control: 5 },
        },
        {
          id: 'verify',
          label: 'Order an independent review of the sources before deciding',
          impact: { ethics: 10, control: 10, courage: -5 },
        },
        {
          id: 'go-public',
          label: 'Share the uncertainty openly with Congress and the public',
          impact: { ethics: 15, empathy: 5, control: -10 },
        },
        {
          id: 'leak-doubts',
          label: "Quietly leak the analysts' doubts to slow the rush to war",
          impact: { ethics: 5, risk: 10, control: -15 },
        },
        {
          id: 'defer',
          label: 'Let the National Security Council decide and back their call',
          impact: { empathy: 5, courage: -10, control: -10 },
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
      options: [
        {
          id: 'invade',
          label: 'Launch the invasion with a coalition of willing allies',
          impact: { vision: 10, courage: 10, risk: 15, empathy: -10 },
        },
        {
          id: 'extend-inspections',
          label: 'Give the inspectors more time and keep pressure on Iraq',
          impact: { empathy: 10, ethics: 10, risk: -10, vision: -5 },
        },
        {
          id: 'seek-resolution',
          label: 'Push for a second UN resolution before any action',
          impact: { control: 10, ethics: 5, courage: -5 },
        },
        {
          id: 'targeted-strikes',
          label: 'Order limited air strikes on the suspected weapon sites',
          impact: { courage: 5, risk: 10, control: 5, empathy: -5 },
        },
        {
          id: 'back-channel',
          label: 'Open a secret back channel to negotiate with Baghdad',
          impact: { vision: 10, empathy: 5, risk: 5, control: -5 },
        },
      ],
    },
  ],
};

const CUBAN_MISSILE_CRISIS: Scenario = {
  id: 'cuban-missile-crisis',
  title: 'Cuban Missile Crisis (1962)',
  duration: '1:25 min',
  description:
    "A World On The Brink Of Nuclear Annihilation. You Are In Kennedy's Seat.",
  role: 'President of the United States',
  briefing: '',
  playable: false,
  decisions: [],
};

export const SCENARIOS: Scenario[] = [IRAQ_WAR, CUBAN_MISSILE_CRISIS];

export function findScenario(id: string): Scenario | undefined {
  return SCENARIOS.find(scenario => scenario.id === id);
}
