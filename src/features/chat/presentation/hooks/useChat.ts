import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { GetMessagesUseCase } from '@features/chat/application/use-cases/GetMessageUseCase';
import { SendImageMessageUseCase } from "@features/chat/application/use-cases/SendImageMessageUseCase";
import { SendMessageUseCase } from "@features/chat/application/use-cases/SendMessageUseCase";
import { SubscribeToRoomUseCase } from "@features/chat/application/use-cases/SuscribeToRoomUseCase";
import { ChatImage, Message } from "@features/chat/domain/entities/Message";
import { SupabaseChatRepository } from "@features/chat/infraestructure/repositories/SupabaseChatRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const chatRepo = new SupabaseChatRepository();
const sendMessageUseCase = new SendMessageUseCase(chatRepo);
const sendImageMessageUseCase = new SendImageMessageUseCase(chatRepo);
const getMessagesUseCase = new GetMessagesUseCase(chatRepo);
const subscribeUseCase = new SubscribeToRoomUseCase(chatRepo);

export function useChat(roomId: string) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Paso 1: obtener historial de mensajes con cache
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", roomId], // Clave única por sala
    queryFn: () => getMessagesUseCase.execute(roomId),
    enabled: !!user,
    // Los mensajes antiguos no se revalidan automáticamente.
    // Realtime se encarga de los mensajes nuevos.
    staleTime: Infinity,
  });

  // Paso 2: suscribirse al canal Realtime
  useEffect(() => {
    const unsubscribe = subscribeUseCase.execute(roomId, (newMsg) => {
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => {
        // Evitar duplicados: el optimistic update ya agregó este mensaje
        const exists = old.some((m) => m.id === newMsg.id);
        return exists ? old : [...old, newMsg];
      });
    });
    return unsubscribe; // Cleanup al desmontar: cierra el WebSocket
  }, [queryClient, roomId]);

  // Paso 3: enviar mensaje con optimistic update via useMutation
  const sendMutation = useMutation({
    mutationFn: (message: { type: "text"; content: string } | { type: "image"; image: ChatImage }) =>
      message.type === "text"
        ? sendMessageUseCase.execute(roomId, user!.id, message.content)
        : sendImageMessageUseCase.execute(roomId, user!.id, message.image),

    // onMutate se ejecuta ANTES de la petición (optimistic update)
    onMutate: async (message) => {
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        roomId,
        userId: user!.id,
        content: message.type === "text" ? message.content : "",
        imageUrl:
          message.type === "image"
            ? `data:${message.image.mimeType};base64,${message.image.base64}`
            : undefined,
        createdAt: new Date(),
        authorUsername: user!.username,
      };
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => [
        ...old,
        tempMsg,
      ]);
      return { tempMsg }; // Contexto para onError
    },

    onSuccess: (realMsg, _message, context) => {
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) =>
        old.map((m) => (m.id === context?.tempMsg.id ? realMsg : m)),
      );
    },

    onError: (_err, _message, context) => {
      if (context?.tempMsg) {
        queryClient.setQueryData(["messages", roomId], (old: Message[] = []) =>
          old.filter((m) => m.id !== context.tempMsg.id),
        );
      }
    },
  });

  return {
    messages,
    sendMessage: (content: string) =>
      sendMutation.mutateAsync({ type: "text", content }),
    sendImage: (image: ChatImage) =>
      sendMutation.mutateAsync({ type: "image", image }),
    isLoading,
    isSending: sendMutation.isPending,
  };
}
