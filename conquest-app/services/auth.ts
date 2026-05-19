import { api } from "./api";


type SignInRequest = {
  email: string;
  password: string;
};

type SignInResponse = {
  accessToken: string;
  expirationInHours: number;
};

const API_PREFIX = "/auth";

export async function signIn(body: SignInRequest): Promise<SignInResponse> {
  const { data } = await api.post<SignInResponse>(`${API_PREFIX}/sign-in`, body);
  return data;
}
