import { supabaseAdmin } from "./supabase-admin.js";

export type AuthUserInput = {
  firebaseUid: string;
  email: string | null;
  name: string | null;
};

export type AppUserRecord = {
  id: string;
  firebase_uid: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  status: string;
};

export async function getOrCreateAppUser(
  input: AuthUserInput
): Promise<AppUserRecord> {
  if (!supabaseAdmin) {
    throw new Error("Supabase Admin não configurado no backend.");
  }

  const { data, error } = await supabaseAdmin
    .from("app_users")
    .upsert(
      {
        firebase_uid: input.firebaseUid,
        email: input.email,
        name: input.name,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "firebase_uid",
      }
    )
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Não foi possível sincronizar o usuário.");
  }

  return data as AppUserRecord;
}

export async function getCurrentSubscription(userId: string) {
  if (!supabaseAdmin) {
    throw new Error("Supabase Admin não configurado no backend.");
  }

  const { data: subscription, error: subscriptionError } = await supabaseAdmin
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscriptionError) {
    throw new Error("Não foi possível buscar a assinatura.");
  }

  if (!subscription) {
    return null;
  }

  const { data: plan, error: planError } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("id", subscription.plan_id)
    .single();

  if (planError || !plan) {
    throw new Error("Não foi possível buscar o plano.");
  }

  return {
    id: subscription.id as string,
    status: subscription.status as string,
    startedAt: subscription.started_at as string | null,
    expiresAt: subscription.expires_at as string | null,
    canAccessWorkspaces: ["active", "trialing"].includes(
      subscription.status as string
    ),
    plan: {
      id: plan.id as string,
      slug: plan.slug as string,
      name: plan.name as string,
      priceCents: plan.price_cents as number,
      currency: plan.currency as string,
      features: Array.isArray(plan.features) ? plan.features : [],
    },
  };
}