import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL!;
const REALM = process.env.EXPO_PUBLIC_KEYCLOAK_REALM!;
const CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID!;

const discovery = {
  authorizationEndpoint: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`,
  tokenEndpoint: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
  revocationEndpoint: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/revoke`,
};

export function useAuth() {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "conquestapp",
    path: "callback",
  });


  console.log("redirectUri:", redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri,
    },
    discovery
  );

  const signIn = async () => {
    await promptAsync();
  };

  return { signIn, request, response };
}