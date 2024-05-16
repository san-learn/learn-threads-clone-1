import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { useToastError } from "../hooks/use-toast-error";
import { useToastSuccess } from "../hooks/use-toast-success";

import { userAtom } from "../atoms/user";
import { postsAtom } from "../atoms/posts";

import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

interface Replies {
  userId: string;
  text: string;
  name: string;
  username: string;
  profilePicture: string;
}

interface ActionsProps {
  _id: string;
  likes: string[];
  replies: Replies[];
}

export function Actions({ likes, replies, _id }: ActionsProps) {
  const userState = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);

  const [isLiked, setIsLiked] = useState(likes?.includes(userState?._id));
  const [text, setText] = useState("");

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const { isOpen, onOpen, onClose } = useDisclosure();

  function handleChangeInput(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    setText(value);
  }

  async function handleClickLikeUnlike(endpoint: string, id: string) {
    if (!userState) {
      toastError("Error", "You must be logged in to like posts.");

      return;
    }

    try {
      const response = await fetch(`/api/post/${endpoint}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.error) {
        toastError("Error", data.error);

        return;
      }

      if (isLiked) {
        const updatedPosts = posts.map((post) => {
          if (post._id === id) {
            return {
              ...post,
              likes: post.likes.filter((like) => like !== userState._id),
            };
          }

          return post;
        });

        setPosts(updatedPosts);

        toastSuccess("Success", "Unliked successfully");
      } else {
        const updatedPosts = posts.map((post) => {
          if (post._id === id) {
            return {
              ...post,
              likes: [...post.likes, userState._id],
            };
          }

          return post;
        });

        setPosts(updatedPosts);

        toastSuccess("Success", "Liked successfully");
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleClickReplyPost() {
    if (!userState) {
      toastError("Error", "You must be logged in to reply to posts.");
    }

    try {
      const response = await fetch(`/api/post/reply/${_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text }),
      });
      const data = await response.json();

      if (data.error) {
        toastError("Error", data.error);

        return;
      }

      const updatedPosts = posts.map((post) => {
        if (post._id === _id) {
          return {
            ...post,
            replies: [...post.replies, data.data],
          };
        }

        return post;
      });

      setPosts(updatedPosts);

      toastSuccess("Success", "Replied successfully");

      onClose();

      setText("");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Flex flexDirection="column">
      <Flex gap="3" marginY="2" onClick={(event) => event.preventDefault()}>
        <svg
          aria-label="Like"
          color={isLiked ? "rgb(237, 73, 86)" : ""}
          fill={isLiked ? "rgb(237, 73, 86)" : "transparent"}
          height="19"
          role="img"
          viewBox="0 0 24 22"
          width="20"
          onClick={() =>
            handleClickLikeUnlike(isLiked ? "unlike" : "like", _id)
          }
        >
          <title>Like</title>
          <path
            d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
            stroke="currentColor"
            strokeWidth="2"
          ></path>
        </svg>
        <svg
          aria-label="Comment"
          color=""
          fill=""
          height="20"
          role="img"
          viewBox="0 0 24 24"
          width="20"
          onClick={onOpen}
        >
          <title>Comment</title>
          <path
            d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
          ></path>
        </svg>
        <svg
          aria-label="Repost"
          color="currentColor"
          fill="currentColor"
          height="20"
          role="img"
          viewBox="0 0 24 24"
          width="20"
        >
          <title>Repost</title>
          <path
            fill=""
            d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-3.496-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 9.271V13.5a1 1 0 0 0 2 0V9.271a3.275 3.275 0 0 1 3.271-3.27Z"
          ></path>
        </svg>
        <svg
          aria-label="Share"
          color=""
          fill="rgb(243, 245, 247)"
          height="20"
          role="img"
          viewBox="0 0 24 24"
          width="20"
        >
          <title>Share</title>
          <line
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
            x1="22"
            x2="9.218"
            y1="3"
            y2="10.083"
          ></line>
          <polygon
            fill="none"
            points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
          ></polygon>
        </svg>
      </Flex>
      <Flex gap="2" alignItems="center">
        <Text fontSize="sm" color="gray.light">
          {replies?.length > 1
            ? `${replies?.length} replies`
            : `${replies?.length} reply`}
        </Text>
        <Box
          width="0.5"
          height="0.5"
          borderRadius="full"
          backgroundColor="gray.light"
        />
        <Text fontSize="sm" color="gray.light">
          {likes?.length > 1
            ? `${likes?.length} likes`
            : `${likes?.length} like`}
        </Text>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reply to Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody paddingBottom="6">
            <FormControl>
              <Input
                placeholder="Your reply"
                name="reply"
                value={text}
                onChange={handleChangeInput}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleClickReplyPost}>
              Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
