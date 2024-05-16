import { atom } from "recoil";

interface SelectedConversation {
  conversationId: string;
  recipientId: string;
  recipientUsername: string;
  recipientProfilePicture: string;
}

export const selectedConversationAtom = atom<SelectedConversation | null>({
  key: "selectedConversationAtom",
  default: null,
});
