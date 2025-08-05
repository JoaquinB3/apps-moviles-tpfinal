
import { useRouter, useSegments } from "expo-router";
import React from "react";

const AuthContext = React.createContext<{
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useAuth() {
  return React.useContext(AuthContext);
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(session: string | null | undefined) {
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !session &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.
      router.replace("/sign-in");
    } else if (session && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace("/");
    }
  }, [session, segments]);
}

export function AuthProvider(props: React.PropsWithChildren) {
  const [session, setSession] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate a delay to check for a session
  React.useEffect(() => {
    setTimeout(() => {
      // For now, let's assume the user is not logged in initially.
      // In a real app, you'd check AsyncStorage or a secure store here.
      setSession(null); 
      setIsLoading(false);
    }, 1000);
  }, []);


  useProtectedRoute(session);

  const signIn = () => {
    // Perform sign-in logic, then set the session
    // For now, we'll just set a dummy session
    setSession("user-session-token");
  };

  const signOut = () => {
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
