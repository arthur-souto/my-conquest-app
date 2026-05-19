import AsyncStorageImpl from "@/services/storage";
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1  flex items-center  bg-black">
      <Text className="text-white text-2xl ">
        {AsyncStorageImpl.getItem(AsyncStorageImpl.TOKEN_KEY).then((res) => JSON.parse(res!)?.accessToken)}
      </Text>
    </View>
  );
}
