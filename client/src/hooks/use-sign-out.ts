import { useSetRecoilState } from "recoil";

import { userAtom } from "../atoms/user";

import { useToastError } from "./use-toast-error";

export default function useSignOut() {
  const setUserState = useSetRecoilState(userAtom);

  const toastError = useToastError();

  async function signOut() {
    try {
      const response = await fetch("/api/user/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.error) {
        toastError("Error", data.error);

        return;
      }

      localStorage.removeItem("user");

      setUserState(null);
    } catch (error) {
      console.log(error);
    }
  }

  return signOut;
}
