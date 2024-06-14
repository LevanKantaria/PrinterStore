import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lang: "KA",
};

const langSlice = createSlice({
  name: "lang",
  initialState,
  reducers: {
    changeLang: (state, action) => {
        state.lang = action.payload;

    },
  },
});


export default langSlice.reducer;
export const langActions = langSlice.actions;
