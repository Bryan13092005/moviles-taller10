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
  TouchableOpacity,
  View,
} from "react-native";

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
      Alert.alert("No se pudo enviar", error instanceof Error ? error.message : "Inténtalo de nuevo");
    }
  }, [input, isSending, sendMessage]);

  const handlePickImage = useCallback(async () => {
    if (isSending) return;
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

    try {
      await sendImage({
        base64: asset.base64,
        mimeType: asset.mimeType ?? "image/jpeg",
        fileName: asset.fileName ?? "imagen.jpg",
        fileSize: asset.fileSize,
      });
    } catch (error) {
      Alert.alert("No se pudo enviar", error instanceof Error ? error.message : "Inténtalo de nuevo");
    }
  }, [isSending, sendImage]);

  const renderMsg = ({ item }: { item: Message }) => {
    const isOwn = item.userId === user?.id;
    return (
      <View style={[styles.row, isOwn && styles.rowOwn]}>
        <View style={[styles.bubble, isOwn ? styles.own : styles.other]}>
          {!isOwn && <Text style={styles.author}>{item.authorUsername}</Text>}
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <Text style={[styles.text, isOwn && styles.textOwn]}>
              {item.content}
            </Text>
          )}
          <Text style={styles.time}>
            {item.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMsg}
        contentContainerStyle={{ padding: 12 }}
      />
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={[styles.imageBtn, isSending && styles.disabledBtn]}
          onPress={handlePickImage}
          disabled={isSending}
          accessibilityRole="button"
          accessibilityLabel="Adjuntar imagen"
        >
          <Text style={styles.imageIcon}>▧</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (isSending || !input.trim()) && styles.disabledBtn]}
          onPress={handleSend}
          disabled={isSending || !input.trim()}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
        >
          {isSending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  row: { flexDirection: "row", marginVertical: 4 },
  rowOwn: { justifyContent: "flex-end" },
  bubble: { maxWidth: "75%", borderRadius: 12, padding: 10 },
  own: { backgroundColor: "#007AFF" },
  other: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e0e0e0" },
  author: { fontSize: 11, fontWeight: "600", color: "#555", marginBottom: 2 },
  text: { fontSize: 15, color: "#000" },
  textOwn: { color: "#fff" },
  messageImage: { width: 230, height: 230, borderRadius: 8 },
  time: { fontSize: 10, color: "#aaa", marginTop: 4, alignSelf: "flex-end" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 100,
  },
  imageBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  imageIcon: { color: "#007AFF", fontSize: 24 },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledBtn: { opacity: 0.45 },
  sendIcon: { color: "#fff", fontSize: 16 },
});


