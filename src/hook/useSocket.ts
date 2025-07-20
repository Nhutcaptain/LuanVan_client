// hooks/useSocket.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type SocketEventHandlers = Record<string, (data: any) => void>;
type SocketOptions = {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  randomizationFactor?: number;
};

export const useSocket = (
  url: string,
  options: {
    eventHandlers?: SocketEventHandlers;
    socketOptions?: SocketOptions;
    onConnected?: (socket: Socket) => void;
    onDisconnected?: (reason: Socket.DisconnectReason) => void;
  } = {}
) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef<SocketEventHandlers>(options.eventHandlers || {});
  const connectionRef = useRef<{
    url: string;
    options: SocketOptions;
  } | null>(null);

  // Cập nhật tham chiếu handlers khi thay đổi
  useEffect(() => {
    handlersRef.current = options.eventHandlers || {};
  }, [options.eventHandlers]);

  // Khởi tạo hoặc cập nhật kết nối socket
  const initializeSocket = useCallback(() => {
    // Ngắt kết nối nếu đã tồn tại và URL/options thay đổi
    if (
      socketRef.current &&
      (connectionRef.current?.url !== url ||
        JSON.stringify(connectionRef.current?.options) !==
          JSON.stringify(options.socketOptions))
    ) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Tạo socket mới nếu chưa có
    if (!socketRef.current) {
      const socketOptions = {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        ...options.socketOptions,
      };

      socketRef.current = io(url, socketOptions);
      connectionRef.current = { url, options: socketOptions };

      const socket = socketRef.current;

      const handleConnect = () => {
        setIsConnected(true);
        options.onConnected?.(socket);
        console.log("Socket connected:", socket.id);
      };

      const handleDisconnect = (reason: Socket.DisconnectReason) => {
        setIsConnected(false);
        options.onDisconnected?.(reason);
        console.log("Socket disconnected:", reason);
      };

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);

      // Thêm các event listeners
      Object.entries(handlersRef.current).forEach(([event, handler]) => {
        socket.on(event, handler);
      });

      // Nếu autoConnect là false, không tự động kết nối
      if (socketOptions.autoConnect === false) {
        socket.disconnect();
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        Object.keys(handlersRef.current).forEach((event) => {
          socketRef.current?.off(event);
        });
      }
    };
  }, [url, options.socketOptions, options.onConnected, options.onDisconnected]);

  useEffect(() => {
    const cleanup = initializeSocket();
    return cleanup;
  }, [initializeSocket]);

  // Thêm event listener động
  const addEventListener = useCallback(
    (event: string, handler: (data: any) => void) => {
      if (!socketRef.current) return;

      handlersRef.current[event] = handler;
      socketRef.current.on(event, handler);

      return () => {
        socketRef.current?.off(event, handler);
        delete handlersRef.current[event];
      };
    },
    []
  );

  // Gửi event
  const emit = useCallback(
    (event: string, ...args: any[]) => {
      if (!socketRef.current) return false;
      socketRef.current.emit(event, ...args);
      return true;
    },
    []
  );

  // Tham gia phòng
  const joinRoom = useCallback(
    (room: string, callback?: () => void) => {
      if (!socketRef.current) return false;

      const join = () => {
        socketRef.current?.emit("join-room", room);
        callback?.();
        console.log(`Joined room: ${room}`);
      };

      if (socketRef.current.connected) {
        join();
      } else {
        socketRef.current.once("connect", join);
      }
      return true;
    },
    []
  );

  // Rời phòng
  const leaveRoom = useCallback(
    (room: string, callback?: () => void) => {
      if (!socketRef.current?.connected) return false;
      socketRef.current.emit("leave-room", room);
      callback?.();
      return true;
    },
    []
  );

  // Ngắt kết nối có chủ đích
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  // Kết nối lại có chủ đích
  const connect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    addEventListener,
    joinRoom,
    leaveRoom,
    disconnect,
    connect,
  };
};