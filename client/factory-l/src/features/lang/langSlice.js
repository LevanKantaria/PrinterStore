import { createSlice } from "@reduxjs/toolkit";

// Initialize from localStorage if available
const getInitialLang = () => {
  const savedLang = localStorage.getItem("lang");
  return savedLang || "KA";
};

const initialState = {
  lang: getInitialLang(),
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
