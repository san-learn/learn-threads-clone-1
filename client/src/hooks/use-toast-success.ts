import { useCallback } from "react";

import { useToast } from "@chakra-ui/react";

export function useToastSuccess() {
  const toast = useToast();

  const toastSuccess = useCallback(
    (title: string, description: string) => {
      toast({
        title: title,
        description: description,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    [toast]
  );

  return toastSuccess;
}
