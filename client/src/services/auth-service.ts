
import { apiRequest } from "../lib/queryClient";

interface LoginCredentials {
  username: string;
  password: string;
}

export async function loginUser(credentials: LoginCredentials) {
  const response = await apiRequest("POST", "/api/login", credentials);
  return response.json();
}

export async function logoutUser() {
  return apiRequest("POST", "/api/logout");
}

export async function registerUser(userData: any) {
  const response = await apiRequest("POST", "/api/register", userData);
  return response.json();
}
