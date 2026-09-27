/**
 * Local scenario data and the DNA scoring model. There is no backend: all
 * content and scores live here and in component state.
 *
 * Scenario copy is placeholder demo content until the final texts are
 * provided; the Apollo 13 situations follow the real mission, but the
 * option wording and DNA impacts are illustrative.
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

export type CategoryId =
  | 'history-war'
  | 'business-world'
  | 'crisis-security'
  | 'science';

export interface Category {
  id: CategoryId;
  title: string;
}

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

export interface Scenario {
  id: string;
  categoryId: CategoryId;
  title: string;
  /** The player's role in the scenario. */
  role: string;
  /** One-line teaser on the scenario card. */
  summary: string;
  /** Estimated play time shown on the card, e.g. "1:30 min". */
  duration?: string;
  briefing: string;
  /** `false` renders the card as "Coming Soon". */
  playable: boolean;
  decisions: DecisionNode[];
}

export const CATEGORIES: Category[] = [
  { id: 'history-war', title: 'History & War' },
  { id: 'business-world', title: 'Business World' },
  { id: 'crisis-security', title: 'Crisis & Security' },
  { id: 'science', title: 'Science' },
];

const APOLLO_13: Scenario = {
  id: 'apollo-13',
  // Shown under History & War, the only open category in the demo.
  categoryId: 'history-war',
  title: 'Apollo 13',
  role: 'Flight Director, Mission Control',
  summary:
    '1970. Oxygen tank explosion in deep space. Bring three astronauts home alive.',
  duration: '1:30 min',
  briefing:
    'April 1970. Apollo 13 is on its way to the Moon when an oxygen tank ' +
    'in the Service Module fails. Three astronauts are 200,000 miles from ' +
    'Earth and every call you make from Houston matters.',
  playable: true,
  decisions: [
    {
      id: 'power-loss',
      title: 'Houston, we have a problem',
      situation:
        'Oxygen is venting into space and the Command Module fuel cells are ' +
        'dying. The crew is waiting for instructions.',
      prompt: 'How do you keep the crew alive?',
      options: [
        {
          id: 'lifeboat',
          label:
            'Power down the Command Module and use the Lunar Module as a lifeboat',
          impact: { vision: 10, control: 10, courage: 5 },
        },
        {
          id: 'direct-abort',
          label: 'Fire the main engine now for an immediate direct abort',
          impact: { courage: 10, risk: 15, control: -10, vision: -5 },
        },
        {
          id: 'restore-cells',
          label: 'Keep troubleshooting the fuel cells before committing',
          impact: { control: 5, vision: -10, courage: -5, risk: -5 },
        },
      ],
    },
    {
      id: 'co2-scrubbers',
      title: 'The air is running out',
      situation:
        'Carbon dioxide is building up in the Lunar Module. The square ' +
        'Command Module filters do not fit its round sockets.',
      prompt: 'What do you tell the crew?',
      options: [
        {
          id: 'improvise-adapter',
          label:
            'Have engineers build an adapter from onboard items and talk the crew through it',
          impact: { vision: 10, empathy: 10, control: 5, courage: 5 },
        },
        {
          id: 'share-the-truth',
          label:
            'Tell the crew the full situation and ration activity while a fix is found',
          impact: { ethics: 15, empathy: 5, control: -5 },
        },
        {
          id: 'return-to-cm',
          label:
            'Move the crew back to the cold Command Module for fresh filters',
          impact: { risk: 10, courage: 5, empathy: -10, control: -5 },
        },
      ],
    },
  ],
};

/** Listed but not playable yet ("Soon"). */
const upcoming = (
  id: string,
  categoryId: CategoryId,
  title: string,
): Scenario => ({
  id,
  categoryId,
  title,
  role: '',
  summary: '',
  briefing: '',
  playable: false,
  decisions: [],
});

/** One placeholder per remaining category until more scenarios exist. */
const comingSoon = (categoryId: CategoryId): Scenario =>
  upcoming(`${categoryId}-coming-soon`, categoryId, 'Coming Soon');

export const SCENARIOS: Scenario[] = [
  APOLLO_13,
  upcoming('cuban-missile-crisis', 'history-war', 'Cuban Missile Crisis'),
  upcoming('iraq-war', 'history-war', 'Iraq War'),
  comingSoon('business-world'),
  comingSoon('crisis-security'),
  comingSoon('science'),
];

export function scenariosIn(categoryId: CategoryId): Scenario[] {
  return SCENARIOS.filter(scenario => scenario.categoryId === categoryId);
}

/** A category opens only when it has at least one playable scenario. */
export function isCategoryAvailable(categoryId: CategoryId): boolean {
  return scenariosIn(categoryId).some(scenario => scenario.playable);
}

export function findScenario(id: string): Scenario | undefined {
  return SCENARIOS.find(scenario => scenario.id === id);
}
