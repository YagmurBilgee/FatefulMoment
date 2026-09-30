/**
 * English UI copy, the default language. Its keys define the dictionary:
 * every other language must provide the same keys (checked by TypeScript).
 * `{name}` marks a value filled in by `t(key, { name })`.
 */
export const en = {
  // Scenarios (Home)
  scenariosTitle: 'Scenarios',
  scenariosSubtitle:
    'Choose A Scenario And Ask Yourself, "If You Were In That Situation, What Would You Do?"',
  // Figma copy; the total is a design figure, not derived from local data.
  scenarioCount: '30 Scenarios',
  comingSoonTitle: 'Coming Soon',
  comingSoonMessage: 'This scenario will be added very soon.',
  start: 'Start',
  startScenario: 'Start {title}',

  // Simulation
  scenarioBriefing: 'Scenario Briefing',
  startSimulation: 'Start Simulation',
  scenarioUnavailable: 'Scenario unavailable',
  scenarioComingSoon: 'This scenario is coming soon.',
  yourChoice: 'Your Choice',

  // Navigation drawer and settings
  drawerScenarios: 'SCENARIOS',
  drawerDna: 'DNA',
  drawerSettings: 'SETTINGS',
  language: 'Language',
  signOut: 'Sign Out',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  goBack: 'Go back',

  // DNA profile. Card titles are stored in capitals; see simulation.ts.
  dnaTitle: 'Decision DNA',
  dnaMatrix: 'PSYCHOLOGICAL MATRIX',
  dnaPatterns: 'PATTERN DETECTION',
  dnaBlindSpot: 'BLIND SPOT — {dimension}',
  dnaScore: '{dimension} {value} of {max}',
  dnaVision: 'Vision',
  dnaCourage: 'Courage',
  dnaRisk: 'Risk',
  dnaControl: 'Control',
  dnaEmpathy: 'Empathy',
  dnaEthics: 'Ethics',

  // Audio status pill
  standby: 'STANDBY',
};
