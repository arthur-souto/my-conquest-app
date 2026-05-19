import AsyncStorage from '@react-native-async-storage/async-storage'


export default class AsyncStorageImpl {

    public static readonly TOKEN_KEY = "accessToken"
    

    public static async setItem(key: string, value: string) {
        await AsyncStorage.setItem(key, value)
    }

    public static async getItem(key: string) {
        return await AsyncStorage.getItem(key)
    }

    public static async removeItem(key: string) {
        await AsyncStorage.removeItem(key)
    }
}