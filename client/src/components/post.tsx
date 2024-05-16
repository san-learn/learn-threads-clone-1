import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";

import { useToastError } from "../hooks/use-toast-error";
import { useToastSuccess } from "../hooks/use-toast-success";

import { userAtom } from "../atoms/user";
import { postsAtom } from "../atoms/posts";

import { Avatar, Box, Flex, Image, Text } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

import { Actions } from "./actions";

interface User {
  name: string;
  username: string;
  profilePicture: string;
}

interface Replies {
  userId: string;
  text: string;
  name: string;
  username: string;
  profilePicture: string;
}

interface Post {
  _id: string;
  postedBy: string;
  text: string;
  image: string;
  likes: string[];
  replies: Replies[];
  createdAt: Date;
}

interface PostProps {
  post: Post;
}

export function Post({ post }: PostProps) {
  const { postedBy, text, image, likes, replies, _id, createdAt } = post;

  const [posts, setPosts] = useRecoilState(postsAtom);
  const userState = useRecoilValue(userAtom);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const navigate = useNavigate();

  useEffect(() => {
    async function getProfile() {
      try {
        const response = await fetch(`/api/user/profile/${postedBy}`);
        const data = await response.json();

        if (data.error) {
          toastError("Error", data.error);

          return;
        }

        setUser(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }

    getProfile();
  }, [toastError, postedBy]);

  function handleClickNavigateToProfile(
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) {
    event.preventDefault();

    navigate(`/${user?.username}`);
  }

  async function handleClickDeletePost(
    event: React.MouseEvent<SVGElement, MouseEvent>
  ) {
    event.preventDefault();

    const isConfirm = window.confirm("Are you sure to delete this post?");

    if (!isConfirm) {
      return;
    }

    try {
      const response = await fetch(`/api/post/delete/${_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.error) {
        toastError("Error", data.error);

        return;
      }

      setPosts(posts.filter((post) => post._id !== _id));

      toastSuccess("Success", "Post deleted successfully");
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <Flex justifyContent="center">
        <Text>Something went wrong</Text>
      </Flex>
    );
  }

  return (
    <Link to={`/${user.username}/post/${_id}`}>
      <Flex gap="3" marginBottom="4" paddingY="5">
        <Flex direction="column" alignItems="center">
          <Avatar
            size="md"
            name={user.username}
            src={user.profilePicture}
            onClick={handleClickNavigateToProfile}
          />
          <Box
            width="1px"
            height="full"
            backgroundColor="gray.light"
            marginTop="2"
            marginBottom="7"
          ></Box>
          <Box position="relative" width="full">
            {replies.length === 0 && <Text textAlign="center">😒</Text>}
            {replies[0] && (
              <Avatar
                size="xs"
                name={replies[0].username}
                src={replies[0].profilePicture}
                position="absolute"
                top="0px"
                left="11px"
                padding="2px"
              />
            )}
            {replies[1] && (
              <Avatar
                size="xs"
                name={replies[1].username}
                src={replies[1].profilePicture}
                position="absolute"
                bottom="0px"
                right="1px"
                padding="2px"
              />
            )}
            {replies[2] && (
              <Avatar
                size="xs"
                name={replies[2].username}
                src={replies[2].profilePicture}
                position="absolute"
                bottom="0px"
                left="-1px"
                padding="2px"
              />
            )}
          </Box>
        </Flex>
        <Flex flex="1" flexDirection="column" gap="2">
          <Flex justifyContent="space-between" width="full">
            <Flex width="full" alignItems="center">
              <Text
                fontSize="sm"
                fontWeight="bold"
                onClick={handleClickNavigateToProfile}
              >
                {user.username}
              </Text>
            </Flex>
            <Flex alignItems="center" gap="2">
              <Text
                fontSize="xs"
                whiteSpace="nowrap"
                color="gray.light"
                textAlign="right"
              >
                {formatDistanceToNow(new Date(createdAt))} ago
              </Text>
              {userState?._id === postedBy && (
                <DeleteIcon
                  width={5}
                  onClick={handleClickDeletePost}
                  style={{ cursor: "pointer" }}
                />
              )}
            </Flex>
          </Flex>
          <Text fontSize="sm">{text}</Text>
          {image && (
            <Box
              borderRadius="6"
              overflow="hidden"
              border="1px solid"
              borderColor="gray.light"
            >
              <Image src={image} width="full" />
            </Box>
          )}
          <Flex gap="3" marginY="1">
            <Actions likes={likes} replies={replies} _id={_id} />
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
}
