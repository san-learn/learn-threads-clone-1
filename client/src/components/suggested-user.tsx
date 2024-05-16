import { Link } from "react-router-dom";

import { useFollowUnfollowUser } from "../hooks/use-follow-unfollow-user";

import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";

interface SuggestedUserProps {
  user: {
    _id: string;
    username: string;
    profilePicture: string;
    name: string;
    followers: string[];
  };
}

export function SuggestedUser({ user }: SuggestedUserProps) {
  const { _id, profilePicture, name, username } = user;

  const { handleClickFollowUnfollow, isFollowing } =
    useFollowUnfollowUser(user);

  return (
    <Flex gap="2" justifyContent="space-between" alignItems="center">
      <Flex gap="2" as={Link} to={`${username}`} alignItems="center">
        <Avatar src={profilePicture} name={username} />
        <Box>
          <Text fontSize="sm" fontWeight="bold">
            {username}
          </Text>
          <Text color="gray.light" fontSize="sm">
            {name}
          </Text>
        </Box>
      </Flex>
      <Button
        size="sm"
        color={isFollowing ? "black" : "white"}
        backgroundColor={isFollowing ? "white" : "blue.400"}
        onClick={() =>
          handleClickFollowUnfollow(isFollowing ? "unfollow" : "follow", _id)
        }
        _hover={{
          color: isFollowing ? "black" : "white",
          opacity: ".8",
        }}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </Flex>
  );
}
