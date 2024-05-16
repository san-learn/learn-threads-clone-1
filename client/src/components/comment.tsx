import { Avatar, Divider, Flex, Text } from "@chakra-ui/react";

interface CommentProps {
  reply: {
    name: string;
    profilePicture: string;
    text: string;
    userId: string;
    username: string;
    _id: string;
  };
  lastReply: boolean;
}

export function Comment({ reply, lastReply }: CommentProps) {
  const { profilePicture, text, username } = reply;
  return (
    <>
      <Flex gap="4" paddingY="2" marginY="2" width="full">
        <Avatar src={profilePicture} size="sm" name={username} />
        <Flex gap="1" width="full" flexDirection="column">
          <Flex justifyContent="space-between" alignItems="center" width="full">
            <Text fontSize="sm" fontWeight="bold">
              {username}
            </Text>
          </Flex>
          <Text>{text}</Text>
        </Flex>
      </Flex>
      {!lastReply && <Divider />}
    </>
  );
}
