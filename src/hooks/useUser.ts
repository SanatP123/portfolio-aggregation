import { useUser as useClerkUser } from "@clerk/nextjs";

export function useUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser();
  
  return {
    user,
    isLoaded,
    isSignedIn,
    userId: user?.id || null,
  };
}