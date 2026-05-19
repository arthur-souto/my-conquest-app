import axios from "axios";
import AsyncStorageImpl from "./storage";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});



api.interceptors.request.use(
  async (req) => {

    const token = await AsyncStorageImpl.getItem(AsyncStorageImpl.TOKEN_KEY);
   
    if (token) {

    req.headers.Authorization = `Bearer ${JSON.parse(token).accessToken}`;

    }
    
    return req
  },
  (error) => {
    return Promise.reject(error);
  }
);

