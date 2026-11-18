import { ChatError } from "@shared/domain/errors/AppError";
import { ChatImage, Message } from "../../domain/entities/Message";
import { IChatRepository } from "../../domain/repositories/IChatRepository";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export class SendImageMessageUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  async execute(
    roomId: string,
    userId: string,
    image: ChatImage,
  ): Promise<Message> {
    if (!image.base64) {
      throw new ChatError("No se pudo leer la imagen seleccionada");
    }
    if (!SUPPORTED_IMAGE_TYPES.has(image.mimeType.toLowerCase())) {
      throw new ChatError("Formato de imagen no compatible");
    }
    if (image.fileSize && image.fileSize > MAX_IMAGE_SIZE) {
      throw new ChatError("La imagen no puede superar los 10 MB");
    }

    return this.chatRepo.sendImageMessage(roomId, userId, image);
  }
}
