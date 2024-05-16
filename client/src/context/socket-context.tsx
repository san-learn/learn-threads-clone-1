/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Socket, io } from "socket.io-client";

import { userAtom } from "../atoms/user";

const SocketContext = createContext<any>(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userState = useRecoilValue(userAtom);

  const [socket, setSocket] = useState<Socket>();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      query: {
        _id: userState?._id,
      },
    });

    setSocket(socket);

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    function handleCleanup() {
      socket && socket.close();
    }

    return handleCleanup;
  }, [userState?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
