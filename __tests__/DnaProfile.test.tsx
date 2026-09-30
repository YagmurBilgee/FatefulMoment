/**
 * @format
 */

import React from 'react';
import { Image, StyleSheet } from 'react-native';
import ReactTestRenderer, { ReactTestInstance } from 'react-test-renderer';

import {
  FILL_BLEED,
  Point,
  RadarChart,
  bleedTriangle,
  radarVertices,
  splitTriangle,
} from '../src/components/RadarChart';
import { LanguageProvider } from '../src/context/LanguageContext';
import {
  BASELINE_DNA,
  DNA_DIMENSIONS,
  DNA_MAX,
  DNA_PROFILES,
  DnaProfile,
  DnaScore,
  applyImpacts,
  findScenario,
  nextBrowsedProfile,
  selectDnaProfile,
} from '../src/data/simulation';
import { DnaProfileScreen } from '../src/screens/DnaProfileScreen';
import { ScenarioProgressProvider } from '../src/state/ScenarioProgress';

// The screen's drawer navigates; outside a navigator a stub will do.
const mockNavigation = {
  navigate: jest.fn(),
  reset: jest.fn(),
  popTo: jest.fn(),
  getState: jest.fn(() => ({ routes: [{ name: 'DnaProfile' }] })),
};
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

const { act } = ReactTestRenderer;

const textOf = (children: unknown): string =>
  Array.isArray(children) ? children.map(textOf).join('') : String(children);

const texts = (root: ReactTestInstance) =>
  root
    .findAll(n => typeof n.type === 'string' && n.props.children != null)
    .map(n => textOf(n.props.children));

/** Score after picking these Iraq War options, first pick then review. */
const iraqPath = (...ids: string[]): DnaScore => {
  const options = findScenario('iraq-war')!.decisions[0].options;
  return applyImpacts(
    BASELINE_DNA,
    ids.map(id => options.find(option => option.id === id)!.impact),
  );
};

const area = ([a, b, c]: Point[]) =>
  Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2;

async function render(params: { score?: DnaScore }) {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(() => {
    renderer = ReactTestRenderer.create(
      <LanguageProvider>
        <ScenarioProgressProvider>
          <DnaProfileScreen
            route={{ key: 'dna', name: 'DnaProfile', params }}
            navigation={{} as never}
          />
        </ScenarioProgressProvider>
      </LanguageProvider>,
    );
  });
  return renderer;
}

/** Vertex dot centres, in axis order. */
const vertexCentres = (root: ReactTestInstance): Point[] =>
  DNA_DIMENSIONS.map((_, i) => {
    const node = root.find(
      n => typeof n.type === 'string' && n.props.testID === `radar-vertex-${i}`,
    );
    const { left, top, width } = StyleSheet.flatten(node.props.style);
    return { x: left + width / 2, y: top + width / 2 };
  });

describe('selectDnaProfile', () => {
  test.each([
    ['vision and courage', { vision: 20, courage: 20 }, 'brave-visionary'],
    ['risk and control', { risk: 20, control: 20 }, 'pragmatic-strategist'],
    ['empathy and ethics', { empathy: 20, ethics: 20 }, 'empathetic-leader'],
  ] as const)('a lead in %s picks %s', (_, impact, id) => {
    expect(selectDnaProfile(applyImpacts(BASELINE_DNA, [impact])).id).toBe(id);
  });

  test('the highest pair wins, not the highest single dimension', () => {
    // Courage alone is the top score, but risk + control sums higher.
    const score = applyImpacts(BASELINE_DNA, [
      { courage: 25, vision: -10, risk: 12, control: 12 },
    ]);
    expect(selectDnaProfile(score).id).toBe('pragmatic-strategist');
  });

  test.each([
    ['launch-on-schedule', 'sonar-signal'],
    ['sonar-signal', 'launch-on-schedule'],
  ])('the bold Iraq War path %s → %s reaches Brave Visionary', (a, b) => {
    const score = iraqPath(a, b);
    expect(score.vision).toBeGreaterThanOrEqual(80);
    expect(score.courage).toBeGreaterThanOrEqual(80);
    expect(selectDnaProfile(score).id).toBe('brave-visionary');
  });

  test.each([
    ['naval-quarantine', 'wait-for-moscow'],
    ['naval-quarantine', 'sonar-signal'],
  ])('the cautious Iraq War path %s → %s stays Pragmatic', (a, b) => {
    expect(selectDnaProfile(iraqPath(a, b)).id).toBe('pragmatic-strategist');
  });

  test('ties go to Brave Visionary', () => {
    expect(selectDnaProfile(BASELINE_DNA).id).toBe('brave-visionary');
  });

  test('drawer visits cycle through every archetype', () => {
    const visits = [1, 2, 3, 4].map(() => nextBrowsedProfile().id);
    expect(new Set(visits.slice(0, 3)).size).toBe(3);
    expect(visits[3]).toBe(visits[0]);
  });

  test.each(Object.values(DNA_PROFILES))(
    '$archetype names its lowest score as the blind spot',
    (profile: DnaProfile) => {
      const lowest = Math.min(...Object.values(profile.scores));
      expect(profile.scores[profile.blindSpot]).toBe(lowest);
    },
  );
});

describe('radar geometry', () => {
  const center = { x: 50, y: 50 };

  test('the first axis points up and the scale is linear', () => {
    const [top, right] = radarVertices([100, 50], 100, 40, center);
    expect(top.x).toBeCloseTo(50);
    expect(top.y).toBeCloseTo(10);
    // Two axes: the second is half a turn round, pointing down.
    expect(right.x).toBeCloseTo(50);
    expect(right.y).toBeCloseTo(70);
  });

  test('the right-triangle split covers each sector exactly', () => {
    const shape = radarVertices([88, 82, 79, 55, 38, 31], 100, 40, center);
    shape.forEach((point, i) => {
      const sector: [Point, Point, Point] = [
        center,
        point,
        shape[(i + 1) % shape.length],
      ];
      const parts = splitTriangle(sector);
      expect(parts).toHaveLength(2);
      const total = parts.reduce(
        (sum, { corner, a, b }) => sum + area([corner, a, b]),
        0,
      );
      expect(total).toBeCloseTo(area(sector));
      parts.forEach(({ corner, a, b }) => {
        // Right angle at the corner.
        const dot =
          (a.x - corner.x) * (b.x - corner.x) +
          (a.y - corner.y) * (b.y - corner.y);
        expect(dot).toBeCloseTo(0);
      });
    });
  });
});

test('bleeding a fill triangle grows it around the original', () => {
  const original = {
    corner: { x: 0, y: 0 },
    a: { x: 30, y: 0 },
    b: { x: 0, y: 20 },
  };
  const grown = bleedTriangle(original, 0.5);
  // Legs stay perpendicular and every original vertex lies inside.
  const u = { x: grown.a.x - grown.corner.x, y: grown.a.y - grown.corner.y };
  const v = { x: grown.b.x - grown.corner.x, y: grown.b.y - grown.corner.y };
  expect(u.x * v.x + u.y * v.y).toBeCloseTo(0);
  expect(grown.corner.x).toBeCloseTo(-0.5);
  expect(grown.corner.y).toBeCloseTo(-0.5);
  // The legs keep their directions, so the grown triangle is still
  // axis-aligned: inside means x/W + y/H <= 1 from its corner.
  const W = grown.a.x - grown.corner.x;
  const H = grown.b.y - grown.corner.y;
  for (const p of [original.corner, original.a, original.b]) {
    const x = p.x - grown.corner.x;
    const y = p.y - grown.corner.y;
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
    expect(x / W + y / H).toBeLessThan(1);
  }
});

describe('RadarChart', () => {
  test('each fill triangle lands on its part of the polygon', async () => {
    const values = [88, 82, 79, 55, 38, 31];
    const width = 180;
    const height = 136;
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(() => {
      renderer = ReactTestRenderer.create(
        <RadarChart
          values={values}
          labels={values.map(String)}
          max={DNA_MAX}
          width={width}
          height={height}
        />,
      );
    });

    // Undo the border trick: the box's bottom-left corner and the ends of
    // its bottom and left edges, turned about the box centre.
    const drawn = renderer.root
      .findAll(
        n =>
          typeof n.type === 'string' &&
          StyleSheet.flatten(n.props.style)?.borderBottomWidth > 0,
      )
      .map(n => {
        const style = StyleSheet.flatten(n.props.style);
        const w = style.borderRightWidth;
        const h = style.borderBottomWidth;
        const angle = parseFloat(style.transform[0].rotate);
        const cx = style.left + w / 2;
        const cy = style.top + h / 2;
        return [
          [-w / 2, h / 2],
          [w / 2, h / 2],
          [-w / 2, -h / 2],
        ].map(([x, y]) => ({
          x: cx + x * Math.cos(angle) - y * Math.sin(angle),
          y: cy + x * Math.sin(angle) + y * Math.cos(angle),
        }));
      });

    const center = { x: width / 2, y: height / 2 };
    const chart = StyleSheet.flatten(
      renderer.root.find(n => n.props.testID === 'radar-chart').props.style,
    );
    expect(chart.width).toBe(width);
    expect(chart.height).toBe(height);
    // Same radius the chart uses: what is left after the labels.
    const top = renderer.root.find(n => n.props.testID === 'radar-vertex-0');
    const radius =
      (center.y - (StyleSheet.flatten(top.props.style).top + 2.5)) /
      (values[0] / DNA_MAX);
    const shape = radarVertices(values, DNA_MAX, radius, center);
    const expected = shape.flatMap((point, i) =>
      splitTriangle([center, point, shape[(i + 1) % shape.length]]).map(
        triangle => {
          const { corner, a, b } = bleedTriangle(triangle, FILL_BLEED);
          return [corner, a, b];
        },
      ),
    );

    expect(drawn).toHaveLength(expected.length);
    const same = (p: Point, q: Point) =>
      Math.abs(p.x - q.x) < 1e-6 && Math.abs(p.y - q.y) < 1e-6;
    expected.forEach(triangle => {
      const match = drawn.some(
        d =>
          same(d[0], triangle[0]) &&
          triangle.slice(1).every(p => d.slice(1).some(q => same(p, q))),
      );
      expect(match).toBe(true);
    });

    await act(() => renderer.unmount());
  });
});

test('axis labels stay inside the chart box', async () => {
  // The Figma canvas on the DNA screen.
  const width = 149;
  const height = 115;
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(() => {
    renderer = ReactTestRenderer.create(
      <RadarChart
        values={[88, 82, 79, 55, 38, 31]}
        labels={['Vision', 'Courage', 'Risk', 'Control', 'Empathy', 'Ethics']}
        max={DNA_MAX}
        width={width}
        height={height}
      />,
    );
  });
  const labels = renderer.root.findAll(
    n =>
      typeof n.type === 'string' &&
      typeof n.props.children === 'string' &&
      n.props.numberOfLines === 1,
  );
  expect(labels).toHaveLength(6);
  for (const label of labels) {
    const style = StyleSheet.flatten(label.props.style);
    expect(style.left).toBeGreaterThanOrEqual(0);
    expect(style.top).toBeGreaterThanOrEqual(0);
    expect(style.left + style.width).toBeLessThanOrEqual(width);
    expect(style.top + style.height).toBeLessThanOrEqual(height);
  }
  await act(() => renderer.unmount());
});

describe('DNA screen drawer', () => {
  beforeEach(() => jest.clearAllMocks());

  const pressable = (root: ReactTestInstance, label: string) =>
    root.find(n => n.props.accessibilityLabel === label && n.props.onPress);

  const openMenu = async (root: ReactTestInstance) => {
    await act(() => pressable(root, 'Open menu').props.onPress());
  };

  test('tapping the backdrop closes the drawer', async () => {
    const renderer = await render({});
    const root = renderer.root;
    await openMenu(root);
    expect(pressable(root, 'Open menu').props.accessibilityState.expanded).toBe(
      true,
    );

    await act(() => pressable(root, 'Close menu').props.onPress());
    expect(pressable(root, 'Open menu').props.accessibilityState.expanded).toBe(
      false,
    );
    await act(() => renderer.unmount());
  });

  test('the open drawer covers the menu button', async () => {
    const renderer = await render({});
    const root = renderer.root;
    await openMenu(root);
    // Siblings paint in order, so the button must come before the panel and
    // must not be lifted above it.
    const hosts = root.findAll(n => typeof n.type === 'string');
    const button = pressable(root, 'Open menu');
    const panel = root.find(
      n => typeof n.type === 'string' && n.props.accessibilityViewIsModal,
    );
    expect(hosts.indexOf(button)).toBeLessThan(hosts.indexOf(panel));
    for (let n: ReactTestInstance | null = button; n; n = n.parent) {
      if (typeof n.type === 'string') {
        expect(StyleSheet.flatten(n.props.style)?.zIndex).toBeUndefined();
      }
    }
    await act(() => renderer.unmount());
  });

  test('Scenarios pops back when it is under the DNA screen', async () => {
    mockNavigation.getState.mockReturnValueOnce({
      routes: [
        { name: 'Scenarios', params: { user: 'u' } },
        { name: 'DnaProfile' },
      ],
    } as never);
    const renderer = await render({});
    await openMenu(renderer.root);
    await act(() => pressable(renderer.root, 'SCENARIOS').props.onPress());
    expect(mockNavigation.popTo).toHaveBeenCalledWith('Scenarios', {
      user: 'u',
    });
    expect(mockNavigation.reset).not.toHaveBeenCalled();
    await act(() => renderer.unmount());
  });

  test('Scenarios becomes the root when the stack has no Scenarios', async () => {
    const renderer = await render({});
    await openMenu(renderer.root);
    await act(() => pressable(renderer.root, 'SCENARIOS').props.onPress());
    expect(mockNavigation.popTo).not.toHaveBeenCalled();
    expect(mockNavigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Scenarios', params: {} }],
    });
    await act(() => renderer.unmount());
  });
});

describe('DnaProfileScreen', () => {
  test.each([
    [
      'bold',
      { score: iraqPath('launch-on-schedule', 'sonar-signal') },
      DNA_PROFILES['brave-visionary'],
    ],
    [
      'cautious',
      { score: applyImpacts(BASELINE_DNA, [{ control: 20 }]) },
      DNA_PROFILES['pragmatic-strategist'],
    ],
    [
      'caring',
      { score: applyImpacts(BASELINE_DNA, [{ empathy: 20 }]) },
      DNA_PROFILES['empathetic-leader'],
    ],
  ])('draws the %s path as its profile', async (_, params, profile) => {
    const renderer = await render(params);
    const root = renderer.root;
    const shown = texts(root);

    expect(shown).toContain(profile.archetype);
    const avatar = root.find(
      n =>
        typeof n.type === 'string' &&
        n.props.style?.width === 64 &&
        n.props.source,
    );
    expect(avatar.props.source).toEqual(
      Image.resolveAssetSource(
        {
          'brave-visionary': require('../src/assets/images/avatar-brave-visionary.png'),
          'pragmatic-strategist': require('../src/assets/images/avatar-pragmatic-strategist.png'),
          'empathetic-leader': require('../src/assets/images/avatar-empathetic-leader.png'),
        }[profile.id],
      ),
    );
    expect(shown).toContain(`BLIND SPOT — ${profile.blindSpot.toUpperCase()}`);
    for (const dimension of DNA_DIMENSIONS) {
      const row = root.find(
        n =>
          typeof n.type === 'string' &&
          n.props.accessibilityLabel ===
            `${dimension[0].toUpperCase()}${dimension.slice(1)} ${
              profile.scores[dimension]
            } of ${DNA_MAX}`,
      );
      expect(row).toBeTruthy();
    }

    // The polygon's vertices sit where the profile's scores put them.
    const chart = root.find(
      n => typeof n.type === 'string' && n.props.testID === 'radar-chart',
    );
    const { width, height } = StyleSheet.flatten(chart.props.style);
    const cx = width / 2;
    const cy = height / 2;
    const centres = vertexCentres(root);
    const expected = DNA_DIMENSIONS.map(d => profile.scores[d]);
    const unit = radarVertices(
      expected.map(() => DNA_MAX),
      DNA_MAX,
      1,
      { x: 0, y: 0 },
    );
    centres.forEach((point, i) => {
      const r = Math.hypot(point.x - cx, point.y - cy);
      const direction = {
        x: (point.x - cx) / r,
        y: (point.y - cy) / r,
      };
      expect(direction.x).toBeCloseTo(unit[i].x);
      expect(direction.y).toBeCloseTo(unit[i].y);
      // Radii share one scale, so their ratios match the scores'.
      const r0 = Math.hypot(centres[0].x - cx, centres[0].y - cy);
      expect(r / r0).toBeCloseTo(expected[i] / expected[0]);
    });

    await act(() => renderer.unmount());
  });

  test('switching profiles reshapes the polygon', async () => {
    const first = await render({ score: BASELINE_DNA });
    const visionary = vertexCentres(first.root);
    await act(() => first.unmount());

    const second = await render({
      score: applyImpacts(BASELINE_DNA, [{ empathy: 20 }]),
    });
    const leader = vertexCentres(second.root);
    await act(() => second.unmount());

    // Vision drops from 88 to 57, so the top vertex moves down.
    expect(leader[0].y).toBeGreaterThan(visionary[0].y);
    // Ethics rises from 31 to 81, so its vertex moves outwards.
    expect(leader[5].x).toBeLessThan(visionary[5].x);
  });

  test('a drawer visit shows the next archetype and keeps it', async () => {
    const archetypes = Object.values(DNA_PROFILES).map(p => p.archetype);
    const renderer = await render({});
    const shownBefore = texts(renderer.root).find(t => archetypes.includes(t));
    expect(shownBefore).toBeDefined();
    // Opening and closing the menu re-renders; the archetype must not change.
    await act(() =>
      renderer.root
        .find(
          n => n.props.accessibilityLabel === 'Open menu' && n.props.onPress,
        )
        .props.onPress(),
    );
    expect(texts(renderer.root)).toContain(shownBefore);
    await act(() => renderer.unmount());
  });
});
