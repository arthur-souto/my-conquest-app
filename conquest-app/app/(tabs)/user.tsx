import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { UserBar } from "@/components/user-bar";
import { useUser } from "@/contexts/user";
import { uploadImageFromDevice } from "@/lib/storage-R2";
import { updateCredentials, updateProfileImage } from "@/services/user";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words";
}) {
  return (
    <View className="gap-2">
      <Text className="text-[#666666] text-[11px] tracking-widest">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#333333"
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "none"}
        className="text-white text-[15px] pb-2 border-b border-[#1f1f1f]"
      />
    </View>
  );
}

export default function UserScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user, refresh } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setUsername(user.username ?? "");
    }
  }, [user]);

  const hasChanges =
    name !== (user?.name ?? "") ||
    email !== (user?.email ?? "") ||
    username !== (user?.username ?? "");

  const initial = user?.name?.[0]?.toUpperCase() ?? "?";

  const showError = (msg: string) =>
    toast.show({
      render: () => (
        <Toast action="error">
          <ToastTitle>Erro</ToastTitle>
          <ToastDescription>{msg}</ToastDescription>
        </Toast>
      ),
    });

  const showSuccess = (msg: string) =>
    toast.show({
      render: () => (
        <Toast action="success">
          <ToastTitle>Sucesso</ToastTitle>
          <ToastDescription>{msg}</ToastDescription>
        </Toast>
      ),
    });

  const handlePickPhoto = async () => {
    setUploadingPhoto(true);
    try {
      const result = await uploadImageFromDevice({ type: "profile" });
      if (!result) return;
      await updateProfileImage(result.storagePath);
      await refresh();
      showSuccess("Foto atualizada com sucesso.");
    } catch {
      showError("Não foi possível atualizar a foto.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !username.trim()) {
      showError("Preencha todos os campos.");
      return;
    }
    setSaving(true);
    try {
      await updateCredentials({ username: username.trim(), name: name.trim(), email: email.trim() });
      await refresh();
      showSuccess("Dados atualizados com sucesso.");
    } catch {
      showError("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0a0a0a]"
      style={{ paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <UserBar />

      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <Text className="flex-1 text-white text-[22px] font-bold">Usuário</Text>
        {hasChanges && (
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className="bg-white rounded-md px-[14px] py-2 active:opacity-75"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#0a0a0a" />
            ) : (
              <Text className="text-[#0a0a0a] text-[13px] font-semibold">Salvar</Text>
            )}
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View className="items-center gap-3 py-4">
          <Pressable onPress={handlePickPhoto} disabled={uploadingPhoto} className="active:opacity-75">
            <View className="w-24 h-24 rounded-full bg-[#1f1f1f] overflow-hidden items-center justify-center">
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={{ width: 96, height: 96 }}
                  contentFit="cover"
                />
              ) : (
                <Text className="text-white text-[36px] font-bold">{initial}</Text>
              )}
              {/* overlay escuro ao fazer upload */}
              {uploadingPhoto && (
                <View className="absolute inset-0 bg-black/60 items-center justify-center">
                  <ActivityIndicator color="#ffffff" size="small" />
                </View>
              )}
            </View>
            {/* Ícone câmera */}
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white items-center justify-center border-2 border-[#0a0a0a]">
              <Feather name="camera" size={13} color="#0a0a0a" />
            </View>
          </Pressable>

          <View className="items-center gap-0.5">
            <Text className="text-white text-[16px] font-semibold">{user?.name ?? "—"}</Text>
            <Text className="text-[#555555] text-[12px]">{user?.email ?? ""}</Text>
          </View>
        </View>

        {/* Campos */}
        <View className="bg-[#111111] border border-[#1f1f1f] rounded-xl px-5 py-5 gap-5">
          <Field
            label="NOME COMPLETO"
            value={name}
            onChange={setName}
            placeholder="Seu nome"
            autoCapitalize="words"
          />
          <Field
            label="EMAIL"
            value={email}
            onChange={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
          />
          <Field
            label="USERNAME"
            value={username}
            onChange={setUsername}
            placeholder="seu_usuario"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
