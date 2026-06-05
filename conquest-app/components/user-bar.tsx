import { useUser } from "@/contexts/user";
import { Image } from "expo-image";
import { Text, View } from "react-native";

function Skeleton({ width, height }: { width: number; height: number }) {
  return (
    <View
      className="bg-[#1f1f1f] rounded-md"
      style={{ width, height }}
    />
  );
}

export function UserBar() {
  const { user, loading } = useUser();

  const initial = user?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <View className="flex-row items-center px-5 py-3 border-b border-[#1a1a1a] gap-3">
      {/* Avatar */}
      <View className="w-9 h-9 rounded-full bg-[#1f1f1f] overflow-hidden items-center justify-center">
        {user?.profileImage ? (
          <Image
            source={{ uri: user.profileImage }}
            style={{ width: 36, height: 36 }}
            contentFit="cover"
          />
        ) : loading ? (
          <View className="w-9 h-9 rounded-full bg-[#2a2a2a]" />
        ) : (
          <Text className="text-white text-[13px] font-bold">{initial}</Text>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 gap-1">
        {loading ? (
          <>
            <Skeleton width={120} height={11} />
            <Skeleton width={160} height={10} />
          </>
        ) : (
          <>
            <Text className="text-white text-[13px] font-semibold" numberOfLines={1}>
              {user?.name ?? "—"}
            </Text>
            <Text className="text-[#555555] text-[11px]" numberOfLines={1}>
              {user?.email ?? ""}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
