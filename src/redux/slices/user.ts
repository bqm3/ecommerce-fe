import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
import { IUserAccountGeneral } from '../../@types/user';
import { IPagination } from '../../@types/product';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

type IUserState = {
  isLoading: boolean;
  error: Error | string | null;
  users: IUserAccountGeneral[];
  pagination: IPagination | null;
};

const initialState: IUserState = {
  isLoading: false,
  error: null,
  users: [],
  pagination: null,
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET USERS
    getUsersSuccess(state, action) {
      state.isLoading = false;
      state.users = action.payload.users;
      state.pagination = action.payload.pagination;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getUsers(params?: any) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/users', { params });
      dispatch(slice.actions.getUsersSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
