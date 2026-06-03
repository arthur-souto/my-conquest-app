import AsyncStorageImpl from "@/services/storage";
import * as AuthSession from "expo-auth-session";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/realms/${process.env.EXPO_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/registrations`,
  tokenEndpoint: `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/realms/${process.env.EXPO_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
};

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID!,
      scopes: ["openid", "profile", "email"],
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;

      fetch(
        `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/realms/${process.env.EXPO_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID!,
            code,
            redirect_uri: redirectUri,
            code_verifier: request!.codeVerifier!,
          }).toString(),
        }
      )
        .then((res) => res.json())
        .then(async (data) => {
          if (data.access_token) {
            await AsyncStorageImpl.setItem(
              AsyncStorageImpl.TOKEN_KEY,
              JSON.stringify({
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
              })
            );
            router.replace("/(tabs)");
          }
        });
    }
  }, [response]);

  return (
    <View
      className="flex-1 bg-[#0a0a0a] items-center justify-center px-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      <View className="items-center mb-8">
        <Image
          source={require("@/assets/images/postigrinho.png")}
          style={{ width: 110, height: 110 }}
          contentFit="contain"
        />
        <Text
          className="text-white font-bold mt-3"
          style={{ fontSize: 32, letterSpacing: 8 }}
        >
          CONQUEST
        </Text>
        <Text className="text-[#444444] text-[12px] mt-1">
          Crie sua conta para começar
        </Text>
      </View>

      <View className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 gap-3">
        <Pressable
          onPress={() => promptAsync()}
          disabled={!request}
          className="rounded-lg py-[15px] items-center bg-white active:opacity-75"
        >
          {!request ? (
            <ActivityIndicator color="#0a0a0a" size="small" />
          ) : (
            <Text className="text-[#0a0a0a] text-[15px] font-semibold">
              Criar conta
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          className="rounded-lg py-[15px] items-center active:opacity-75"
        >
          <Text className="text-[#666666] text-[14px]">
            Já tenho uma conta
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
