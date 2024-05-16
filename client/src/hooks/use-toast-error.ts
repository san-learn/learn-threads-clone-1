import { useCallback } from "react";

import { useToast } from "@chakra-ui/react";

export function useToastError() {
  const toast = useToast();

  const toastError = useCallback(
    (title: string, description: string) => {
      toast({
        title: title,
        description: description,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
    [toast]
  );

  return toastError;
}
