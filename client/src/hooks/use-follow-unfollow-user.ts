import { useState } from "react";
import { useRecoilValue } from "recoil";

import { useToastError } from "./use-toast-error";
import { useToastSuccess } from "./use-toast-success";

import { userAtom } from "../atoms/user";

interface User {
  followers: string[];
}

export function useFollowUnfollowUser(user: User) {
  const { followers } = user;
  const userState = useRecoilValue(userAtom);

  const [isFollowing, setIsFollowing] = useState(
    followers.includes(userState?._id)
  );

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  async function handleClickFollowUnfollow(endpoint: string, id: string) {
    if (!userState) {
      toastError("Error", "You must be logged in to follow");

      return;
    }

    try {
      const response = await fetch(`api/user/${endpoint}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.error) {
        toastError("Error", data.error);

        return;
      }

      if (isFollowing) {
        toastSuccess("Success", "Unfollowed successfully");

        followers.pop();
      } else {
        toastSuccess("Success", "Followed successfully");

        followers.push(userState._id);
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.log(error);
    }
  }
  return { handleClickFollowUnfollow, isFollowing };
}
