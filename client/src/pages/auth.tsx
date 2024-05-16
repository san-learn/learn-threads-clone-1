import { useRecoilValue } from "recoil";

import { authScreenAtom } from "../atoms/auth-screen";

import { SignInCard } from "../components/sign-in-card";
import { SignUpCard } from "../components/sign-up-card";

export function AuthPage() {
  const authScreenState = useRecoilValue(authScreenAtom);

  return <>{authScreenState === "Sign In" ? <SignInCard /> : <SignUpCard />}</>;
}
