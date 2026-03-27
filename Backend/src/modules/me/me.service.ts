import { env } from "../../config/env.js";
import {
  getCurrentSubscription,
  getOrCreateAppUser,
  type AuthUserInput,
} from "../../lib/app-user.js";
import { supabaseAdmin } from "../../lib/supabase-admin.js";

export async function getProfileService(authUser: AuthUserInput) {
  if (!supabaseAdmin) {
    throw new Error("Supabase Admin não configurado no backend.");
  }

  const appUser = await getOrCreateAppUser(authUser);
  const subscription = await getCurrentSubscription(appUser.id);

  const { count, error: accessCountError } = await supabaseAdmin
    .from("access_code_users")
    .select("*", { count: "exact", head: true })
    .eq("user_id", appUser.id);

  if (accessCountError) {
    throw new Error("Não foi possível buscar os acessos do usuário.");
  }

  return {
    user: {
      id: appUser.id,
      firebaseUid: appUser.firebase_uid,
      email: appUser.email,
      name: appUser.name,
      status: appUser.status,
    },
    subscription,
    accessGrantedCount: count ?? 0,
    devPaymentBypassAvailable: env.NODE_ENV !== "production",
  };
}