import { useRecoilState, useRecoilValue } from "recoil";

import { userAtom } from "../atoms/user";
import { selectedConversationAtom } from "../atoms/selected-conversation";

import {
  Avatar,
  AvatarBadge,
  Flex,
  Stack,
  Text,
  WrapItem,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

import { BsFillImageFill } from "react-icons/bs";

interface User {
  _id: string;
  profilePicture: string;
  username: string;
}

interface ConversationProps {
  conversation: {
    _id: string;
    participants: User[];
    lastMessage: {
      text: string;
      sender: string;
    };
  };
  isOnline: boolean;
}

export function Conversation({ conversation, isOnline }: ConversationProps) {
  const { participants, lastMessage } = conversation;

  const userState = useRecoilValue(userAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );

  const { colorMode } = useColorMode();

  function handleClick() {
    setSelectedConversation({
      conversationId: conversation._id,
      recipientId: participants[0]._id,
      recipientUsername: participants[0].username,
      recipientProfilePicture: participants[0].profilePicture,
    });
  }

  return (
    <Flex
      gap="4"
      alignItems="center"
      padding="1"
      _hover={{
        cursor: "pointer",
        backgroundColor: useColorModeValue("gray.600", "gray.dark"),
        color: "white",
      }}
      borderRadius="md"
      backgroundColor={
        selectedConversation?.conversationId === conversation._id
          ? colorMode === "light"
            ? "gray.600"
            : "gray.dark"
          : "transparent"
      }
      onClick={handleClick}
    >
      <WrapItem>
        <Avatar
          size="md"
          src={participants[0].profilePicture}
          name={participants[0].username}
        >
          {isOnline && <AvatarBadge boxSize="1em" bg="green.500" />}
        </Avatar>
      </WrapItem>
      <Stack direction="column" fontSize="sm">
        <Text fontWeight="700" display="flex" alignItems={"center"}>
          {participants[0].username}
        </Text>
        <Text fontSize="xs" gap="1" display="flex" alignItems={"center"}>
          {userState._id === lastMessage.sender ? "You: " : ""}
          {lastMessage.text.length > 20
            ? `${lastMessage.text.slice(0, 20)}...`
            : lastMessage.text || <BsFillImageFill size="12" />}
        </Text>
      </Stack>
    </Flex>
  );
}
