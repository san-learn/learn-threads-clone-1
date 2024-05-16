import { useState, useRef } from "react";
import { useRecoilState } from "recoil";

import { userAtom } from "../atoms/user";

import { usePreviewImage } from "../hooks/use-preview-image";
import { useToastError } from "../hooks/use-toast-error";
import { useToastSuccess } from "../hooks/use-toast-success";

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
} from "@chakra-ui/react";

export function UpdateProfilePage() {
  const [user, setUser] = useRecoilState(userAtom);
  const [inputs, setInputs] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    biography: user.biography,
    profilePicture: user.profilePicture,
    password: "",
  });

  const ref = useRef<HTMLInputElement>(null);

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const { imageURL, handleChangeImage } = usePreviewImage();

  function handleClickChangePhoto() {
    ref.current?.click();
  }

  function handleChangeInput(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setInputs({ ...inputs, [name]: value });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch(`/api/user/update/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...inputs, profilePicture: imageURL }),
      });
      const data = await response.json();

      if (data.error) {
        toastError("Error", data.error);

        return;
      }

      toastSuccess("Success", "Profile updated successfully");

      setUser(data.data);

      localStorage.setItem("user", JSON.stringify(data.data));
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex align="center" justify="center" marginY="12">
        <Stack
          spacing="4"
          width="full"
          maxWidth="md"
          backgroundColor={useColorModeValue("white", "gray.dark")}
          rounded="xl"
          boxShadow="lg"
          padding="6"
        >
          <Heading lineHeight="1.1" fontSize={{ base: "2xl", sm: "3xl" }}>
            Update Profile
          </Heading>
          <FormControl>
            <Stack direction={["column", "row"]} spacing="6">
              <Center>
                <Avatar size="xl" src={imageURL || user.profilePicture} />
              </Center>
              <Center width="full">
                <Button width="full" onClick={handleClickChangePhoto}>
                  Change Photo
                </Button>
                <Input
                  type="file"
                  hidden
                  ref={ref}
                  onChange={handleChangeImage}
                />
              </Center>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="John Doe"
              _placeholder={{ color: "gray.500" }}
              type="text"
              value={inputs.name}
              onChange={handleChangeInput}
              name="name"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Biography</FormLabel>
            <Input
              placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis, beatae?"
              _placeholder={{ color: "gray.500" }}
              type="text"
              value={inputs.biography}
              onChange={handleChangeInput}
              name="biography"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              placeholder="jonhdoe"
              _placeholder={{ color: "gray.500" }}
              type="text"
              value={inputs.username}
              onChange={handleChangeInput}
              name="username"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="johndoe@example.com"
              _placeholder={{ color: "gray.500" }}
              type="email"
              value={inputs.email}
              onChange={handleChangeInput}
              name="email"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="********"
              _placeholder={{ color: "gray.500" }}
              type="password"
              value={inputs.password}
              onChange={handleChangeInput}
              name="password"
            />
          </FormControl>
          <Stack spacing="6" direction={["column", "row"]}>
            <Button
              backgroundColor={"red.400"}
              color={"white"}
              width="full"
              _hover={{
                backgroundColor: "red.500",
              }}
            >
              Cancel
            </Button>
            <Button
              backgroundColor={"blue.400"}
              color={"white"}
              width="full"
              _hover={{
                backgroundColor: "blue.500",
              }}
              type="submit"
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </form>
  );
}
