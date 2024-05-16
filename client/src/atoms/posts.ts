import { atom } from "recoil";

interface Replies {
  _id: string;
  userId: string;
  text: string;
  name: string;
  username: string;
  profilePicture: string;
}

interface Post {
  _id: string;
  postedBy: string;
  text: string;
  image: string;
  likes: string[];
  replies: Replies[];
  createdAt: Date;
}

export const postsAtom = atom<Post[]>({
  key: "postsAtom",
  default: [],
});
