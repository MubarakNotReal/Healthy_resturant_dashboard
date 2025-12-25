import { apiUrl } from "./config";

export interface CustomerSubscription {
  id: number;
  plan: string;
  startDate: string;
  endDate: string;
  status: string;
  daysRemaining: number;
  mealsPerDay?: number;
}

export interface CustomerApiRecord {
  id: number;
  name: string;
  nameAr?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
  createdAt: string;
  plan?: string;
  mealsPerDay?: number;
  daysRemaining?: number;
  lastPickup?: string;
  subscriptionStatus?: string;
  subscriptionId?: number;
  subscriptions?: CustomerSubscription[];
  startDate?: string;
  endDate?: string;
}

export const getCustomers = async (): Promise<CustomerApiRecord[]> => {
  const response = await fetch(apiUrl("customers"));
  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }

  const data = (await response.json()) as CustomerApiRecord[];

  return data.map((customer) => {
    if (customer.subscriptionId || !customer.subscriptions?.length) {
      return customer;
    }

    const activeSubscription = customer.subscriptions.find(
      (subscription) => subscription.status === "active"
    );

    if (!activeSubscription) {
      return customer;
    }

    return {
      ...customer,
      subscriptionId: activeSubscription.id,
      subscriptionStatus: customer.subscriptionStatus ?? activeSubscription.status,
      plan: customer.plan ?? activeSubscription.plan,
      daysRemaining: activeSubscription.daysRemaining ?? customer.daysRemaining,
      mealsPerDay: customer.mealsPerDay ?? activeSubscription.mealsPerDay,
      startDate: customer.startDate ?? activeSubscription.startDate,
      endDate: customer.endDate ?? activeSubscription.endDate,
    };
  });
};
