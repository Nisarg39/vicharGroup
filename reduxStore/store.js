import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "../features/login/LoginSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      login: loginReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
}

export function studentDetails(state) {
  return configureStore({
    reducer: {
      studentDetails: state,
    },
    devTools: process.env.NODE_ENV !== "production",
  })
}

export const store = makeStore();