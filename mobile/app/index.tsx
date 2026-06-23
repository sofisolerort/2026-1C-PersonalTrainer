import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function Index() {
  const { session, role, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!session) return <Redirect href="/(auth)/Login" />;

  if (role === "entrenador") {
    return <Redirect href="/(trainer)/Home" />;
  }

  return <Redirect href="/(client)/Home" />;
}