import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useToastError } from "./use-toast-error";

interface User {
  _id: string;
  biography: string;
  email: string;
  followers: string[];
  following: string[];
  name: string;
  profilePicture: string;
  username: string;
}

export function useGetUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { username } = useParams();

  const toastError = useToastError();

  useEffect(() => {
    async function getUserProfile() {
      try {
        const response = await fetch(`/api/user/profile/${username}`);
        const data = await response.json();

        if (data.error) {
          toastError("Error", data.error);

          return;
        }

        setUser(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }

    getUserProfile();
  }, [toastError, username]);

  return { user, isLoading };
}
