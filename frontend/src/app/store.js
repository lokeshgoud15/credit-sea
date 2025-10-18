import { configureStore } from "@reduxjs/toolkit";
import reportsReducer from "../features/reportsSlice";

const store = configureStore({
  reducer: { reports: reportsReducer },
});

export default store;
