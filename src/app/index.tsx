import { Redirect } from "expo-router";
import { useAuthStore } from "@features/auth/presentation/store/authStore";

export default function Index() {
  const user = useAuthStore((s) => s.user);
  if (user) {
    return <Redirect href="/(app)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
