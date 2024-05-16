import { useState } from "react";
import { useRecoilValue } from "recoil";

import { selectedConversationAtom } from "../atoms/selected-conversation";
import { userAtom } from "../atoms/user";

import { Avatar, Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";

import { BsCheck2All } from "react-icons/bs";

interface MessageProps {
  message: {
    text: string;
    seen: boolean;
    image: string;
  };
  isOwnMessage: boolean;
}

export function Message({ message, isOwnMessage }: MessageProps) {
  const { text } = message;

  const [isImageLoading, setIsImageLoading] = useState(false);

  const userState = useRecoilValue(userAtom);
  const selectedConversationState = useRecoilValue(selectedConversationAtom);

  function handleLoad() {
    setIsImageLoading(true);
  }

  return (
    <>
      {isOwnMessage ? (
        <Flex gap="2" alignSelf="flex-end">
          {message.text && (
            <Flex
              backgroundColor="green.800"
              maxWidth="350px"
              padding="1"
              borderRadius="md"
            >
              <Text color="white">{text}</Text>
              <Box
                alignSelf="flex-end"
                marginLeft="1"
                color={message.seen ? "blue.400" : ""}
                fontWeight="bold"
              >
                <BsCheck2All size="16" />
              </Box>
            </Flex>
          )}
          {message.image && !isImageLoading && (
            <Flex marginTop="5" width="200px">
              <Image
                src={message.image}
                hidden
                onLoad={handleLoad}
                alt="message image"
                borderRadius="4"
              />
              <Skeleton width="200px" height="150px" />
            </Flex>
          )}
          {message.image && isImageLoading && (
            <Flex marginTop="5" width="200px">
              <Image src={message.image} alt="message image" borderRadius="4" />
              <Box
                alignSelf="flex-end"
                marginLeft="1"
                color={message.seen ? "blue.400" : ""}
                fontWeight="bold"
              >
                <BsCheck2All size="16" />
              </Box>
            </Flex>
          )}
          <Avatar
            src={userState?.profilePicture}
            name={userState?.username}
            width="10"
            height="10"
          />
        </Flex>
      ) : (
        <Flex gap="2">
          <Avatar
            src={selectedConversationState?.recipientProfilePicture}
            name={selectedConversationState?.recipientUsername}
            width="10"
            height="10"
          />
          {message.text && (
            <Text
              maxWidth="350px"
              backgroundColor="green.400"
              padding="2"
              borderRadius="md"
            >
              {text}
            </Text>
          )}
          {message.image && !isImageLoading && (
            <Flex marginTop="5" width="200px">
              <Image
                src={message.image}
                hidden
                onLoad={handleLoad}
                alt="message image"
                borderRadius="4"
              />
              <Skeleton width="200px" height="150px" />
            </Flex>
          )}
          {message.image && isImageLoading && (
            <Flex marginTop="5" width="200px">
              <Image src={message.image} alt="message image" borderRadius="4" />
            </Flex>
          )}
        </Flex>
      )}
    </>
  );
}
