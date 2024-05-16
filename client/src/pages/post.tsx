import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { formatDistanceToNow } from "date-fns";

import { useGetUserProfile } from "../hooks/use-get-user-profile";
import { useToastError } from "../hooks/use-toast-error";

import { userAtom } from "../atoms/user";
import { postsAtom } from "../atoms/posts";

import { Actions } from "../components/actions";
import { Comment } from "../components/comment";

import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

export function PostPage() {
  const userState = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);

  const { user, isLoading } = useGetUserProfile();

  const { id } = useParams();

  const navigate = useNavigate();

  const toastError = useToastError();

  useEffect(() => {
    async function getPost() {
      try {
        const response = await fetch(`/api/post/get/${id}`);
        const data = await response.json();

        if (data.error) {
          toastError("Error", data.error);

          return;
        }

        setPosts([data.data]);
      } catch (error) {
        console.log(error);
      }
    }

    getPost();
  }, [id, setPosts, toastError]);

  const post = posts[0];

  async function handleClickDeletePost() {
    const isConfirm = window.confirm("Are you sure to delete this post?");

    if (!isConfirm) {
      return;
    }

    try {
      const response = await fetch(`/api/post/delete/${post?._id}`, {
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

      navigate(`/${userState.username}`);
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoading) {
    return (
      <Flex justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user || !post) {
    return null;
  }
  return (
    <>
      <Flex>
        <Flex width="full" gap="3" alignItems="center">
          <Avatar name={user.username} src={user.profilePicture} size="md" />
          <Flex alignItems="center">
            <Text fontSize="sm" fontWeight="bold">
              {user.username}
            </Text>
          </Flex>
        </Flex>
        <Flex alignItems="center" gap="2">
          <Text
            fontSize="xs"
            whiteSpace="nowrap"
            color="gray.light"
            textAlign="right"
          >
            {formatDistanceToNow(new Date(post.createdAt))} ago
          </Text>
          {userState?._id === post.postedBy && (
            <DeleteIcon
              width={5}
              onClick={handleClickDeletePost}
              style={{ cursor: "pointer" }}
            />
          )}
        </Flex>
      </Flex>
      <Text marginY="3">{post.text}</Text>
      {post.image && (
        <Box
          borderRadius="6"
          overflow="hidden"
          border="1px solid"
          borderColor="gray.light"
        >
          <Image src={post.image} width="full" />
        </Box>
      )}
      <Flex gap="3" marginY="1">
        <Actions likes={post.likes} replies={post.replies} _id={post._id} />
      </Flex>
      <Divider marginY="4" />
      <Flex justifyContent="space-between">
        <Flex gap="2" alignItems="center">
          <Text fontSize="2xl">👋</Text>
          <Text color="gray.light">Get the app to like, reply, and post.</Text>
        </Flex>
        <Button>Get</Button>
      </Flex>
      <Divider marginY="4" />
      {post.replies.map((reply, index) => {
        return (
          <Comment
            key={index}
            reply={reply}
            lastReply={reply._id === post.replies[post.replies.length - 1]._id}
          />
        );
      })}
    </>
  );
}
