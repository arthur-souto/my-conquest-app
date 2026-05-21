import { signIn } from "@/services/auth";
import AsyncStorageImpl from "@/services/storage";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    try {
      setLoading(true);
      const res = await signIn({ email: email.trim(), password });
      await AsyncStorageImpl.setItem(AsyncStorageImpl.TOKEN_KEY, JSON.stringify(res));
      router.replace("/(tabs)");
    } catch {
      setError("Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0a0a0a]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
      >
        {/* Logo */}
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
            Entre para continuar
          </Text>
        </View>

        {/* Form card */}
        <View className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 gap-4">

          {/* Email */}
          <View className="gap-1.5">
            <Text className="text-[#666666] text-[11px] font-medium" style={{ letterSpacing: 1.5 }}>
              EMAIL
            </Text>
            <View className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg flex-row items-center px-4">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor="#333333"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-white text-[15px] py-[14px]"
              />
            </View>
          </View>

          {/* Password */}
          <View className="gap-1.5">
            <Text className="text-[#666666] text-[11px] font-medium" style={{ letterSpacing: 1.5 }}>
              SENHA
            </Text>
            <View className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg flex-row items-center px-4">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#333333"
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-white text-[15px] py-[14px]"
              />
              <Pressable
                onPress={() => setPasswordVisible((v) => !v)}
                hitSlop={10}
                className="pl-2 active:opacity-50"
              >
                <Feather
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={16}
                  color="#444444"
                />
              </Pressable>
            </View>
          </View>

          {/* Error */}
          {error && (
            <View className="flex-row items-center gap-2">
              <Feather name="alert-circle" size={13} color="#ef4444" />
              <Text className="text-[#ef4444] text-[12px]">{error}</Text>
            </View>
          )}

          {/* Submit */}
          <Pressable
            onPress={onLogin}
            disabled={!canSubmit}
            className={`rounded-lg py-[15px] items-center mt-1 active:opacity-75 ${canSubmit ? "bg-white" : "bg-[#1a1a1a]"}`}
          >
            {loading ? (
              <ActivityIndicator color="#0a0a0a" size="small" />
            ) : (
              <Text
                className={`text-[15px] font-semibold ${canSubmit ? "text-[#0a0a0a]" : "text-[#444444]"}`}
              >
                Entrar
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
