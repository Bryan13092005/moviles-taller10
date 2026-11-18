import { Room } from "@features/chat/domain/entities/Message";
import { useRooms } from "@features/chat/presentation/hooks/useRooms";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
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

export default function RoomsScreen() {
  const { rooms, isLoading, createRoom, isCreating, createError } = useRooms();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState("");

  const handleCreate = () => {
    if (!roomName.trim() || isCreating) return;
    createRoom(roomName.trim(), {
      onSuccess: () => {
        setRoomName("");
        setModalVisible(false);
      },
    });
  };

  const renderRoom = ({ item, index }: { item: Room; index: number }) => (
    <BouncyPressable
      style={styles.roomCard}
      onPress={() => router.push(`/chat/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Entrar a la sala ${item.name}`}
    >
      <View style={styles.cardHeaderStrip}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.roomIconWrapper}>
            <Ionicons
              name="radio-outline"
              size={18}
              color={theme.colors.accent.primary}
            />
          </View>
          <View style={styles.roomInfo}>
            <View style={styles.roomTitleRow}>
              <Text style={styles.channelPrefix}>#</Text>
              <Text style={styles.roomName} numberOfLines={1} ellipsizeMode="tail">
                {item.name}
              </Text>
            </View>
            <View style={styles.roomMetaRow}>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>EN VIVO</Text>
              </View>
              <Text style={styles.roomDate}>
                {item.createdAt.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardArrow}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.text.tertiary}
          />
        </View>
      </View>
    </BouncyPressable>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.accent.primary} />
        <Text style={styles.loadingText}>SINCRONIZANDO TELEMETRÍA...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DynamicHeaderWave height={160} />

      {/* Hero Header Area */}
      <View style={styles.heroSection}>
        <View style={styles.telemetryBadge}>
          <View style={styles.livePulseDot} />
          <Text style={styles.telemetryBadgeText}>FRECUENCIAS DISPONIBLES</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{rooms.length}</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>CANALES ACTIVOS</Text>
        <Text style={styles.heroSubtitle}>
          Selecciona una transmisión para unirte a la conversación.
        </Text>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        renderItem={renderRoom}
        contentContainerStyle={[
          styles.listContent,
          rooms.length === 0 && styles.listEmptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="speedometer-outline"
                size={44}
                color={theme.colors.accent.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>RADAR DESPEJADO</Text>
            <Text style={styles.emptyDesc}>
              No hay canales de comunicación activos. Inicia la primera sala de
              transmisión.
            </Text>
            <BouncyPressable
              style={styles.emptyBtn}
              onPress={() => setModalVisible(true)}
            >
              <LinearGradient
                colors={theme.colors.gradients.orangeFire}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyBtnGradient}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.emptyBtnText}>CREAR CANAL</Text>
              </LinearGradient>
            </BouncyPressable>
          </View>
        }
      />

      {/* Floating Action Button */}
      <BouncyPressable
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Crear nueva sala"
      >
        <LinearGradient
          colors={theme.colors.gradients.orangeFire}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </BouncyPressable>

      {/* Create Room Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <BouncyPressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
            hapticFeedback={false}
          />
          <View style={styles.dialog}>
            <View style={styles.dialogTopAccent} />
            <View style={styles.dialogHeader}>
              <View style={styles.dialogBadge}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={14}
                  color={theme.colors.accent.primary}
                />
                <Text style={styles.dialogBadgeText}>TELEMETRÍA // NUEVO CANAL</Text>
              </View>
              <Text style={styles.dialogTitle}>Crear Frecuencia</Text>
              <Text style={styles.dialogSubtitle}>
                Define un nombre distintivo para tu canal de comunicación.
              </Text>
            </View>

            {createError && (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={theme.colors.status.error}
                />
                <Text style={styles.dialogError}>{createError}</Text>
              </View>
            )}

            <TextInput
              style={styles.dialogInput}
              placeholder="Ej. Circuito Monza / Sala General"
              placeholderTextColor={theme.colors.text.tertiary}
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
              maxLength={50}
              selectionColor={theme.colors.accent.primary}
            />

            <View style={styles.dialogActions}>
              <BouncyPressable
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                hitSlop={theme.hitSlop.standard}
              >
                <Text style={styles.cancelText}>CANCELAR</Text>
              </BouncyPressable>

              <BouncyPressable
                style={[styles.createBtn, isCreating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={isCreating}
              >
                <LinearGradient
                  colors={theme.colors.gradients.orangeFire}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createBtnGradient}
                >
                  {isCreating ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      <Text style={styles.createText}>ACTIVAR</Text>
                    </>
                  )}
                </LinearGradient>
              </BouncyPressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg.canvas,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg.canvas,
    gap: 14,
  },
  loadingText: {
    color: theme.colors.text.tertiary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  heroSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    zIndex: 1,
  },
  telemetryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
    marginBottom: theme.spacing.sm,
    gap: 7,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.status.success,
  },
  telemetryBadgeText: {
    color: theme.colors.text.secondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  countBadge: {
    backgroundColor: theme.colors.accent.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countBadgeText: {
    color: theme.colors.accent.primary,
    fontSize: 10,
    fontWeight: "800",
    ...theme.typography.tabular,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 100,
    gap: 12,
  },
  listEmptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  roomCard: {
    backgroundColor: theme.colors.bg.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing.md,
    minHeight: 74,
    justifyContent: "center",
    ...theme.shadows.card,
  },
  cardHeaderStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
    marginRight: 8,
  },
  roomIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.border.focus,
    justifyContent: "center",
    alignItems: "center",
  },
  roomInfo: {
    flex: 1,
    gap: 4,
  },
  roomTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  channelPrefix: {
    color: theme.colors.accent.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  roomName: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  roomMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.status.successMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.status.success,
  },
  statusText: {
    color: theme.colors.status.success,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  roomDate: {
    color: theme.colors.text.tertiary,
    fontSize: 11,
    fontWeight: "500",
    ...theme.typography.tabular,
  },
  cardArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.accent.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.border.focus,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  emptyDesc: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 280,
  },
  emptyBtn: {
    marginTop: 8,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
  },
  emptyBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 22,
    width: 58,
    height: 58,
    borderRadius: 29,
    ...theme.shadows.neon,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.bg.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: theme.colors.bg.cardElevated,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    padding: theme.spacing.xl,
    overflow: "hidden",
    ...theme.shadows.card,
  },
  dialogTopAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.accent.primary,
  },
  dialogHeader: {
    marginBottom: theme.spacing.lg,
    gap: 4,
  },
  dialogBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  dialogBadgeText: {
    color: theme.colors.accent.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  dialogTitle: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  dialogSubtitle: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.status.errorMuted,
    borderWidth: 1,
    borderColor: theme.colors.status.error,
    padding: 10,
    borderRadius: theme.radius.sm,
    marginBottom: 12,
  },
  dialogError: {
    color: theme.colors.status.error,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  dialogInput: {
    backgroundColor: theme.colors.bg.input,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text.primary,
    fontSize: 15,
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: "center",
  },
  cancelText: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  createBtn: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  createBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44,
  },
  createText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
});
