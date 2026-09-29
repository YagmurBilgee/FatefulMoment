/**
 * @format
 */

import React from 'react';
import { StyleSheet } from 'react-native';
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
  selectDnaProfile,
} from '../src/data/simulation';
import { DnaProfileScreen } from '../src/screens/DnaProfileScreen';
import { ScenarioProgressProvider } from '../src/state/ScenarioProgress';

// The screen's drawer navigates; outside a navigator a stub will do.
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), reset: jest.fn() }),
}));

const { act } = ReactTestRenderer;

const textOf = (children: unknown): string =>
  Array.isArray(children) ? children.map(textOf).join('') : String(children);

const texts = (root: ReactTestInstance) =>
  root
    .findAll(n => typeof n.type === 'string' && n.props.children != null)
    .map(n => textOf(n.props.children));

const area = ([a, b, c]: Point[]) =>
  Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2;

async function render(params: { score?: DnaScore; timedOut?: boolean }) {
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
  test('shows the Figma default before playing', () => {
    expect(selectDnaProfile({}).id).toBe('brave-visionary');
  });

  test('a timeout makes a Crisis Survivor whatever the score', () => {
    const bold = applyImpacts(BASELINE_DNA, [{ courage: 20, risk: 20 }]);
    expect(selectDnaProfile({ score: bold, timedOut: true }).id).toBe(
      'crisis-survivor',
    );
  });

  test('bold picks make a visionary, cautious ones a strategist', () => {
    const bold = applyImpacts(BASELINE_DNA, [
      { courage: 10, risk: 15, ethics: -10 },
    ]);
    const cautious = applyImpacts(BASELINE_DNA, [
      { control: 10, courage: 5, risk: 5, ethics: 5 },
    ]);
    expect(selectDnaProfile({ score: bold }).id).toBe('brave-visionary');
    expect(selectDnaProfile({ score: cautious }).id).toBe(
      'pragmatic-strategist',
    );
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
  const width = 180;
  const height = 136;
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

describe('DnaProfileScreen', () => {
  test.each([
    ['no play', {}, DNA_PROFILES['brave-visionary']],
    [
      'cautious',
      { score: applyImpacts(BASELINE_DNA, [{ control: 20 }]) },
      DNA_PROFILES['pragmatic-strategist'],
    ],
    [
      'timed out',
      { score: BASELINE_DNA, timedOut: true },
      DNA_PROFILES['crisis-survivor'],
    ],
  ])('draws the %s path as its profile', async (_, params, profile) => {
    const renderer = await render(params);
    const root = renderer.root;
    const shown = texts(root);

    expect(shown).toContain(profile.archetype);
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
    const first = await render({});
    const visionary = vertexCentres(first.root);
    await act(() => first.unmount());

    const second = await render({ score: BASELINE_DNA, timedOut: true });
    const survivor = vertexCentres(second.root);
    await act(() => second.unmount());

    // Vision drops from 88 to 35, so the top vertex moves down.
    expect(survivor[0].y).toBeGreaterThan(visionary[0].y);
    // Ethics rises from 31 to 65, so its vertex moves outwards.
    expect(survivor[5].x).toBeLessThan(visionary[5].x);
  });
});
