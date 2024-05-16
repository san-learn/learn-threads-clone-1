import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { useToastError } from "../hooks/use-toast-error";

import { conversationsAtom } from "../atoms/conversations";
import { selectedConversationAtom } from "../atoms/selected-conversation";
import { userAtom } from "../atoms/user";

import { Conversation } from "../components/conversation";
import { MessageContainer } from "../components/message-container";

import { useSocket } from "../context/socket-context";

import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { GiConversation } from "react-icons/gi";

export function ChatPage() {
  const userState = useRecoilValue(userAtom);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );

  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const toastError = useToastError();

  const { onlineUsers } = useSocket();

  useEffect(() => {
    async function getAllConversation() {
      setIsLoadingConversation(true);

      try {
        const response = await fetch("/api/message/get-all-conversation");
        const data = await response.json();

        if (data.error) {
          toastError("Error", data.error);

          return;
        }

        setConversations(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingConversation(false);
      }
    }

    getAllConversation();
  }, [setConversations, toastError]);

  async function handleSubmitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoadingSearch(true);

    try {
      const response = await fetch(`/api/user/profile/${searchText}`);
      const data = await response.json();

      if (data.error) {
        toastError("Error", data.error);

        return;
      }

      const isSelf = data.data._id === userState._id;

      if (isSelf) {
        toastError("Error", "You can't send message to yourself");

        return;
      }

      const isConversationExist = conversations.find(
        (conversation) => conversation.participants[0]._id === data.data._id
      );

      if (isConversationExist) {
        setSelectedConversation({
          conversationId: isConversationExist._id,
          recipientId: data.data._id,
          recipientProfilePicture: data.data.profilePicture,
          recipientUsername: data.data.username,
        });

        return;
      }

      const mockConversation = {
        _id: `mock-conversation-id-${Date.now()}`,
        participants: [
          {
            _id: data.data._id,
            profilePicture: data.data.profilePicture,
            username: data.data.username,
          },
        ],
        lastMessage: {
          text: "",
          sender: "",
        },
      };

      setConversations([...conversations, mockConversation]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingSearch(false);
    }
  }

  function handleChangeInput(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    setSearchText(value);
  }

  return (
    <Flex gap="4" flexDirection="row">
      <Flex flex="30" flexDirection="column" gap="2">
        <form onSubmit={handleSubmitSearch}>
          <Flex alignItems="center" gap="2">
            <Input
              placeholder="Search for a user"
              borderRadius="md"
              size="sm"
              onChange={handleChangeInput}
              value={searchText}
            />
            <Button size="sm" type="submit" isLoading={isLoadingSearch}>
              <SearchIcon />
            </Button>
          </Flex>
        </form>
        {isLoadingConversation &&
          [0, 1, 2].map((_, index) => {
            return (
              <Flex key={index} gap="4" alignItems="center" padding="1">
                <Box>
                  <SkeletonCircle size="12" />
                </Box>
                <Flex width="full" flexDirection="column" gap="3">
                  <Skeleton height="10px" width="50%" />
                  <Skeleton height="8px" width="100%" />
                </Flex>
              </Flex>
            );
          })}
        {!isLoadingConversation &&
          conversations?.map((conversation, index) => {
            return (
              <Conversation
                key={index}
                conversation={conversation}
                isOnline={onlineUsers.includes(
                  conversation.participants[0]._id
                )}
              />
            );
          })}
      </Flex>
      {!selectedConversation ? (
        <>
          <Flex
            flex="70"
            borderRadius="md"
            padding="2"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="400px"
          >
            <GiConversation size="100" />
            <Text fontSize="20">Select a conversation to start messaging</Text>
          </Flex>
        </>
      ) : (
        <MessageContainer />
      )}
    </Flex>
  );
}
