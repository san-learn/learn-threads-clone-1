import { useEffect, useState } from "react";

import { useToastError } from "../hooks/use-toast-error";

import { SuggestedUser } from "./suggested-user";

import { Box, Flex, Skeleton, SkeletonCircle, Text } from "@chakra-ui/react";

export function SuggestedUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const toastError = useToastError();

  useEffect(() => {
    async function getSuggestedUsers() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/user/suggested");
        const data = await response.json();

        if (data.error) {
          toastError("Error", data.error);

          return;
        }

        setSuggestedUsers(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }

    getSuggestedUsers();
  }, [toastError]);

  return (
    <>
      <Text marginBottom="4" fontWeight="bold">
        Suggested Users
      </Text>
      <Flex direction="column" gap="4">
        {isLoading &&
          [0, 1, 2, 3, 4].map((_, index) => {
            return (
              <Flex
                key={index}
                gap="2"
                alignItems="center"
                padding="1"
                borderRadius="md"
              >
                <Box>
                  <SkeletonCircle size="10" />
                </Box>
                <Flex width="full" flexDirection="column" gap="2">
                  <Skeleton height="8px" width="80px" />
                  <Skeleton height="8px" width="90px" />
                </Flex>
                <Flex>
                  <Skeleton height="20px" width="60px" />
                </Flex>
              </Flex>
            );
          })}
        {!isLoading &&
          suggestedUsers.map((user, index) => {
            return <SuggestedUser key={index} user={user} />;
          })}
      </Flex>
    </>
  );
}
