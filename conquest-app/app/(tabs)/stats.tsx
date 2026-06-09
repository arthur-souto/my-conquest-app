import { UserBar } from "@/components/user-bar";
import { AchievementCategory } from "@/services/achievements";
import { getStats, StatsResponse } from "@/services/stats";
import { useEffect, useRef, useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryPie } from "victory-native";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<AchievementCategory, { label: string; color: string }> = {
  career:   { label: "Carreira",    color: "#3b82f6" },
  personal: { label: "Pessoal",     color: "#a855f7" },
  learning: { label: "Aprendizado", color: "#22c55e" },
  fitness:  { label: "Fitness",     color: "#f97316" },
};

const PT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMonth(key: string): string {
  const [year, month] = key.split("-");
  return `${PT_MONTHS[parseInt(month, 10) - 1]}/${year.slice(2)}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return [
    String(d.getUTCDate()).padStart(2, "0"),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    d.getUTCFullYear(),
  ].join("/");
}

// ─── Small shared components ──────────────────────────────────────────────────

function DifficultyDots({ level }: { level: number }) {
  const rounded = Math.round(level);
  return (
    <View className="flex-row gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <View
          key={n}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: n <= rounded ? "#ffffff" : "#2a2a2a" }}
        />
      ))}
    </View>
  );
}

function CategoryBadge({ category }: { category: AchievementCategory }) {
  const config = CATEGORY_CONFIG[category] ?? { label: category, color: "#666666" };
  return (
    <View
      className="rounded px-2 py-0.5 self-start"
      style={{ backgroundColor: config.color + "22", borderWidth: 1, borderColor: config.color + "55" }}
    >
      <Text style={{ color: config.color, fontSize: 11, fontWeight: "500" }}>{config.label}</Text>
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StatsSkeleton() {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={{ opacity: pulse }} className="px-4 pt-2 gap-3">
      <View className="flex-row gap-3">
        <View className="flex-1 bg-[#111111] border border-[#1f1f1f] rounded-md h-24" />
        <View className="flex-1 bg-[#111111] border border-[#1f1f1f] rounded-md h-24" />
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1 bg-[#111111] border border-[#1f1f1f] rounded-md h-24" />
        <View className="flex-1 bg-[#111111] border border-[#1f1f1f] rounded-md h-24" />
      </View>
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-md h-16" />
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-md h-[88px]" />
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-md h-56" />
      <View className="bg-[#111111] border border-[#1f1f1f] rounded-md h-64" />
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // inner card width: screen - horizontal padding (16*2) - card padding (16*2)
  const chartWidth = width - 64;

  const fetchStats = () => {
    setLoading(true);
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, []);

  const monthData = stats
    ? Object.entries(stats.achievementsByMonth).map(([key, value]) => ({
        x: formatMonth(key),
        y: value,
      }))
    : [];

  const categoryData = stats
    ? Object.entries(stats.achievementsByCategory).map(([key, value]) => ({
        x: CATEGORY_CONFIG[key as AchievementCategory]?.label ?? key,
        y: value,
        color: CATEGORY_CONFIG[key as AchievementCategory]?.color ?? "#666666",
      }))
    : [];

  return (
    <View className="flex-1 bg-[#0a0a0a]" style={{ paddingTop: insets.top }}>
      <UserBar />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Header */}
        <View className="px-4 pt-4 pb-3 flex-row items-center">
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">Estatísticas</Text>
            <Text className="text-[#666666] text-[12px] mt-0.5">Resumo das suas conquistas</Text>
          </View>
          <Pressable
            onPress={fetchStats}
            disabled={loading}
            hitSlop={8}
            className="w-8 h-8 rounded-full bg-[#1f1f1f] items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator size={14} color="#666666" />
            ) : (
              <Feather name="refresh-cw" size={14} color="#666666" />
            )}
          </Pressable>
        </View>

        {loading ? (
          <StatsSkeleton />
        ) : !stats ? (
          <View className="px-4 pt-10 items-center">
            <Text className="text-[#666666] text-[13px]">Erro ao carregar estatísticas.</Text>
          </View>
        ) : (
          <View className="px-4 gap-3">

            {/* Row 1: Total Conquistas + Total Evidências */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-[#111111] border border-[#1f1f1f] rounded-md p-4">
                <Text className="text-[#666666] text-[11px] mb-2">Total Conquistas</Text>
                <Text className="text-white text-3xl font-bold">{stats.totalAchievements}</Text>
              </View>
              <View className="flex-1 bg-[#111111] border border-[#1f1f1f] rounded-md p-4">
                <Text className="text-[#666666] text-[11px] mb-2">Total Evidências</Text>
                <Text className="text-white text-3xl font-bold">{stats.totalEvidences}</Text>
              </View>
            </View>

            {/* Row 2: Média Dificuldade + Categoria Favorita */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-[#111111] border border-[#1f1f1f] rounded-md p-4">
                <Text className="text-[#666666] text-[11px] mb-3">Média Dificuldade</Text>
                <Text className="text-white text-2xl font-bold mb-3">
                  {stats.averageDifficulty.toFixed(1)}
                </Text>
                <DifficultyDots level={stats.averageDifficulty} />
              </View>
              <View className="flex-1 bg-[#111111] border border-[#1f1f1f] rounded-md p-4">
                <Text className="text-[#666666] text-[11px] mb-3">Categoria Favorita</Text>
                <CategoryBadge category={stats.favoriteCategory} />
              </View>
            </View>

            {/* Mês Mais Produtivo */}
            <View className="bg-[#111111] border border-[#1f1f1f] rounded-md px-4 py-3 flex-row items-center justify-between">
              <Text className="text-[#666666] text-[11px]">Mês Mais Produtivo</Text>
              <Text className="text-white text-[15px] font-semibold">
                {formatMonth(stats.mostProductiveMonth)}
              </Text>
            </View>

            {/* Última Conquista */}
            {stats.lastAchievement && (
              <View className="bg-[#111111] border border-[#1f1f1f] rounded-md p-4">
                <Text className="text-[#666666] text-[11px] mb-2">Última Conquista</Text>
                <Text className="text-white text-[14px] font-semibold mb-2" numberOfLines={2}>
                  {stats.lastAchievement.title}
                </Text>
                <View className="flex-row items-center gap-2">
                  <CategoryBadge category={stats.lastAchievement.category} />
                  <Text className="text-[#555555] text-[11px]">
                    {formatDate(stats.lastAchievement.achievedAt)}
                  </Text>
                </View>
              </View>
            )}

            {/* Bar Chart — Conquistas por Mês */}
            {monthData.length > 0 && (
              <View className="bg-[#111111] border border-[#1f1f1f] rounded-md px-4 pt-4 pb-2">
                <Text className="text-white text-[13px] font-semibold mb-1">
                  Conquistas por Mês
                </Text>
                <VictoryChart
                  width={chartWidth}
                  height={200}
                  domainPadding={{ x: monthData.length === 1 ? 60 : 20 }}
                  padding={{ top: 16, bottom: 40, left: 36, right: 16 }}
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: "#333333" },
                      tickLabels: { fill: "#666666", fontSize: 9, fontFamily: "system" },
                      grid: { stroke: "transparent" },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{
                      axis: { stroke: "#333333" },
                      tickLabels: { fill: "#666666", fontSize: 9, fontFamily: "system" },
                      grid: { stroke: "#1f1f1f" },
                    }}
                    tickFormat={(t: number) => (Number.isInteger(t) ? String(t) : "")}
                  />
                  <VictoryBar
                    data={monthData}
                    style={{ data: { fill: "#f59e0b" } }}
                    cornerRadius={{ top: 3 }}
                  />
                </VictoryChart>
              </View>
            )}

            {/* Horizontal Bar Chart — Conquistas por Categoria */}
            {categoryData.length > 0 && (
              <View className="bg-[#111111] border border-[#1f1f1f] rounded-md px-4 pt-4 pb-3">
                <Text className="text-white text-[13px] font-semibold mb-1">
                  Conquistas por Categoria
                </Text>
                <VictoryChart
                  width={chartWidth}
                  height={categoryData.length * 52 + 40}
                  horizontal
                  padding={{ top: 16, bottom: 32, left: 84, right: 32 }}
                  domainPadding={{ y: 16 }}
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: "#333333" },
                      tickLabels: { fill: "#888888", fontSize: 10, fontFamily: "system" },
                      grid: { stroke: "transparent" },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{
                      axis: { stroke: "#333333" },
                      tickLabels: { fill: "#666666", fontSize: 9, fontFamily: "system" },
                      grid: { stroke: "#1f1f1f" },
                    }}
                    tickFormat={(t: number) => (Number.isInteger(t) ? String(t) : "")}
                  />
                  <VictoryBar
                    data={categoryData}
                    style={{
                      data: { fill: ({ datum }: any) => datum?.color ?? "#666666" },
                    }}
                    cornerRadius={{ top: 3 }}
                  />
                </VictoryChart>

                {/* Legend */}
                <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-1 px-1">
                  {categoryData.map((d) => (
                    <View key={d.x} className="flex-row items-center gap-1.5">
                      <View
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <Text className="text-[#888888] text-[11px]">
                        {d.x} ({d.y})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

          </View>
        )}
      </ScrollView>
    </View>
  );
}
