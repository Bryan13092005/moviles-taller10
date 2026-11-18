import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BouncyPressable } from "@/components/ui/BouncyPressable";
import { theme } from "@theme";

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.bg.canvas,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 17,
          color: theme.colors.text.primary,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.colors.bg.canvas,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "RADAR // CANALES",
          headerRight: () => (
            <BouncyPressable
              onPress={logout}
              style={styles.logoutBtn}
              hitSlop={theme.hitSlop.standard}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
            >
              <View style={styles.logoutContent}>
                <Ionicons
                  name="power-outline"
                  size={15}
                  color={theme.colors.accent.primary}
                />
                <Text style={styles.logoutText}>SALIR</Text>
              </View>
            </BouncyPressable>
          ),
        }}
      />
      <Stack.Screen
        name="chat/[roomId]"
        options={{
          title: "TRANSMISIÓN",
          headerBackTitle: "Atrás",
          headerTintColor: theme.colors.accent.primary,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.border.focus,
    minHeight: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  logoutText: {
    color: theme.colors.text.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
