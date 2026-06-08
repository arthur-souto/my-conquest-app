import axios from "axios";
import AsyncStorageImpl from "../services/storage";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});



api.interceptors.request.use(async (config) => {
  const raw = await AsyncStorageImpl.getItem(AsyncStorageImpl.TOKEN_KEY);
  if (raw) {
    const { accessToken } = JSON.parse(raw);
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const raw = await AsyncStorageImpl.getItem(AsyncStorageImpl.TOKEN_KEY);
      if (!raw) return Promise.reject(error);
      
      const { refreshToken } = JSON.parse(raw);
      
      const res = await fetch(`${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/realms/${process.env.EXPO_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID!,
          refresh_token: refreshToken,
        }).toString(),
      });

      const data = await res.json();

      if (data.access_token) {
        await AsyncStorageImpl.setItem(
          AsyncStorageImpl.TOKEN_KEY,
          JSON.stringify({ 
            accessToken: data.access_token,
            refreshToken: data.refresh_token 
          })
        );
        error.config.headers.Authorization = `Bearer ${data.access_token}`;
        return api(error.config);
      }
    }
    return Promise.reject(error);
  }
);