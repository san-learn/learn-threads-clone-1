import { useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { selectedConversationAtom } from "../atoms/selected-conversation";
import { messagesAtom } from "../atoms/messages";
import { conversationsAtom } from "../atoms/conversations";

import { useToastError } from "../hooks/use-toast-error";
import { usePreviewImage } from "../hooks/use-preview-image";

import {
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";

import { IoSendSharp } from "react-icons/io5";
import { BsFillImageFill } from "react-icons/bs";

export function MessageInput() {
  const selectedConversationState = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const [messages, setMessages] = useRecoilState(messagesAtom);

  const ref = useRef<HTMLInputElement>(null);

  const { onClose } = useDisclosure();

  const [text, setText] = useState("");
  const [isSendingImage, setIsSendingImage] = useState(false);

  const toastError = useToastError();
  const { handleChangeImage, imageURL, setImageURL } = usePreviewImage();

  function handleChangeInput(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    setText(value);
  }

  async function handleSendMessage(
    event:
      | React.FormEvent<HTMLDivElement | HTMLFormElement>
      | React.MouseEvent<SVGElement, MouseEvent>
  ) {
    event.preventDefault();

    if (!text && !imageURL) {
      return;
    }

    if (isSendingImage) {
      return;
    }

    setIsSendingImage(true);

    try {
      const response = await fetch("/api/message/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          image: imageURL,
          recipientId: selectedConversationState?.recipientId,
        }),
      });
      const data = await response.json();

      if (data.error) {
        toastError("Error", data.error);

        return;
      }

      setMessages([...messages, data.data]);
      setConversations((previousConversions) => {
        const updatedConversations = previousConversions.map((conversation) => {
          if (conversation._id === selectedConversationState?.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                text: data.data.text,
                sender: data.data.sender,
              },
            };
          }

          return conversation;
        });

        return updatedConversations;
      });

      setText("");
      setImageURL(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSendingImage(false);
    }
  }

  function handleClickUploadImage() {
    ref.current?.click();
  }

  function handleOnClose() {
    onClose();

    setImageURL(null);
  }

  return (
    <Flex gap="2" alignItems="center">
      <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
        <InputGroup>
          <Input
            width="full"
            placeholder="Type a message"
            onChange={handleChangeInput}
            value={text}
          />
          <InputRightElement onClick={handleSendMessage}>
            <IoSendSharp />
          </InputRightElement>
        </InputGroup>
      </form>
      <Flex flex="5" cursor="pointer">
        <BsFillImageFill size="20" onClick={handleClickUploadImage} />
        <Input type="file" hidden ref={ref} onChange={handleChangeImage} />
      </Flex>
      <Modal isOpen={!!imageURL} onClose={handleOnClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex marginY="4" width="full">
              <Image src={imageURL!} />
            </Flex>
            <Flex justifyContent="flex-end" marginY="4">
              {isSendingImage ? (
                <Spinner size="md" />
              ) : (
                <IoSendSharp cursor="pointer" onClick={handleSendMessage} />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
