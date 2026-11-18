import { supabase } from "@shared/infraestructure/supabase/client";
import { ChatImage, Message, Room } from "@features/chat/domain/entities/Message";
import { IChatRepository } from "@features/chat/domain/repositories/IChatRepository";
import { decode } from "base64-arraybuffer";

const IMAGE_BUCKET = "imagenes";
const IMAGE_MESSAGE_PREFIX = "chat-image:";

export class SupabaseChatRepository implements IChatRepository {
 
  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms').select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapRoom);
  }
 
  async createRoom(name: string, userId: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms').insert({ name, created_by: userId })
      .select().single();
    if (error) throw error;
    return this.mapRoom(data);
  }

  subscribeToRooms(onChange: () => void): () => void {
    const channel = supabase
      .channel('rooms')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        onChange,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }
 
  async getMessages(roomId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('id, room_id, user_id, content, created_at, profiles(username)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50);
    if (error) throw error;
    return (data ?? []).map(this.mapMessage);
  }
 
  async sendMessage(roomId: string, userId: string, content: string): Promise<Message> {
    return this.insertMessage(roomId, userId, content);
  }

  async sendImageMessage(
    roomId: string,
    userId: string,
    image: ChatImage,
  ): Promise<Message> {
    const extension = this.getExtension(image.mimeType);
    const path = `${userId}/${roomId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, decode(image.base64), {
        contentType: image.mimeType,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);

    try {
      return await this.insertMessage(
        roomId,
        userId,
        `${IMAGE_MESSAGE_PREFIX}${data.publicUrl}`,
      );
    } catch (messageError) {
      const { error: cleanupError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .remove([path]);

      if (cleanupError) {
        throw new AggregateError(
          [messageError, cleanupError],
          "No se pudo guardar el mensaje ni eliminar la imagen cargada",
        );
      }
      throw messageError;
    }
  }

  private async insertMessage(
    roomId: string,
    userId: string,
    content: string,
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ room_id: roomId, user_id: userId, content })
      .select('id, room_id, user_id, content, created_at, profiles(username)')
      .single();
    if (error) throw error;
    return this.mapMessage(data);
  }
 
  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
          event: 'INSERT', schema: 'public',
          table: 'messages', filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // El payload no incluye el username — se obtiene con una query extra
          const { data: profile } = await supabase
            .from('profiles').select('username')
            .eq('id', payload.new.user_id).single();
          onMessage({
            id:             payload.new.id,
            roomId:         payload.new.room_id,
            userId:         payload.new.user_id,
            ...this.mapMessageContent(payload.new.content),
            createdAt: new Date(payload.new.created_at),
            authorUsername: profile?.username,
          });
        }
      ).subscribe();
 
    return () => { supabase.removeChannel(channel); };
  }
 
  private mapRoom = (raw: any): Room => ({
    id: raw.id, name: raw.name,
    createdBy: raw.created_by, createdAt: new Date(raw.created_at),
  });
 
  private mapMessage = (raw: any): Message => ({
    id: raw.id, roomId: raw.room_id, userId: raw.user_id,
    ...this.mapMessageContent(raw.content),
    createdAt: new Date(raw.created_at),
    authorUsername: raw.profiles?.username,
  });

  private mapMessageContent = (content: string) =>
    content.startsWith(IMAGE_MESSAGE_PREFIX)
      ? { content: "", imageUrl: content.slice(IMAGE_MESSAGE_PREFIX.length) }
      : { content };

  private getExtension(mimeType: string): string {
    return mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  }
}
