import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import AuthLoader from "../components/AuthLoader";

// Clerk lands here after Google; it finishes the OAuth handshake and then
// forwards to /auth/clerk-complete (set via redirectUrlComplete).
const SSOCallback = () => (
  <>
    <AuthLoader />
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/auth/clerk-complete"
      signUpFallbackRedirectUrl="/auth/clerk-complete"
    />
  </>
);

export default SSOCallback;
