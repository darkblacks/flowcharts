import { getIdToken } from "@/lib/firebase/auth";

export async function getAuthHeaders() {
  const token = await getIdToken();

  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
}
