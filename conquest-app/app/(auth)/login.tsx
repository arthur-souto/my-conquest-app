import { Button, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
    Toast,
    ToastDescription,
    ToastTitle,
    useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { signIn } from "@/services/auth";
import AsyncStorageImpl from "@/services/storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function LoginScreen() {
  const [isPasswordVisible, setPasswordVisible] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const onLogin = async () => {
    if (!email || !password) {
      toast.show({
        render: () => (
          <Toast action="error">
            <ToastTitle>Erro</ToastTitle>
            <ToastDescription>Preencha todos os campos</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    try {
      setLoading(true);

      const res = await signIn({ email, password });

      AsyncStorageImpl.setItem(AsyncStorageImpl.TOKEN_KEY, JSON.stringify(res))
      
      router.replace("/(tabs)");
    } catch (err: any) {
      toast.show({
        render: () => (
          <Toast action="error">
            <ToastTitle>Erro</ToastTitle>
            <ToastDescription>{err.message ?? "Falha ao entrar"}</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <View className="flex-1  items-center justify-center ">
      <VStack className="p-10">
        <Text className="text-sm">My</Text>
        <Text className="text-6xl font-bold">CONQUEST</Text>
      </VStack>

      <FormControl className="bg-secondary-100 border- w-[90%] rounded-md p-6">
        <VStack className="gap-5">
          <VStack className="w-full gap-2">
            <Text>Email</Text>
            <Input className="w-full">
              <InputField
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Input>
          </VStack>
          <VStack className="w-full gap-2">
            <Text>Password</Text>
            <Input className="w-full">
              <InputField
                value={password}
                onChangeText={setPassword}
                type={isPasswordVisible ? "text" : "password"}
                placeholder="********"
                keyboardType="visible-password"
                autoCapitalize="none"
              />
            </Input>
          </VStack>

          <VStack className="pt-2">
            <Button
              onPress={onLogin}
              variant="solid"
              size="md"
              action="secondary"
              isDisabled={loading}
            >
              <ButtonText>{loading ? "Entrando..." : "Sign-in"}</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </FormControl>
    </View>
  );
}
