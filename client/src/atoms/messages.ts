import { atom } from "recoil";

interface Message {
  conversationId: string;
  sender: string;
  text: string;
  seen: boolean;
  image: string;
}

export const messagesAtom = atom<Message[]>({
  key: "messagesAtom",
  default: [],
});
