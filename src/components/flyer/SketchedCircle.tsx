import React, { useEffect, useState } from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, Mask, Path, Rect, Image as SvgImage } from 'react-native-svg';

const ART_WIDTH = 720;
const ART_HEIGHT = 821;


const ringImage = require('../../../assets/images/flyer/highlight-ring.png');

// Centerline of the artwork's stroke in drawing order: from the top starting tip, clockwise,
// to the ending tip that crosses just underneath it. Re-trace if the artwork changes.
// The admin app keeps the same trace in components/flyer/highlight-ring.ts.
const PEN_PATH: [number, number][] = [
  [190, 26], [264, 25], [320, 28], [373, 35], [424, 48], [473, 64], [519, 84], [564, 108],
  [603, 141], [635, 179], [661, 223], [679, 269], [693, 315], [700, 363], [703, 411],
  [703, 459], [698, 507], [688, 557], [672, 605], [648, 653], [617, 695], [577, 733],
  [530, 760], [480, 780], [427, 793], [373, 796], [320, 793], [267, 784], [216, 768],
  [168, 743], [125, 711], [89, 672], [61, 628], [41, 580], [27, 532], [20, 483], [17, 434],
  [18, 387], [23, 339], [31, 291], [46, 244], [65, 196], [90, 150], [125, 110], [168, 78],
  [214, 63], [240, 60], [265, 59],
];
// Number of segments that make up the ending tip, beside the starting one
const TAIL_SEGMENTS = 5;
// Everything around the starting tip that belongs to the ending stroke. Kept hidden while
// the pen starts, so no part of the ending shows up early.
const ENDING_TIP_AREA =
  'M 80 0 L 197 0 L 212 37 L 232 46 L 250 52 L 270 54 L 270 130 L 80 130 Z';

const toPathData = (points: [number, number][]) =>
  points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
const pathLength = (points: [number, number][]) =>
  points
    .slice(1)
    .reduce((total, [x, y], i) => total + Math.hypot(x - points[i][0], y - points[i][1]), 0);

const TAIL_PATH = PEN_PATH.slice(-(TAIL_SEGMENTS + 1));
const PEN_D = toPathData(PEN_PATH);
const TAIL_D = toPathData(TAIL_PATH);
const PEN_LENGTH = pathLength(PEN_PATH);
const TAIL_LENGTH = pathLength(TAIL_PATH);
// Slightly wider than the artwork's thickest part, so the whole stroke is uncovered
const PEN_REVEAL_WIDTH = 68;
const PEN_DRAW_MS = 250;

interface SketchedCircleProps {
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
}

/** The marker ring around the selected product, drawn on as if by hand. */
export const SketchedCircle: React.FC<SketchedCircleProps> = ({ width, height, style }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let startTime: number | null = null;

    const step = (now: number) => {
      startTime ??= now;
      const t = Math.min(1, (now - startTime) / PEN_DRAW_MS);
      // Ease in and out, like a pen setting off and slowing as it closes the loop
      setProgress(t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const drawn = PEN_LENGTH * progress;
  const tailDrawn = Math.max(0, drawn - (PEN_LENGTH - TAIL_LENGTH));

  return (
    <View pointerEvents="none" style={[styles.container, { width, height }, style]}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${ART_WIDTH} ${ART_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <Defs>
          <Mask
            id="pen-reveal"
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={ART_WIDTH}
            height={ART_HEIGHT}
          >
            <Path
              d={PEN_D}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={PEN_REVEAL_WIDTH}
              strokeLinejoin="round"
              strokeDasharray={[PEN_LENGTH, PEN_LENGTH]}
              strokeDashoffset={PEN_LENGTH - drawn}
            />
            {/* Hide the ending tip from the starting stroke, then draw it when the pen returns */}
            <Path d={ENDING_TIP_AREA} fill="#000000" />
            <Path
              d={TAIL_D}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={PEN_REVEAL_WIDTH}
              strokeLinejoin="round"
              strokeDasharray={[TAIL_LENGTH, TAIL_LENGTH]}
              strokeDashoffset={TAIL_LENGTH - tailDrawn}
              opacity={tailDrawn > 0 ? 1 : 0}
            />
            {/* Once drawn, show the artwork untouched, including its slanted tips */}
            <Rect
              width={ART_WIDTH}
              height={ART_HEIGHT}
              fill="#FFFFFF"
              opacity={progress >= 1 ? 1 : 0}
            />
          </Mask>
        </Defs>
        <SvgImage
          href={ringImage}
          width={ART_WIDTH}
          height={ART_HEIGHT}
          mask="url(#pen-reveal)"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 25,
  },
});
