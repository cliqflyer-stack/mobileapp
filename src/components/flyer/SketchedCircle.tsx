import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Platform, Easing } from 'react-native';
import Svg, { Path, G, Ellipse } from 'react-native-svg';

interface SketchedCircleProps {
  width: number;
  height: number;
  color?: string;
  style?: any;
}

// Generates an organic hand-sketched cubic Bezier loop with natural human variations
function generateSketchLoop(
  w: number,
  h: number,
  turns = 1.15,
  offsetAngle = -0.32,
  wobbleSeed = 1
): { path: string; length: number } {
  const pad = 8;
  const rx = Math.max(18, w / 2 - pad);
  const ry = Math.max(18, h / 2 - pad);
  const cx = w / 2;
  const cy = h / 2;

  const steps = 18;
  const points: { x: number; y: number }[] = [];
  const totalAngle = Math.PI * 2 * turns;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const theta = offsetAngle + t * totalAngle;

    // Organic hand-drawn variations (wobble + tail flick)
    const w1 = 0.045 * Math.sin(theta * 2 + wobbleSeed);
    const w2 = 0.025 * Math.cos(theta * 3 - wobbleSeed);
    const tailFlare = t > 0.85 ? 0.06 * (t - 0.85) * 6.5 : 0;
    const rFactor = 1 + w1 + w2 + tailFlare;

    const px = cx + rx * rFactor * Math.cos(theta);
    const py = cy + ry * rFactor * Math.sin(theta);
    points.push({ x: px, y: py });
  }

  // Smooth Catmull-Rom spline converted to SVG cubic Bezier segments
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  // Estimate total path length for stroke drawing animation
  const approxPerimeter =
    2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) * turns;

  return { path: d, length: Math.round(approxPerimeter * 1.05) };
}

export const SketchedCircle: React.FC<SketchedCircleProps> = ({
  width,
  height,
  color = '#DC2626',
  style,
}) => {
  const [drawProgress, setDrawProgress] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Generate paths for primary pen stroke and secondary sketched accent stroke
  const primary = React.useMemo(
    () => generateSketchLoop(width, height, 1.16, -0.32, 1.2),
    [width, height]
  );

  const secondary = React.useMemo(
    () => generateSketchLoop(width, height, 1.12, 0.42, 2.7),
    [width, height]
  );

  useEffect(() => {
    // Reset and trigger draw animation
    setDrawProgress(0);
    scaleAnim.setValue(0.92);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Smoothly animate the stroke draw effect (simulating hand sketching)
    const startTime = Date.now();
    const duration = 300; // ms to complete drawing loop

    let animFrameId: number;

    const animateStroke = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease-out cubic curve for natural pen speed (fast start, gradual taper)
      const eased = 1 - Math.pow(1 - progress, 3);
      setDrawProgress(eased);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(animateStroke);
      }
    };

    animFrameId = requestAnimationFrame(animateStroke);

    return () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, [width, height]);

  const p1Offset = primary.length * (1 - drawProgress);
  const p2Offset = secondary.length * (1 - drawProgress);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          width,
          height,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <G>
          {/* Subtle translucent marker wash inside the circle */}
          <Ellipse
            cx={width / 2}
            cy={height / 2}
            rx={Math.max(16, width / 2 - 12)}
            ry={Math.max(16, height / 2 - 12)}
            fill="rgba(220, 38, 38, 0.05)"
            opacity={drawProgress}
          />

          {/* Secondary sketched pen stroke (multi-stroke hand sketch texture) */}
          <Path
            d={secondary.path}
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeOpacity={0.65}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={[secondary.length, secondary.length]}
            strokeDashoffset={p2Offset}
          />

          {/* Primary bold marker drawn stroke */}
          <Path
            d={primary.path}
            fill="none"
            stroke={color}
            strokeWidth={3.2}
            strokeOpacity={0.95}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={[primary.length, primary.length]}
            strokeDashoffset={p1Offset}
          />
        </G>
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
  },
});
