import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BouncyPressable } from "@/components/ui/BouncyPressable";
import { DynamicHeaderWave } from "@/components/ui/DynamicHeaderWave";
import { theme } from "@theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <DynamicHeaderWave height={180} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Telemetry Header */}
          <View style={styles.badgeRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.badgeText}>ACCESO A TELEMETRÍA // AUTENTICACIÓN</Text>
          </View>

          <Text style={styles.heroTitle}>BIENVENIDO</Text>
          <Text style={styles.heroSubtitle}>
            Ingresa tus credenciales para conectar a la red de canales.
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={theme.colors.status.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CORREO ELECTRÓNICO</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={theme.colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="piloto@pista.com"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  selectionColor={theme.colors.accent.primary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CONTRASEÑA</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={theme.colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  selectionColor={theme.colors.accent.primary}
                />
              </View>
            </View>

            <BouncyPressable
              style={[styles.submitBtn, isLoading && styles.disabledBtn]}
              onPress={() => login({ email, password })}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Iniciar sesión"
            >
              <LinearGradient
                colors={theme.colors.gradients.orangeFire}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.btnText}>INGRESAR A LA PISTA</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </BouncyPressable>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿No tienes cuenta registrada? </Text>
            <Link href="/(auth)/register" style={styles.linkText}>
              Regístrate
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg.canvas,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxxl,
  },
  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    marginBottom: theme.spacing.md,
    gap: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent.primary,
  },
  badgeText: {
    color: theme.colors.text.secondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    color: theme.colors.text.primary,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text.secondary,
    marginTop: 4,
    marginBottom: theme.spacing.xl,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.status.errorMuted,
    borderWidth: 1,
    borderColor: theme.colors.status.error,
    borderRadius: theme.radius.sm,
    padding: 12,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.status.error,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  formCard: {
    backgroundColor: theme.colors.bg.cardElevated,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing.xl,
    gap: 18,
    ...theme.shadows.card,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: theme.colors.text.secondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bg.input,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: 15,
  },
  submitBtn: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
    marginTop: 8,
    ...theme.shadows.neon,
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
    minHeight: 50,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.text.secondary,
    fontSize: 13,
  },
  linkText: {
    color: theme.colors.accent.primary,
    fontSize: 13,
    fontWeight: "700",
  },
});
