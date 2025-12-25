import { apiUrl } from './config';
import { CheckIn } from '../lib/schema';

export interface CheckInWithCustomer extends CheckIn {
  customerName: string;
  customerNameAr: string;
  customerPhone: string;
}

export interface CheckInSummary {
  totalCheckIns: number;
  totalMeals: number;
  presentDays: number;
  absentDays: number;
  pausedDays: number;
}

// Get check-ins with optional filters
export const getCheckIns = async (params?: {
  startDate?: string;
  endDate?: string;
  userId?: number;
  subscriptionId?: number;
}): Promise<CheckInWithCustomer[]> => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.userId) queryParams.append('userId', params.userId.toString());
  if (params?.subscriptionId) queryParams.append('subscriptionId', params.subscriptionId.toString());

  const response = await fetch(apiUrl(`checkins?${queryParams}`));
  if (!response.ok) {
    throw new Error('Failed to fetch check-ins');
  }
  return response.json();
};

// Get today's check-ins
export const getTodayCheckIns = async (): Promise<CheckInWithCustomer[]> => {
  const response = await fetch(apiUrl('checkins/today'));
  if (!response.ok) {
    throw new Error('Failed to fetch today\'s check-ins');
  }
  return response.json();
};

// Create a new check-in
export const createCheckIn = async (checkInData: {
  subscriptionId: number;
  userId: number;
  checkInDate: string;
  mealsPickedUp?: number;
  attendanceStatus?: 'present' | 'absent' | 'paused';
  notes?: string;
}): Promise<CheckIn> => {
  const response = await fetch(apiUrl('checkins'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(checkInData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create check-in');
  }

  return response.json();
};

// Update a check-in
export const updateCheckIn = async (
  id: number,
  updates: {
    mealsPickedUp?: number;
    attendanceStatus?: 'present' | 'absent' | 'paused';
    notes?: string;
  }
): Promise<CheckIn> => {
  const response = await fetch(apiUrl(`checkins/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update check-in');
  }

  return response.json();
};

// Delete a check-in
export const deleteCheckIn = async (id: number): Promise<void> => {
  const response = await fetch(apiUrl(`checkins/${id}`), {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete check-in');
  }
};

// Get check-in summary for a subscription
export const getCheckInSummary = async (
  subscriptionId: number,
  dateRange?: { startDate: string; endDate: string }
): Promise<CheckInSummary> => {
  const queryParams = new URLSearchParams();
  if (dateRange) {
    queryParams.append('startDate', dateRange.startDate);
    queryParams.append('endDate', dateRange.endDate);
  }

  const response = await fetch(
    apiUrl(`checkins/subscription/${subscriptionId}/summary?${queryParams}`)
  );

  if (!response.ok) {
    throw new Error('Failed to fetch check-in summary');
  }

  return response.json();
};