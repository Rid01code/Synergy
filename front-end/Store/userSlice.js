import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profilePic: null,
  },
  reducers: {
    setProfilePic: (state, action) => {
      state.profilePic = action.payload;
    },
  },
});

export const { setProfilePic } = userSlice.actions;
export default userSlice.reducer;