import { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useParams } from "react-router-dom";

import { usePreviewImage } from "../hooks/use-preview-image";
import { useToastError } from "../hooks/use-toast-error";
import { useToastSuccess } from "../hooks/use-toast-success";

import { userAtom } from "../atoms/user";
import { postsAtom } from "../atoms/posts";

import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  CloseButton,
  Flex,
  FormControl,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";

import { BsImageFill } from "react-icons/bs";

const MAX_TEXT_LENGTH = 500;

export function CreatePost() {
  const userState = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);

  const { username } = useParams();

  const [text, setText] = useState("");
  const [remainingCharacter, setRemainingCharacter] = useState(MAX_TEXT_LENGTH);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { imageURL, setImageURL, handleChangeImage } = usePreviewImage();

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const ref = useRef<HTMLInputElement>(null);

  function handleChangeInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const { value } = event.target;

    if (value.length > MAX_TEXT_LENGTH) {
      const trimmedValue = value.slice(0, MAX_TEXT_LENGTH);

      setText(trimmedValue);
      setRemainingCharacter(0);
    } else {
      setText(value);
      setRemainingCharacter(MAX_TEXT_LENGTH - value.length);
    }
  }

  function handleClickUploadImage() {
    ref.current?.click();
  }

  function handleClickDeleteImage() {
    setImageURL(null);
  }

  async function handleClickCreatePost() {
    try {
      const response = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postedBy: userState._id,
          text: text,
          image: imageURL,
        }),
      });
      const data = await response.json();

      if (data.error) {
        toastError("Error", data.error);

        return;
      }

      if (username === userState.username) {
        setPosts([data.data, ...posts]);
      }

      toastSuccess("Success", "Post created successfully");

      onClose();

      setText("");
      setImageURL(null);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Button
        position="fixed"
        bottom="10"
        right="10"
        leftIcon={<AddIcon />}
        backgroundColor={useColorModeValue("gray.300", "gray.dark")}
        onClick={onOpen}
      >
        Post
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody paddingBottom="6">
            <FormControl>
              <Textarea
                placeholder="What's on your mind?"
                onChange={handleChangeInput}
                value={text}
                name="text"
              />
              <Text
                fontSize="xs"
                fontWeight="bold"
                textAlign="right"
                margin="1"
                color="gray.500"
              >
                {remainingCharacter}/{MAX_TEXT_LENGTH}
              </Text>
              <Input
                type="file"
                hidden
                ref={ref}
                onChange={handleChangeImage}
              />
              <BsImageFill
                style={{ cursor: "pointer" }}
                size={16}
                onClick={handleClickUploadImage}
              />
            </FormControl>
            {imageURL && (
              <Flex marginTop="5" width="full" position="relative">
                <Image src={imageURL} alt="preview" />
                <CloseButton
                  onClick={handleClickDeleteImage}
                  backgroundColor="gray.800"
                  position="absolute"
                  top="2"
                  right="2"
                />
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleClickCreatePost}>
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
