import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

type ScenarioProgress = {
  /** Scenarios the user has played to the end in this session. */
  completedScenarioIds: string[];
  markCompleted: (scenarioId: string) => void;
  /** Clears progress, e.g. on sign out. */
  resetProgress: () => void;
};

const ScenarioProgressContext = createContext<ScenarioProgress | null>(null);

/**
 * In-memory completion state shared by the Scenarios and Simulation
 * screens. There is no backend, so it lasts until the app is closed or the
 * user signs out.
 */
export function ScenarioProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [completedScenarioIds, setCompleted] = useState<string[]>([]);

  const value = useMemo<ScenarioProgress>(
    () => ({
      completedScenarioIds,
      markCompleted: scenarioId =>
        setCompleted(ids =>
          ids.includes(scenarioId) ? ids : [...ids, scenarioId],
        ),
      resetProgress: () => setCompleted([]),
    }),
    [completedScenarioIds],
  );

  return (
    <ScenarioProgressContext.Provider value={value}>
      {children}
    </ScenarioProgressContext.Provider>
  );
}

export function useScenarioProgress(): ScenarioProgress {
  const progress = useContext(ScenarioProgressContext);
  if (!progress) {
    throw new Error(
      'useScenarioProgress must be used inside ScenarioProgressProvider',
    );
  }
  return progress;
}
