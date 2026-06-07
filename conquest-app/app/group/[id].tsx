import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConquistasTab from "./conquistas-tab";
import { formatDateBR } from "@/utils/date";
import { getAchievements, AchievementResponse } from "@/services/achievements";

const TABS = ["Visão Geral", "Conquistas"] as const;
type Tab = (typeof TABS)[number];

function OverviewTab({ id, description, createdAt, name, achievementsCount }: { id: string; description?: string; createdAt: string; name: string; achievementsCount: string }) {
  const [recentAchievements, setRecentAchievements] = useState<AchievementResponse[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);

  useEffect(() => {
    getAchievements(id, { page: 0, size: 4 })
      .then((res) => setRecentAchievements(res.content))
      .catch(() => setRecentAchievements([]))
      .finally(() => setLoadingAchievements(false));
  }, [id]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      {/* Nome + Descrição unificados */}
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-xl px-5 py-5">
        <Text className="text-white text-[18px] font-semibold mb-1">{name}</Text>
        {!!description ? (
          <Text className="text-[#666666] text-[14px] leading-5">{description}</Text>
        ) : (
          <Text className="text-[#444444] text-[13px] italic">Sem descrição</Text>
        )}
      </View>

      {/* Informações do grupo */}
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <View className="flex-row items-center px-5 py-4">
          <Feather name="calendar" size={15} color="#666666" />
          <Text className="text-[#666666] text-[13px] ml-3 flex-1">Criado em</Text>
          <Text className="text-white text-[13px]">{formatDateBR(createdAt)}</Text>
        </View>
        <View className="h-[1px] bg-[#1f1f1f] mx-5" />
        <View className="flex-row items-center px-5 py-4">
          <Feather name="award" size={15} color="#f59e0b" />
          <Text className="text-[#666666] text-[13px] ml-3 flex-1">Conquistas</Text>
          <Text className="text-[#f59e0b] text-[13px] font-semibold">{achievementsCount}</Text>
        </View>
      </View>

      {/* Últimas conquistas */}
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <View className="flex-row items-center px-5 py-4 border-b border-[#f59e0b22]" style={{ backgroundColor: "#f59e0b08" }}>
          <Feather name="zap" size={14} color="#f59e0b" />
          <Text className="text-[#f59e0b] text-[11px] tracking-widest ml-2 font-semibold">ÚLTIMAS CONQUISTAS</Text>
        </View>

        {loadingAchievements ? (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color="#f59e0b" />
          </View>
        ) : recentAchievements.length === 0 ? (
          <View className="items-center py-6">
            <Text className="text-[#444444] text-[13px] italic">Nenhuma conquista ainda</Text>
          </View>
        ) : (
          recentAchievements.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View className="h-[1px] bg-[#1f1f1f] mx-5" />}
              <View className="flex-row items-center px-5 py-4 gap-3">
                <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: "#f59e0b18" }}>
                  <Feather name="award" size={14} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-[13px] font-medium" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-[#555555] text-[11px] mt-0.5">
                    {formatDateBR(item.achievedAt)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* ID do grupo */}
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-xl px-5 py-4">
        <Text className="text-[#666666] text-[11px] tracking-widest mb-2">ID DO GRUPO</Text>
        <Text
          className="text-[#888888] text-[12px]"
          style={{ fontFamily: "monospace" }}
          selectable
        >
          {id}
        </Text>
      </View>
    </ScrollView>
  );
}


export default function GroupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("Visão Geral");

  const { id, name, description, createdAt, achievementsCount } = useLocalSearchParams<{
    id: string;
    name: string;
    description?: string;
    createdAt: string;  
    achievementsCount: string;
  }>();

  return (
    <View className="flex-1 bg-[#0a0a0a]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <Pressable onPress={() => router.back()} hitSlop={10} className="p-1 mr-3 active:opacity-50">
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </Pressable>
        <Text className="flex-1 text-white text-[17px] font-semibold" numberOfLines={1}>
          {name}
        </Text>
      </View>

      {/* Tab bar */}
      <View className="flex-row border-b border-[#1f1f1f]">
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 items-center py-3 active:opacity-60"
            >
              <Text
                className="text-[13px] font-medium"
                style={{ color: active ? "#f59e0b" : "#666666" }}
              >
                {tab}
              </Text>
              {active && (
                <View className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#f59e0b] rounded-full" />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === "Visão Geral" && (
          <OverviewTab id={id} description={description} achievementsCount={achievementsCount} createdAt={createdAt} name={name} />
        )}
        {activeTab === "Conquistas" && <ConquistasTab groupId={id} />}
      </View>
    </View>
  );
}
