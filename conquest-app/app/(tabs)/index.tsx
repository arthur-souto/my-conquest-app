import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <Feather name={icon as any} size={13} color="#555555" />
      <Text className="text-[#666666] text-[12px] w-16">{label}</Text>
      <Text className="flex-1 text-white text-[12px]" numberOfLines={1} style={{ fontFamily: "monospace" }}>
        {value}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-[#0a0a0a]"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: 40,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <View className="items-center mb-1">
        <Text
          className="text-white font-bold text-6xl"
        >
          CONQUEST
        </Text>

        {/* Dev badge */}
        <View className="flex-row items-center gap-1.5 border border-[#f59e0b55] bg-[#f59e0b11] rounded-full px-3 py-1 mt-3">
          <View className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
          <Text className="text-[#f59e0b] text-[10px] font-semibold" style={{ letterSpacing: 2 }}>
            DEVELOPMENT BUILD
          </Text>
        </View>
      </View>

      {/* Mascote with glow */}
      <View className="items-center justify-center my-2" style={{ height: 320 }}>
        <View
          className="absolute rounded-full"
          style={{ width: 300, height: 300, backgroundColor: "#3b82f608" }}
        />
        <View
          className="absolute rounded-full"
          style={{ width: 200, height: 200, backgroundColor: "#3b82f612" }}
        />
        <Image
          source={require("@/assets/images/postigrinho.png")}
          style={{ width: 300, height: 300 }}
          contentFit="contain"
        />
      </View>

      {/* Dev info card */}
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 gap-4">
        <View className="flex-row items-center gap-2">
          <Feather name="terminal" size={13} color="#666666" />
          <Text className="text-[#666666] text-[11px] font-semibold" style={{ letterSpacing: 2 }}>
            AMBIENTE DE DESENVOLVIMENTO
          </Text>
        </View>

        <InfoRow icon="box" label="Backend" value="Container Docker" />
        <InfoRow
          icon="server"
          label="API"
          value={"https://api.example.com/v1"}
        />
        <InfoRow icon="database" label="Storage" value="Supabase Cloud" />
        <InfoRow icon="shield" label="Auth" value="JWT · Spring Security" />

        <View className="border-t border-[#1f1f1f] pt-4 gap-1">
          <Text className="text-[#f59e0b] text-[11px] font-semibold mb-1">⚠ Atenção</Text>
          <Text className="text-[#444444] text-[12px] leading-5">
            Esta versão conecta diretamente ao ambiente de desenvolvimento.
            Dados inseridos podem ser apagados sem aviso prévio.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
