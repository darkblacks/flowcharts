export type ProfileResponse = {
  user: {
    id: string;
    firebaseUid: string;
    email: string | null;
    name: string | null;
    status: string;
  };
  subscription: null | {
    id: string;
    status: string;
    startedAt: string | null;
    expiresAt: string | null;
    canAccessWorkspaces: boolean;
    plan: {
      id: string;
      slug: string;
      name: string;
      priceCents: number;
      currency: string;
      features: string[];
    };
  };
  accessGrantedCount: number;
  devPaymentBypassAvailable: boolean;
};

export type CheckoutResponse = {
  orderId: string;
  checkoutUrl: string | null;
  message: string;
};