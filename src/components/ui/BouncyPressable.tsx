import React from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 350,
  mass: 0.6,
};

interface BouncyPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  hapticFeedback?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  children?: React.ReactNode;
}

export const BouncyPressable: React.FC<BouncyPressableProps> = ({
  style,
  scaleTo = 0.97,
  hapticFeedback = true,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.get() }],
    };
  });

  const handlePressIn = (e: any) => {
    if (disabled) return;
    scale.set(withSpring(scaleTo, SPRING_CONFIG));
    if (hapticFeedback) {
      try {
        Haptics.impactAsync(hapticStyle);
      } catch {
        // Safe fallback if not on device
      }
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (disabled) return;
    scale.set(withSpring(1, SPRING_CONFIG));
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};
