import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@theme";

interface DynamicHeaderWaveProps {
  height?: number;
}

export const DynamicHeaderWave: React.FC<DynamicHeaderWaveProps> = ({
  height = 140,
}) => {
  const { width } = useWindowDimensions();

  // Smooth bezier curve coordinates adapted to current screen width
  const pathD = `
    M 0,0
    L ${width},0
    L ${width},${height * 0.7}
    C ${width * 0.75},${height * 1.05} ${width * 0.3},${height * 0.45} 0,${height * 0.85}
    Z
  `;

  const secondaryCurveD = `
    M 0,0
    L ${width},0
    L ${width},${height * 0.55}
    C ${width * 0.65},${height * 0.8} ${width * 0.25},${height * 0.3} 0,${height * 0.65}
    Z
  `;

  return (
    <View style={[styles.container, { height, width }]} pointerEvents="none">
      {/* Dynamic Ambient Glow */}
      <LinearGradient
        colors={[
          "rgba(255, 85, 0, 0.22)",
          "rgba(255, 45, 85, 0.08)",
          "transparent",
        ]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* SVG Fluid Aerodynamic Wave */}
      <Svg width={width} height={height} style={styles.svg}>
        <Defs>
          <SvgLinearGradient id="waveGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6200" stopOpacity="0.28" />
            <Stop offset="60%" stopColor="#FF3300" stopOpacity="0.14" />
            <Stop offset="100%" stopColor="#07080B" stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="waveGradSecondary" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#00F0FF" stopOpacity="0.15" />
            <Stop offset="50%" stopColor="#FF5500" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#07080B" stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>

        {/* Secondary subtle wave */}
        <Path d={secondaryCurveD} fill="url(#waveGradSecondary)" />
        {/* Primary prominent wave */}
        <Path d={pathD} fill="url(#waveGradPrimary)" />
      </Svg>

      {/* Speed Line Accent */}
      <View
        style={[
          styles.speedLine,
          {
            top: height * 0.72,
            width: width * 0.35,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 0,
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  speedLine: {
    position: "absolute",
    right: 0,
    height: 1.5,
    backgroundColor: theme.colors.accent.primary,
    opacity: 0.6,
  },
});
