import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Message } from "@features/chat/domain/entities/Message";
import { useChat } from "@features/chat/presentation/hooks/useChat";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BouncyPressable } from "@/components/ui/BouncyPressable";
import { theme } from "@theme";

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messages, sendMessage, sendImage, isLoading, isSending } = useChat(roomId);
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || isSending) return;
    setInput("");
    try {
      await sendMessage(content);
    } catch (error) {
      setInput(content);
      Alert.alert(
        "No se pudo enviar",
        error instanceof Error ? error.message : "Inténtalo de nuevo",
      );
    }
  }, [input, isSending, sendMessage]);

  const handlePickImage = useCallback(async () => {
    if (isSending) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permiso requerido",
          "Permite el acceso a tus fotos para enviar una imagen.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        base64: true,
        quality: 0.8,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert("No se pudo enviar", "No se pudo leer la imagen seleccionada.");
        return;
      }

      await sendImage({
        base64: asset.base64,
        mimeType: asset.mimeType ?? "image/jpeg",
        fileName: asset.fileName ?? "imagen.jpg",
        fileSize: asset.fileSize,
      });
    } catch (error) {
      Alert.alert(
        "No se pudo enviar",
        error instanceof Error ? error.message : "Inténtalo de nuevo",
      );
    }
  }, [isSending, sendImage]);

  const handleTakePhoto = useCallback(async () => {
    if (isSending) return;
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permiso requerido",
          "Permite el acceso a tu cámara para capturar fotos.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        base64: true,
        quality: 0.8,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert("No se pudo enviar", "No se pudo leer la foto tomada.");
        return;
      }

      await sendImage({
        base64: asset.base64,
        mimeType: asset.mimeType ?? "image/jpeg",
        fileName: asset.fileName ?? `foto-${Date.now()}.jpg`,
        fileSize: asset.fileSize,
      });
    } catch (error) {
      Alert.alert(
        "No se pudo enviar",
        error instanceof Error ? error.message : "Inténtalo de nuevo",
      );
    }
  }, [isSending, sendImage]);

  const handleChooseImageSource = useCallback(() => {
    if (isSending) return;
    Alert.alert("Transmisión Visual", "Elige el origen de la imagen", [
      { text: "Cámara", onPress: handleTakePhoto },
      { text: "Galería", onPress: handlePickImage },
      { text: "Cancelar", style: "cancel" },
    ]);
  }, [handlePickImage, handleTakePhoto, isSending]);

  const renderMsg = ({ item }: { item: Message }) => {
    const isOwn = item.userId === user?.id;
    return (
      <View style={[styles.row, isOwn && styles.rowOwn]}>
        {isOwn ? (
          <LinearGradient
            colors={theme.colors.gradients.orangeFire}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.own]}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.messageImage}
                contentFit="cover"
                transition={150}
                accessibilityLabel="Imagen compartida en el chat"
              />
            ) : (
              <Text style={styles.textOwn}>{item.content}</Text>
            )}
            <View style={styles.timeRow}>
              <Text style={styles.timeOwn}>
                {item.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Ionicons name="checkmark-done" size={13} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.other]}>
            <View style={styles.authorRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={12}
                color={theme.colors.accent.secondary}
              />
              <Text style={styles.author}>{item.authorUsername}</Text>
            </View>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.messageImage}
                contentFit="cover"
                transition={150}
                accessibilityLabel="Imagen compartida en el chat"
              />
            ) : (
              <Text style={styles.textOther}>{item.content}</Text>
            )}
            <Text style={styles.timeOther}>
              {item.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMsg}
        contentContainerStyle={[
          styles.listContainer,
          messages.length === 0 && styles.listEmptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.accent.primary} />
              <Text style={styles.loadingText}>ENLAZANDO TRANSMISIÓN...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={36}
                  color={theme.colors.accent.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>FRECUENCIA ABIERTA</Text>
              <Text style={styles.emptySubtitle}>
                El canal está despejado. Envía el primer mensaje o comparte una
                imagen para iniciar la conversación.
              </Text>
            </View>
          )
        }
      />

      {/* Floating Bottom Input Bar */}
      <View style={styles.inputBar}>
        <BouncyPressable
          style={[styles.mediaBtn, isSending && styles.disabledBtn]}
          onPress={handleChooseImageSource}
          disabled={isSending}
          accessibilityRole="button"
          accessibilityLabel="Adjuntar foto o imagen"
          hitSlop={theme.hitSlop.standard}
        >
          <Ionicons
            name="camera-outline"
            size={22}
            color={theme.colors.text.secondary}
          />
        </BouncyPressable>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Transmitir mensaje..."
          placeholderTextColor={theme.colors.text.tertiary}
          multiline
          maxLength={500}
          selectionColor={theme.colors.accent.primary}
        />

        <BouncyPressable
          style={[
            styles.sendBtn,
            (isSending || !input.trim()) && styles.disabledBtn,
          ]}
          onPress={handleSend}
          disabled={isSending || !input.trim()}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
        >
          <LinearGradient
            colors={
              input.trim()
                ? theme.colors.gradients.orangeFire
                : [theme.colors.bg.cardElevated, theme.colors.bg.cardElevated]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendBtnGradient}
          >
            {isSending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons
                name="arrow-up"
                size={20}
                color={input.trim() ? "#FFFFFF" : theme.colors.text.tertiary}
              />
            )}
          </LinearGradient>
        </BouncyPressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg.canvas,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: 8,
  },
  listEmptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    marginVertical: 3,
  },
  rowOwn: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: theme.radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  own: {
    borderBottomRightRadius: theme.radius.xs,
    ...theme.shadows.neon,
  },
  other: {
    backgroundColor: theme.colors.bg.cardElevated,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderBottomLeftRadius: theme.radius.xs,
    ...theme.shadows.card,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  author: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.accent.secondary,
    letterSpacing: 0.4,
  },
  textOwn: {
    fontSize: 15,
    lineHeight: 21,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  textOther: {
    fontSize: 15,
    lineHeight: 21,
    color: theme.colors.text.primary,
    fontWeight: "400",
  },
  messageImage: {
    width: 240,
    height: 240,
    borderRadius: theme.radius.md,
    marginVertical: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  timeOwn: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.75)",
    ...theme.typography.tabular,
  },
  timeOther: {
    fontSize: 10,
    fontWeight: "500",
    color: theme.colors.text.tertiary,
    marginTop: 4,
    alignSelf: "flex-end",
    ...theme.typography.tabular,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: theme.colors.text.tertiary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 50,
    gap: 10,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.accent.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.border.focus,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    color: theme.colors.text.primary,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  emptySubtitle: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    backgroundColor: theme.colors.bg.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
    gap: 10,
  },
  mediaBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.bg.cardElevated,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.bg.input,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: theme.colors.text.primary,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  sendBtnGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.45,
  },
});
