import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";

import { Flex, Spinner } from "@chakra-ui/react";

import { postsAtom } from "../atoms/posts";

import { useToastError } from "../hooks/use-toast-error";
import { useGetUserProfile } from "../hooks/use-get-user-profile";

import { UserHeader } from "../components/user-header";
import { Post } from "../components/post";

export function UserPage() {
  const [posts, setPosts] = useRecoilState(postsAtom);

  const { username } = useParams();

  const { user, isLoading } = useGetUserProfile();
  const toastError = useToastError();

  useEffect(() => {
    async function getAllPost() {
      setPosts([]);

      try {
        const response = await fetch(`/api/post/get-all/${username}`);
        const data = await response.json();

        if (data.error) {
          toastError("Error", data.error);

          return;
        }

        setPosts(data.data);
      } catch (error) {
        console.log(error);
      }
    }

    getAllPost();
  }, [setPosts, toastError, username]);

  if (isLoading) {
    return (
      <Flex justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user || !posts) {
    return null;
  }

  return (
    <>
      <UserHeader user={user} />
      {posts.map((post, index) => {
        return <Post key={index} post={post} />;
      })}
    </>
  );
}
