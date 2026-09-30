import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

/*
 * Spider chart drawn with plain Views, so it needs no SVG library. Edges
 * are thin rotated Views; the polygon fill is split into right triangles
 * drawn with the border trick, since a View cannot take an arbitrary shape.
 */

export interface Point {
  x: number;
  y: number;
}

/** Grid rings as shares of the full radius. */
const RINGS = [0.2, 0.4, 0.6, 0.8, 1];
// "Empathy", the widest label, is ~25pt at Inter Bold 6.
const LABEL_WIDTH = 28;
const LABEL_HEIGHT = 7;
/** Gap between the outer ring and the axis labels. */
const LABEL_OFFSET = 6;
const FILL_OPACITY = 0.25; // with colors.primary: rgba(0, 211, 243, 0.25)
/** Overlap between fill triangles; hidden under the 1.5pt outline. */
export const FILL_BLEED = 0.5;

/**
 * Vertex positions for `values` on a `max` scale: the first axis points
 * up and the rest follow clockwise at equal angles.
 */
export function radarVertices(
  values: number[],
  max: number,
  radius: number,
  center: Point,
): Point[] {
  return values.map((value, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / values.length;
    const r = (Math.min(max, Math.max(0, value)) / max) * radius;
    return {
      x: center.x + r * Math.cos(angle),
      y: center.y + r * Math.sin(angle),
    };
  });
}

const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

/** A right triangle with its right angle at `corner`. */
interface RightTriangle {
  corner: Point;
  a: Point;
  b: Point;
}

/**
 * Splits a triangle in two right triangles along the altitude onto its
 * longest side, whose foot always lies on that side.
 */
export function splitTriangle(p: [Point, Point, Point]): RightTriangle[] {
  const sides = [0, 1, 2].map(i => ({
    a: p[i],
    b: p[(i + 1) % 3],
    apex: p[(i + 2) % 3],
  }));
  const { a, b, apex } = sides.reduce((longest, side) =>
    distance(side.a, side.b) > distance(longest.a, longest.b) ? side : longest,
  );
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq < 1e-6) {
    return [];
  }
  const t = ((apex.x - a.x) * dx + (apex.y - a.y) * dy) / lengthSq;
  const foot = { x: a.x + t * dx, y: a.y + t * dy };
  return [
    { corner: foot, a, b: apex },
    { corner: foot, a: b, b: apex },
  ];
}

/**
 * Pushes every side of a right triangle out by `bleed` (scaling about its
 * incentre), so neighbouring fills overlap instead of leaving hairline
 * seams. Thin triangles grow by at most half their inradius, which keeps
 * their sharp tips from spiking out.
 */
export function bleedTriangle(
  { corner, a, b }: RightTriangle,
  bleed: number,
): RightTriangle {
  const w = distance(corner, a);
  const h = distance(corner, b);
  const inradius = (w + h - Math.hypot(w, h)) / 2;
  if (inradius <= 0) {
    return { corner, a, b };
  }
  const grow = Math.min(bleed, inradius / 2);
  const scale = (inradius + grow) / inradius;
  const u = { x: (a.x - corner.x) / w, y: (a.y - corner.y) / w };
  const v = { x: (b.x - corner.x) / h, y: (b.y - corner.y) / h };
  const incentre = {
    x: corner.x + inradius * (u.x + v.x),
    y: corner.y + inradius * (u.y + v.y),
  };
  const grown = (p: Point) => ({
    x: incentre.x + (p.x - incentre.x) * scale,
    y: incentre.y + (p.y - incentre.y) * scale,
  });
  return { corner: grown(corner), a: grown(a), b: grown(b) };
}

function Segment({
  from,
  to,
  color,
  thickness,
}: {
  from: Point;
  to: Point;
  color: string;
  thickness: number;
}) {
  const length = distance(from, to);
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  return (
    <View
      style={[
        styles.segment,
        {
          left: (from.x + to.x) / 2 - length / 2,
          top: (from.y + to.y) / 2 - thickness / 2,
          width: length,
          height: thickness,
          backgroundColor: color,
          transform: [{ rotate: `${angle}rad` }],
        },
      ]}
    />
  );
}

/**
 * The border trick draws a w×h right triangle with its right angle at the
 * box's bottom-left, one leg along +x and one up. It is rotated so the
 * legs land on `a` and `b`, swapping them if needed to avoid a mirror.
 */
function TriangleFill({ corner, a, b }: RightTriangle) {
  let w = distance(corner, a);
  let h = distance(corner, b);
  if (w < 0.01 || h < 0.01) {
    return null;
  }
  let u = { x: (a.x - corner.x) / w, y: (a.y - corner.y) / w };
  const v = { x: (b.x - corner.x) / h, y: (b.y - corner.y) / h };
  // The box's "up" leg is +x turned a quarter counter-clockwise on
  // screen, which makes this cross product negative.
  if (u.x * v.y - u.y * v.x > 0) {
    u = v;
    [w, h] = [h, w];
  }
  const cos = u.x;
  const sin = u.y;
  // Rotation is about the box centre; place it so the corner lands.
  const cx = corner.x - (-(w / 2) * cos - (h / 2) * sin);
  const cy = corner.y - (-(w / 2) * sin + (h / 2) * cos);
  return (
    <View
      style={[
        styles.triangle,
        {
          left: cx - w / 2,
          top: cy - h / 2,
          borderRightWidth: w,
          borderBottomWidth: h,
          transform: [{ rotate: `${Math.atan2(sin, cos)}rad` }],
        },
      ]}
    />
  );
}

export function RadarChart({
  values,
  labels,
  max,
  width,
  height,
}: {
  values: number[];
  labels: string[];
  max: number;
  width: number;
  height: number;
}) {
  const center = { x: width / 2, y: height / 2 };
  const full = values.map(() => max);
  // The largest radius that keeps every label inside the box: the top and
  // bottom labels stack above and below their axes, the side ones start
  // at their axis point, 30° off the horizontal.
  const sideReach = Math.cos(Math.PI / 6);
  const radius = Math.min(
    height / 2 - LABEL_OFFSET - LABEL_HEIGHT,
    (width / 2 - LABEL_WIDTH) / sideReach - LABEL_OFFSET,
  );
  const outer = radarVertices(full, max, radius, center);
  const labelPoints = radarVertices(full, max, radius + LABEL_OFFSET, center);
  const shape = radarVertices(values, max, radius, center);

  return (
    <View
      style={{ width, height }}
      testID="radar-chart"
      accessible
      accessibilityLabel={labels
        .map((label, i) => `${label} ${values[i]}`)
        .join(', ')}
    >
      {RINGS.map(ring => {
        const points = radarVertices(full, max, radius * ring, center);
        return points.map((point, i) => (
          <Segment
            key={`ring-${ring}-${i}`}
            from={point}
            to={points[(i + 1) % points.length]}
            color={ring === 1 ? colors.headerSeparator : colors.divider}
            thickness={1}
          />
        ));
      })}
      {outer.map((point, i) => (
        <Segment
          key={`spoke-${i}`}
          from={center}
          to={point}
          color={colors.divider}
          thickness={1}
        />
      ))}

      {/* Solid triangles faded as one layer, so their overlaps and seams
          do not stack alpha. */}
      <View
        style={[StyleSheet.absoluteFill, styles.fill]}
        needsOffscreenAlphaCompositing
        pointerEvents="none"
      >
        {shape.flatMap((point, i) =>
          splitTriangle([center, point, shape[(i + 1) % shape.length]]).map(
            (triangle, j) => (
              <TriangleFill
                key={`fill-${i}-${j}`}
                {...bleedTriangle(triangle, FILL_BLEED)}
              />
            ),
          ),
        )}
      </View>

      {shape.map((point, i) => (
        <Segment
          key={`edge-${i}`}
          from={point}
          to={shape[(i + 1) % shape.length]}
          color={colors.primary}
          thickness={1.5}
        />
      ))}
      {shape.map((point, i) => (
        <View
          key={`vertex-${i}`}
          testID={`radar-vertex-${i}`}
          style={[styles.vertex, { left: point.x - 2.5, top: point.y - 2.5 }]}
        />
      ))}

      {labelPoints.map((point, i) => {
        // Push each label outwards from its vertex along the axis.
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        const left =
          Math.abs(dx) < 1
            ? point.x - LABEL_WIDTH / 2
            : dx > 0
            ? point.x
            : point.x - LABEL_WIDTH;
        const top =
          Math.abs(dx) < 1
            ? dy < 0
              ? point.y - LABEL_HEIGHT
              : point.y
            : point.y - LABEL_HEIGHT / 2;
        return (
          <Text
            key={`label-${i}`}
            style={[
              styles.label,
              { left, top },
              Math.abs(dx) < 1
                ? styles.labelCenter
                : dx > 0
                ? styles.labelLeft
                : styles.labelRight,
            ]}
            numberOfLines={1}
          >
            {labels[i]}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    opacity: FILL_OPACITY,
  },
  segment: {
    position: 'absolute',
  },
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderRightColor: 'transparent',
    borderBottomColor: colors.primary,
  },
  vertex: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
  },
  label: {
    ...androidTextFix,
    position: 'absolute',
    width: LABEL_WIDTH,
    height: LABEL_HEIGHT,
    color: colors.radarLabel,
    fontFamily: fonts.bold,
    fontSize: 6,
    lineHeight: 6,
    letterSpacing: 0,
  },
  labelCenter: { textAlign: 'center' },
  labelLeft: { textAlign: 'left' },
  labelRight: { textAlign: 'right' },
});
