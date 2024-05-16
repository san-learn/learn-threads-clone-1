import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";

import { postsAtom } from "../atoms/posts";

import { useToastError } from "../hooks/use-toast-error";

import { Post } from "../components/post";
import { SuggestedUsers } from "../components/suggested-users";

import { Box, Flex, Spinner, Text } from "@chakra-ui/react";

export function HomePage() {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [isLoading, setIsLoading] = useState(true);

  const toastError = useToastError();

  useEffect(() => {
    async function getFeedPosts() {
      setPosts([]);

      try {
        const response = await fetch("/api/post/feed");
        const data = await response.json();

        if (data.error) {
          toastError("Error", data.error);

          return;
        }

        setPosts(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }

    getFeedPosts();
  }, [setPosts, toastError]);

  return (
    <Flex gap="10" alignItems="flex-start">
      <Box flex="70">
        {isLoading && (
          <Flex justifyContent="center">
            <Spinner size="xl" />
          </Flex>
        )}
        {posts.length === 0 && (
          <Flex justifyContent="center">
            <Text>Don't have any feed</Text>
          </Flex>
        )}
        {posts.map((post, index) => {
          return <Post key={index} post={post} />;
        })}
      </Box>
      <Box flex="30" display={{ base: "none", md: "block" }}>
        <SuggestedUsers />
      </Box>
    </Flex>
  );
}
