import { atom } from "recoil";

interface User {
  _id: string;
  profilePicture: string;
  username: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  lastMessage: {
    text: string;
    sender: string;
  };
}

export const conversationsAtom = atom<Conversation[]>({
  key: "conversationsAtom",
  default: [],
});
