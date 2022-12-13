import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export const graphDrawerSlice = createSlice({
  name: 'drawer',
  initialState: {
    open: false,
    id: '',
  },
  reducers: {
    toggleDrawer: (state, action) => {
      state.id === action.payload.id
        ? (state.open = !state.open)
        : (state.open = true);
      state.id = state.open ? action.payload.id : '';
    },
    closeDrawer: (state) => {
      state.open = false;
      state.id = '';
    },
  },
});

export const { toggleDrawer, closeDrawer } = graphDrawerSlice.actions;

export const selectFrameDrawerOpen = (state: RootState) =>
  state.graphDrawerOpen.open;

export const selectFrameDrawerId = (state: RootState) =>
  state.graphDrawerOpen.id;

export default graphDrawerSlice.reducer;
