import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app";
import { connectDB, closeDatabase } from "./config/database";
import { logger } from "./utils/logger";
import { ChatService } from "./modules/chat/services/chat.service";
import { Message } from "./modules/chat/models/message.model";
import jwt from "jsonwebtoken";

const PORT = process.env.PORT || 3000;

console.log("-----------------------------------------");
console.log("   NOMADLY BACKEND STARTING (v1.0.1)     ");
console.log("-----------------------------------------");

const app = createApp();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    credentials: true,
  },
});

const chatService = new ChatService();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(new Error("JWT_SECRET not configured"));
    }

    const payload = jwt.verify(token, jwtSecret) as { userId: string; email: string };
    socket.data.user = payload;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  logger.info({ userId: socket.data.user?.userId }, "User connected to Socket.IO");

  socket.on("join_chat", async (conversationId: string) => {
    try {
      await socket.join(`conversation:${conversationId}`);
      logger.info(
        { conversationId, userId: socket.data.user?.userId },
        "User joined conversation"
      );
    } catch (error) {
      logger.error({ error }, "Error joining conversation");
    }
  });

  socket.on("send_message", async (data: { conversationId: string; message: string; messageType?: string }) => {
    try {
      if (!socket.data.user) {
        socket.emit("error", { message: "Not authenticated" });
        return;
      }

      const newMessage = await chatService.createMessage(
        data.conversationId,
        socket.data.user.userId,
        data.message,
        (data.messageType as any) || "text"
      );

      const populatedMessage = await Message.findById(newMessage._id).populate(
        "sender_id",
        "profile"
      );

      io.to(`conversation:${data.conversationId}`).emit("receive_message", populatedMessage);
    } catch (error) {
      logger.error({ error }, "Error sending message");
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("typing", (data: { conversationId: string; isTyping: boolean }) => {
    socket.to(`conversation:${data.conversationId}`).emit("typing", {
      userId: socket.data.user?.userId,
      isTyping: data.isTyping,
    });
  });

  socket.on("mark_read", async (conversationId: string) => {
    try {
      if (!socket.data.user) return;

      await chatService.markAsRead(conversationId, socket.data.user.userId);
      socket.to(`conversation:${conversationId}`).emit("read_receipt", {
        userId: socket.data.user.userId,
        conversationId,
      });
    } catch (error) {
      logger.error({ error }, "Error marking as read");
    }
  });

  socket.on("disconnect", () => {
    logger.info({ userId: socket.data.user?.userId }, "User disconnected from Socket.IO");
  });
});

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    const gracefulShutdown = async () => {
      logger.info("Shutting down gracefully...");
      httpServer.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
