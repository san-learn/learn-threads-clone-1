import { useState } from "react";
import { useSetRecoilState } from "recoil";

import { authScreenAtom } from "../atoms/auth-screen";
import { userAtom } from "../atoms/user";

import { useToastError } from "../hooks/use-toast-error";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export function SignInCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });

  const toastError = useToastError();

  const setAuthScreenState = useSetRecoilState(authScreenAtom);
  const setUserState = useSetRecoilState(userAtom);

  function handleClickShowPassword() {
    setShowPassword(!showPassword);
  }

  function handleClickNavigate() {
    setAuthScreenState("Sign Up");
  }

  function handleChangeInput(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setInputs({ ...inputs, [name]: value });
  }

  async function handleClickSignIn() {
    try {
      const response = await fetch("/api/user/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
      const data = await response.json();

      if (data.error) {
        toastError("Error", data.error);

        return;
      }

      localStorage.setItem("user", JSON.stringify(data.data));

      setUserState(data.data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Flex align="center" justify="center">
      <Stack
        spacing="8"
        marginX="auto"
        maxWidth="lg"
        paddingY="12"
        paddingX="6"
        width={{
          base: "full",
          md: "500px",
        }}
      >
        <Stack align="center">
          <Heading fontSize="4xl" textAlign="center">
            Sign In
          </Heading>
        </Stack>
        <Box
          rounded="lg"
          backgroundColor={useColorModeValue("white", "gray.dark")}
          boxShadow="lg"
          padding="8"
        >
          <Stack spacing="4">
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                name="username"
                value={inputs.username}
                onChange={handleChangeInput}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={inputs.password}
                  onChange={handleChangeInput}
                />
                <InputRightElement height="full">
                  <Button variant="ghost" onClick={handleClickShowPassword}>
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing="10" paddingTop="2">
              <Button
                loadingText="Submitting"
                size="md"
                backgroundColor={useColorModeValue("gray.600", "gray.700")}
                color="white"
                _hover={{
                  backgroundColor: useColorModeValue("gray.700", "gray.800"),
                }}
                onClick={handleClickSignIn}
              >
                Sign In
              </Button>
            </Stack>
            <Stack pt="6">
              <Text align="center">
                Don't have an account?{" "}
                <Link color="blue.400" onClick={handleClickNavigate}>
                  Sign Up
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
