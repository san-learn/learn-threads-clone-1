import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { useToastError } from "../hooks/use-toast-error";

import { selectedConversationAtom } from "../atoms/selected-conversation";
import { userAtom } from "../atoms/user";
import { messagesAtom } from "../atoms/messages";
import { conversationsAtom } from "../atoms/conversations";

import { useSocket } from "../context/socket-context";

import { Message } from "./message";
import { MessageInput } from "./message-input";

import messageSound from "../assets/sound/message.mp3";

import {
  Avatar,
  Divider,
  Flex,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

interface Message {
  conversationId: string;
  sender: string;
  text: string;
  seen: boolean;
  image: string;
}

export function MessageContainer() {
  const selectedConversationState = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const userState = useRecoilValue(userAtom);
  const [messages, setMessages] = useRecoilState(messagesAtom);

  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const toastError = useToastError();
  const { socket } = useSocket();

  useEffect(() => {
    socket.on("newMessage", (message: Message) => {
      if (
        selectedConversationState?.conversationId === message.conversationId
      ) {
        setMessages((previouseMessage) => [...previouseMessage, message]);
      }

      if (!document.hasFocus()) {
        const audio = new Audio(messageSound);

        audio.play();
      }

      setConversations((previouseConversations) => {
        const updatedConversations = previouseConversations.map(
          (conversation) => {
            if (conversation._id === message.conversationId) {
              return {
                ...conversation,
                lastMessage: {
                  text: message.text,
                  sender: message.sender,
                },
              };
            }

            return conversation;
          }
        );

        return updatedConversations;
      });
    });

    function handleCleanup() {
      socket.off("newMessage");
    }

    return handleCleanup;
  }, [
    selectedConversationState?.conversationId,
    setConversations,
    setMessages,
    socket,
  ]);

  useEffect(() => {
    const isLastMessageFromOtherUser =
      messages.length &&
      messages[messages.length - 1].sender !== userState?._id;

    if (isLastMessageFromOtherUser) {
      socket.emit("markMessageAsSeen", {
        conversationId: selectedConversationState?.conversationId,
        recipientId: selectedConversationState?.recipientId,
      });
    }

    socket.on("messageSeen", (conversationId: string) => {
      if (selectedConversationState?.conversationId === conversationId) {
        setMessages((previouseMessage) => {
          const updatedMessages = previouseMessage.map((message) => {
            if (!message.seen) {
              return {
                ...message,
                seen: true,
              };
            }

            return message;
          });

          return updatedMessages;
        });
      }
    });
  }, [
    messages,
    selectedConversationState?.conversationId,
    selectedConversationState?.recipientId,
    setMessages,
    socket,
    userState?._id,
  ]);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function getAllMessage() {
      const isMockConversation =
        selectedConversationState?.conversationId.startsWith(
          "mock-conversation-id-"
        );

      if (isMockConversation) {
        return;
      }

      setIsLoadingMessage(true);
      setMessages([]);

      try {
        const response = await fetch(
          `/api/message/get-all/${selectedConversationState?.recipientId}`
        );
        const data = await response.json();

        if (data.error) {
          toastError("Error", data.error);

          return;
        }

        setMessages(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingMessage(false);
      }
    }

    getAllMessage();
  }, [
    selectedConversationState?.conversationId,
    selectedConversationState?.recipientId,
    setMessages,
    toastError,
  ]);

  return (
    <Flex
      flex="70"
      backgroundColor={useColorModeValue("gray.200", "gray.dark")}
      borderRadius="md"
      flexDirection="column"
      padding="2"
    >
      <Flex width="full" height="12" alignItems="center" gap="2">
        <Avatar
          src={selectedConversationState?.recipientProfilePicture}
          name={selectedConversationState?.recipientUsername}
          size="md"
        />
        <Text display="flex" alignItems="center" fontWeight="700">
          {selectedConversationState?.recipientUsername}
        </Text>
      </Flex>
      <Divider marginY="2" />
      <Flex
        flexDirection="column"
        gap="4"
        marginY="4"
        height="500px"
        overflowY="auto"
        paddingX="2"
      >
        {isLoadingMessage &&
          [0, 1, 2].map((_, index) => {
            return (
              <Flex
                key={index}
                gap="2"
                alignItems="end"
                padding="1"
                borderRadius="md"
                alignSelf={index % 2 === 0 ? "flex-start" : "flex-end"}
              >
                {index % 2 === 0 && <SkeletonCircle size="10" />}
                <Flex flexDirection="column" gap="2">
                  <Skeleton height="40px" width="250px" />
                </Flex>
                {index % 2 !== 0 && <SkeletonCircle size="10" />}
              </Flex>
            );
          })}
        {!isLoadingMessage &&
          messages?.map((message, index) => {
            return (
              <Flex
                key={index}
                direction="column"
                ref={messages.length - 1 === index ? ref : null}
              >
                <Message
                  message={message}
                  isOwnMessage={userState._id === message.sender}
                />
              </Flex>
            );
          })}
      </Flex>
      <MessageInput />
    </Flex>
  );
}
