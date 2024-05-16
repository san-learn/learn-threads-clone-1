import { Link as RouterLink } from "react-router-dom";
import { useRecoilValue } from "recoil";

import useSignOut from "../hooks/use-sign-out";

import { userAtom } from "../atoms/user";

import { Button, Flex, Image, Link, useColorMode } from "@chakra-ui/react";

import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { BsFillChatQuoteFill } from "react-icons/bs";

export function Header() {
  const userState = useRecoilValue(userAtom);

  const signOut = useSignOut();

  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      justifyContent={userState ? "space-between" : "center"}
      marginTop="6"
      marginBottom="12"
    >
      {userState && (
        <>
          <Link as={RouterLink} to="/">
            <AiFillHome size="24" />
          </Link>
          <Link as={RouterLink} to="/chat">
            <BsFillChatQuoteFill size="24" />
          </Link>
        </>
      )}
      <Image
        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
        alt="logo"
        width="6"
        cursor="pointer"
        onClick={toggleColorMode}
      />
      {userState && (
        <>
          <Link as={RouterLink} to={`/${userState.username}`}>
            <RxAvatar size="24" />
          </Link>
          <Button size="sm" onClick={signOut}>
            <FiLogOut size="20" />
          </Button>
        </>
      )}
    </Flex>
  );
}
