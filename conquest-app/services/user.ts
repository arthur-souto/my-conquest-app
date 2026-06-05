import { api } from "./api";

const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL!;
const REALM = process.env.EXPO_PUBLIC_KEYCLOAK_REALM!;

export interface User {
  username: string;
  name: string;
  email: string;
  profileImage: string;
}

export interface UpdateCredentialsRequest {
  username: string;
  name: string;
  email: string;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export async function updateProfileImage(profileImage: string): Promise<void> {
  await api.patch("/users/me", { profileImage });
}

export async function updateCredentials(req: UpdateCredentialsRequest): Promise<void> {
  const spaceIndex = req.name.indexOf(" ");
  const firstName = spaceIndex === -1 ? req.name : req.name.slice(0, spaceIndex);
  const lastName = spaceIndex === -1 ? "" : req.name.slice(spaceIndex + 1);

  await api.post(
    `${KEYCLOAK_URL}/realms/${REALM}/account`,
    { username: req.username, email: req.email, firstName, lastName }
  );

  await api.put("/users/credentials", req);
}
