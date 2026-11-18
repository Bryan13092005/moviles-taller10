export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  authorUsername?: string; // Desnormalización controlada para la UI
}

export interface ChatImage {
  base64: string;
  mimeType: string;
  fileName: string;
  fileSize?: number;
}

export interface Room {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
}