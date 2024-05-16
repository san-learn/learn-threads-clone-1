import { Link as RouterLink } from "react-router-dom";
import { useRecoilValue } from "recoil";

import { useToastError } from "../hooks/use-toast-error";
import { useToastSuccess } from "../hooks/use-toast-success";
import { useFollowUnfollowUser } from "../hooks/use-follow-unfollow-user";

import { userAtom } from "../atoms/user";

import {
  Avatar,
  Box,
  Button,
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";

import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";

interface UserHeaderProps {
  user: {
    _id: string;
    biography: string;
    email: string;
    followers: string[];
    following: string[];
    name: string;
    profilePicture: string;
    username: string;
  };
}

export function UserHeader({ user }: UserHeaderProps) {
  const { _id, biography, followers, profilePicture, name, username } = user;

  const userState = useRecoilValue(userAtom);

  const { handleClickFollowUnfollow, isFollowing } =
    useFollowUnfollowUser(user);

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  function copyURLToClipboard() {
    const currentUrl = window.location.href;

    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toastSuccess("Success", "Copied URL to clipboard");
      })
      .catch(() => {
        toastError("Error", "Failed to copy URL to clipboard");
      });
  }

  return (
    <VStack gap="4" alignItems="start">
      <Flex width="full" justifyContent="space-between">
        <Box>
          <Text fontSize="3xl" fontWeight="bold">
            {name}
          </Text>
          <Flex gap="2" alignItems="center">
            <Text fontSize="sm">{username}</Text>
            <Text
              fontSize="xs"
              backgroundColor="gray.dark"
              color="gray.light"
              padding="1"
              borderRadius="full"
            >
              threads.net
            </Text>
          </Flex>
        </Box>
        <Box>
          {profilePicture ? (
            <Avatar name={username} src={profilePicture} size="xl" />
          ) : (
            <Avatar name={username} size="xl" />
          )}
        </Box>
      </Flex>
      <Text>{biography}</Text>
      {userState?._id === _id ? (
        <Link as={RouterLink} to="/update-profile">
          <Button size="sm">Edit Profile</Button>
        </Link>
      ) : (
        <Button
          size="sm"
          onClick={() =>
            handleClickFollowUnfollow(isFollowing ? "unfollow" : "follow", _id)
          }
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}
      <Flex width="full" justifyContent="space-between">
        <Flex gap="2" alignItems="center">
          <Text color="gray.light">
            {followers.length > 1
              ? `${followers.length} Followers`
              : `${followers.length} Follower`}
          </Text>
          <Box
            width="1"
            height="1"
            backgroundColor="gray.light"
            borderRadius="full"
          ></Box>
          <Link color="gray.light">instagram.com</Link>
        </Flex>
        <Flex>
          <Box className="icon-container">
            <BsInstagram size="24" cursor="pointer" />
          </Box>
          <Box className="icon-container">
            <Menu>
              <MenuButton>
                <CgMoreO size="24" cursor="pointer" />
              </MenuButton>
              <Portal>
                <MenuList backgroundColor="gray.dark">
                  <MenuItem
                    backgroundColor="gray.dark"
                    onClick={copyURLToClipboard}
                  >
                    Copy Link
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>
      <Flex w="full">
        <Flex
          flex="1"
          borderBottom="1.5px solid white"
          justifyContent="center"
          paddingBottom="3"
          cursor="pointer"
        >
          <Text fontWeight="bold">Threads</Text>
        </Flex>
        <Flex
          flex="1"
          borderBottom="1px solid gray"
          color="gray.light"
          justifyContent="center"
          paddingBottom="3"
          cursor="pointer"
        >
          <Text fontWeight="bold">Replies</Text>
        </Flex>
      </Flex>
    </VStack>
  );
}
