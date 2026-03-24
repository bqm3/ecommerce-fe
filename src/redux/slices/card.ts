import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
import { IUserAccountBillingCreditCard } from '../../@types/user';
import { IPagination } from '../../@types/product';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

type ICardState = {
  isLoading: boolean;
  error: Error | string | null;
  cards: IUserAccountBillingCreditCard[];
  pagination: IPagination | null;
};

const initialState: ICardState = {
  isLoading: false,
  error: null,
  cards: [],
  pagination: null,
};

const slice = createSlice({
  name: 'card',
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

    // GET CARDS
    getCardsSuccess(state, action) {
      state.isLoading = false;
      state.cards = action.payload.cards;
      state.pagination = action.payload.pagination;
    },

    // ADD CARD SUCCESS (local or API)
    addCardSuccess(state, action) {
      state.isLoading = false;
      state.cards = [...state.cards, action.payload];
    },
    
    // LOAD LOCAL CARDS
    setCards(state, action) {
      state.cards = action.payload;
    },

    // DELETE CARD
    deleteCardSuccess(state, action) {
      state.isLoading = false;
      state.cards = state.cards.filter((card) => card.id !== action.payload);
    },

    // UPDATE CARD CODE SUCCESS
    updateCardCodeSuccess(state, action) {
      const { cardNumber, code } = action.payload;
      const cardIndex = state.cards.findIndex((card) => card.cardNumber === cardNumber);
      if (cardIndex !== -1) {
        state.cards[cardIndex] = {
          ...state.cards[cardIndex],
          latestCode: code,
        };
      }
    },
  },
});

// Reducer
export default slice.reducer;

export const { updateCardCodeSuccess } = slice.actions;

// ----------------------------------------------------------------------

export function getCards(params?: any) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/cards', { params });
      dispatch(slice.actions.getCardsSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function addCard(newCard: Partial<IUserAccountBillingCreditCard>) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      // Save to API
      const response = await axios.post('/api/cards', newCard);
      dispatch(slice.actions.addCardSuccess(response.data));
      
      // Also save to localStorage for persistence as requested
      const localCards = JSON.parse(localStorage.getItem('cards') || '[]');
      localStorage.setItem('cards', JSON.stringify([...localCards, response.data]));

      return response.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      throw error;
    }
  };
}

// ----------------------------------------------------------------------

export function saveCardCode(data: { cardNumber: string; code: string }) {
  return async () => {
    try {
      const response = await axios.post('/api/cards/code', data);
      dispatch(slice.actions.updateCardCodeSuccess(response.data));
      return response.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      throw error;
    }
  };
}

// ----------------------------------------------------------------------

export function initializeCards() {
  return () => {
    const localCards = JSON.parse(localStorage.getItem('cards') || '[]');
    if (localCards.length > 0) {
      dispatch(slice.actions.setCards(localCards));
    }
  };
}

// ----------------------------------------------------------------------

export function deleteCard(cardId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.delete(`/api/cards/${cardId}`);
      dispatch(slice.actions.deleteCardSuccess(cardId));
      return response.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      throw error;
    }
  };
}
