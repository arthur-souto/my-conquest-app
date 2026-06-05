import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConquistasTab } from "./conquistas-tab";
import { formatDateBR } from "@/utils/date";

const TABS = ["Visão Geral", "Conquistas"] as const;
type Tab = (typeof TABS)[number];

function OverviewTab({ id, description, createdAt, name, achievementsCount }: { id: string; description?: string; createdAt: string; name: string; achievementsCount: string }) {
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
          <Feather name="award" size={15} color="#666666" />
          <Text className="text-[#666666] text-[13px] ml-3 flex-1">Conquistas</Text>
          <Text className="text-white text-[13px]">{achievementsCount}</Text>
        </View>
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
                style={{ color: active ? "#ffffff" : "#666666" }}
              >
                {tab}
              </Text>
              {active && (
                <View className="absolute bottom-0 left-4 right-4 h-[2px] bg-white rounded-full" />
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
