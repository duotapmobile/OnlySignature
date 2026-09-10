import { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import type {
  AssetKind,
  DrawingAsset,
  Stroke,
  StrokePoint,
} from "@/domain/models";
import {
  pointToDrawingPlane,
  SIGNATURE_STROKE_WIDTH,
  stabilizeStrokePoint,
  smoothPath,
  type StrokeStabilizerState,
} from "@/domain/drawing";
import { SampleDrawing, sampleSourceFor } from "./SampleDrawing";
import { theme } from "@/integrations/workspace";

interface Props {
  asset: DrawingAsset;
  kind: AssetKind;
  onChange(
    strokes: Stroke[],
    width: number,
    height: number,
    orientation: "portrait" | "landscape",
  ): void;
}

export function SignatureCanvas({ asset, kind, onChange }: Props) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [size, setSize] = useState({
    width: Math.max(300, windowWidth - 48),
    height: Math.min(360, Math.max(250, windowHeight * 0.42)),
  });
  const [plane, setPlane] = useState({
    width: asset.canvasWidth,
    height: asset.canvasHeight,
  });
  const [strokes, setStrokes] = useState<Stroke[]>(asset.strokes);
  const sampleSource = sampleSourceFor(asset);
  const current = useRef<Stroke | null>(null);
  const stabilizer = useRef<StrokeStabilizerState | null>(null);
  const sequence = useRef(0);
  const strokesRef = useRef<Stroke[]>(asset.strokes);
  const layoutInitialized = useRef(false);

  const updateLocal = useCallback((next: Stroke[]) => {
    strokesRef.current = next;
    setStrokes(next);
  }, []);

  const commit = useCallback(
    (next: Stroke[]) => {
      updateLocal(next);
      onChange(
        next,
        plane.width,
        plane.height,
        windowWidth > windowHeight ? "landscape" : "portrait",
      );
    },
    [
      onChange,
      plane.height,
      plane.width,
      updateLocal,
      windowHeight,
      windowWidth,
    ],
  );

  const pointFromEvent = useCallback(
    (x: number, y: number, timestamp: number): StrokePoint | null => {
      const point = pointToDrawingPlane(
        x,
        y,
        size.width,
        size.height,
        plane.width,
        plane.height,
      );
      return point ? { ...point, t: timestamp, pressure: null } : null;
    },
    [plane.height, plane.width, size.height, size.width],
  );

  const grant = useCallback(
    (x: number, y: number) => {
      const timestamp = Date.now();
      const point = pointFromEvent(x, y, timestamp);
      if (!point) return;
      const stabilized = stabilizeStrokePoint(null, point);
      stabilizer.current = stabilized.state;
      sequence.current += 1;
      const stroke = {
        id: `stroke-${timestamp}-${sequence.current}`,
        points: [stabilized.point],
      };
      current.current = stroke;
      updateLocal([...strokesRef.current, stroke]);
      void Haptics.selectionAsync();
    },
    [pointFromEvent, updateLocal],
  );

  const move = useCallback(
    (x: number, y: number) => {
      if (!current.current) return;
      const timestamp = Date.now();
      const point = pointFromEvent(x, y, timestamp);
      if (!point) return;
      const stabilized = stabilizeStrokePoint(stabilizer.current, point);
      stabilizer.current = stabilized.state;
      const updated = {
        ...current.current,
        points: [...current.current.points, stabilized.point],
      };
      current.current = updated;
      updateLocal([...strokesRef.current.slice(0, -1), updated]);
    },
    [pointFromEvent, updateLocal],
  );

  const release = useCallback(() => {
    if (!current.current) return;
    current.current = null;
    stabilizer.current = null;
    commit(strokesRef.current);
  }, [commit]);

  const terminate = useCallback(() => {
    if (current.current) commit(strokesRef.current);
    current.current = null;
    stabilizer.current = null;
  }, [commit]);

  /* eslint-disable react-hooks/refs -- Gesture callbacks run only after native touch events, never during render. */
  const drawingGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .maxPointers(1)
        .shouldCancelWhenOutside(false)
        .runOnJS(true)
        .onBegin((event) => grant(event.x, event.y))
        .onUpdate((event) => move(event.x, event.y))
        .onEnd(release)
        .onFinalize(terminate),
    [grant, move, release, terminate],
  );
  /* eslint-enable react-hooks/refs */

  return (
    <GestureDetector gesture={drawingGesture}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${kind === "signature" ? "Signature" : "Initials"} drawing area. Draw with one finger. Use the labeled Clear button below to start over.`}
        accessibilityHint="With VoiceOver, double-tap and hold, then draw without lifting. The Clear button below removes only this selected drawing after confirmation."
        accessibilityValue={{
          text:
            strokes.length === 0
              ? "Empty"
              : `${strokes.length} ${strokes.length === 1 ? "stroke" : "strokes"}`,
        }}
        style={styles.canvas}
        onLayout={(event) => {
          const nextSize = {
            width: event.nativeEvent.layout.width,
            height: event.nativeEvent.layout.height,
          };
          const orientation =
            windowWidth > windowHeight ? "landscape" : "portrait";
          const firstLayout = !layoutInitialized.current;
          layoutInitialized.current = true;
          setSize(nextSize);
          if (current.current) return;
          if (firstLayout && strokesRef.current.length === 0) {
            setPlane(nextSize);
            onChange([], nextSize.width, nextSize.height, orientation);
            return;
          }
          const nextPlane = {
            width: Math.max(plane.width, nextSize.width),
            height: Math.max(plane.height, nextSize.height),
          };
          if (
            Math.abs(nextPlane.width - plane.width) < 1 &&
            Math.abs(nextPlane.height - plane.height) < 1
          )
            return;
          const offsetX = (nextPlane.width - plane.width) / 2;
          const offsetY = (nextPlane.height - plane.height) / 2;
          const expanded = strokesRef.current.map((stroke) => ({
            ...stroke,
            points: stroke.points.map((point) => ({
              ...point,
              x: point.x + offsetX,
              y: point.y + offsetY,
            })),
          }));
          setPlane(nextPlane);
          updateLocal(expanded);
          onChange(expanded, nextPlane.width, nextPlane.height, orientation);
        }}
        collapsable={false}
      >
        {sampleSource ? (
          <SampleDrawing
            asset={asset}
            accessibilityLabel={`${kind === "signature" ? "Signature" : "Initials"} sample`}
            style={[
              styles.sample,
              kind === "initials" && styles.initialsSample,
            ]}
          />
        ) : (
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${plane.width} ${plane.height}`}
            preserveAspectRatio="xMidYMid meet"
            pointerEvents="none"
          >
            {strokes.map((stroke) => (
              <Path
                key={stroke.id}
                d={smoothPath(stroke.points)}
                fill="none"
                stroke={theme.colors.text}
                strokeWidth={SIGNATURE_STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </Svg>
        )}
        {strokes.length === 0 ? (
          <View pointerEvents="none" style={styles.emptyGuide}>
            <Text style={styles.hint}>Sign here</Text>
            <View style={styles.guideLine} />
          </View>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    height: "100%",
    minHeight: 0,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E6E8",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  sample: { width: "92%", height: "86%" },
  initialsSample: { width: "76%", height: "72%" },
  hint: {
    color: "#6E7E86",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyGuide: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: "31%",
    alignItems: "center",
    gap: 14,
  },
  guideLine: { width: "86%", height: 1, backgroundColor: "#B8C1C5" },
});
