import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const uploadReport = createAsyncThunk(
  "reports/uploadReport",
  async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(`${API_URL}/upload`, formData);
    return res.data;
  }
);

export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async () => {
    const res = await axios.get(`${API_URL}/reports`);
    return res.data;
  }
);

export const fetchReportById = createAsyncThunk(
  "reports/fetchReportById",
  async (id) => {
    const res = await axios.get(`${API_URL}/reports/${id}`);
    return res.data;
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadReport.pending, (state) => {
        state.status = "loading";
      })
      .addCase(uploadReport.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(uploadReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(fetchReports.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(fetchReportById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearCurrent } = reportsSlice.actions;
export default reportsSlice.reducer;
