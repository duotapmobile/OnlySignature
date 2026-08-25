import { useCallback, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import type {
  AssetKind,
  DrawingAsset,
  Stroke,
  StrokePoint,
} from "@/domain/models";
import { smoothPath } from "@/domain/drawing";
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
  const [strokes, setStrokes] = useState<Stroke[]>(asset.strokes);
  const current = useRef<Stroke | null>(null);
  const sequence = useRef(0);
  const strokesRef = useRef<Stroke[]>(asset.strokes);

  const updateLocal = useCallback((next: Stroke[]) => {
    strokesRef.current = next;
    setStrokes(next);
  }, []);

  const commit = useCallback(
    (next: Stroke[]) => {
      updateLocal(next);
      onChange(
        next,
        size.width,
        size.height,
        windowWidth > windowHeight ? "landscape" : "portrait",
      );
    },
    [onChange, size.height, size.width, updateLocal, windowHeight, windowWidth],
  );

  const pointFromEvent = useCallback(
    (x: number, y: number, timestamp: number): StrokePoint => ({
      x: Math.max(0, Math.min(size.width, x)),
      y: Math.max(0, Math.min(size.height, y)),
      t: timestamp,
      pressure: null,
    }),
    [size.height, size.width],
  );

  const grant = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY, timestamp } = event.nativeEvent;
      sequence.current += 1;
      const stroke = {
        id: `stroke-${timestamp}-${sequence.current}`,
        points: [pointFromEvent(locationX, locationY, timestamp)],
      };
      current.current = stroke;
      updateLocal([...strokesRef.current, stroke]);
      void Haptics.selectionAsync();
    },
    [pointFromEvent, updateLocal],
  );

  const move = useCallback(
    (event: GestureResponderEvent) => {
      if (!current.current) return;
      const { locationX, locationY, timestamp } = event.nativeEvent;
      const updated = {
        ...current.current,
        points: [
          ...current.current.points,
          pointFromEvent(locationX, locationY, timestamp),
        ],
      };
      current.current = updated;
      updateLocal([...strokesRef.current.slice(0, -1), updated]);
    },
    [pointFromEvent, updateLocal],
  );

  const release = useCallback(() => {
    if (!current.current) return;
    current.current = null;
    commit(strokesRef.current);
  }, [commit]);

  const terminate = useCallback(() => {
    if (current.current) commit(strokesRef.current);
    current.current = null;
  }, [commit]);

  /* eslint-disable react-hooks/refs -- PanResponder stores these callbacks and invokes them only after native gesture events. */
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: grant,
        onPanResponderMove: move,
        onPanResponderRelease: release,
        onPanResponderTerminate: terminate,
      }),
    [grant, move, release, terminate],
  );
  /* eslint-enable react-hooks/refs */

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${kind === "signature" ? "Signature" : "Initials"} drawing area. Draw with one finger. Use the labeled Clear button below to start over.`}
      accessibilityHint="Touch drawing requires direct finger input. The Clear button below removes only this selected drawing after confirmation."
      accessibilityValue={{
        text:
          strokes.length === 0
            ? "Empty"
            : `${strokes.length} ${strokes.length === 1 ? "stroke" : "strokes"}`,
      }}
      style={styles.canvas}
      onLayout={(event) =>
        setSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        })
      }
      {...responder.panHandlers}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.width} ${size.height}`}
        pointerEvents="none"
      >
        {strokes.map((stroke) => (
          <Path
            key={stroke.id}
            d={smoothPath(stroke.points)}
            fill="none"
            stroke={theme.colors.text}
            strokeWidth={5.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
      {strokes.length === 0 ? <Text style={styles.hint}>Draw here</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    height: "100%",
    minHeight: 250,
    maxHeight: 430,
    backgroundColor: "#FAFCFB",
    borderRadius: theme.radii.md,
    borderWidth: 2,
    borderColor: "#B9CBD2",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  hint: {
    position: "absolute",
    color: "#6E7E86",
    fontSize: 22,
    fontWeight: "600",
  },
});
