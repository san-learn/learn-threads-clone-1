import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";

import { userAtom } from "./atoms/user";

import { Header } from "./components/header";
import { CreatePost } from "./components/create-post";

import { UserPage } from "./pages/user";
import { PostPage } from "./pages/post";
import { AuthPage } from "./pages/auth";
import { HomePage } from "./pages/home";
import { UpdateProfilePage } from "./pages/update-profile";
import { ChatPage } from "./pages/chat";

import { Container } from "@chakra-ui/react";

export default function App() {
  const userState = useRecoilValue(userAtom);

  const { pathname } = useLocation();

  return (
    <Container
      maxW={pathname === "/" ? { base: "800px", md: "1000px" } : "800px"}
    >
      <Header />
      <Routes>
        <Route
          path="/"
          element={userState ? <HomePage /> : <Navigate to="/auth" />}
        />
        <Route
          path="/auth"
          element={userState ? <Navigate to="/" /> : <AuthPage />}
        />
        <Route
          path="/update-profile"
          element={userState ? <UpdateProfilePage /> : <Navigate to="/auth" />}
        />
        <Route
          path="/:username"
          element={
            userState ? (
              <>
                <UserPage />
                <CreatePost />
              </>
            ) : (
              <UserPage />
            )
          }
        />
        <Route path="/:username/post/:id" element={<PostPage />} />
        <Route
          path="/chat"
          element={userState ? <ChatPage /> : <Navigate to="/auth" />}
        />
      </Routes>
    </Container>
  );
}
