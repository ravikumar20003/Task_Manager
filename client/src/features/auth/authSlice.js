import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiError } from "../../api";

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/auth/me", { timeout: 2500 });
    return res.data.user;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const loginUser = createAsyncThunk("auth/loginUser", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", payload);
    return res.data.user;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const signupUser = createAsyncThunk("auth/signupUser", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/signup", payload);
    return res.data.user;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    await api.post("/auth/logout");
    return true;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

const initialState = {
  user: null,
  status: "idle",
  error: "",
  bootstrapped: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
        state.error = "";
        state.bootstrapped = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.status = "idle";
        state.bootstrapped = true;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
        state.error = "";
        state.bootstrapped = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null;
        state.status = "idle";
        state.error = action.payload;
      })
      .addCase(signupUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
        state.error = "";
        state.bootstrapped = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.user = null;
        state.status = "idle";
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        state.error = "";
        state.bootstrapped = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.status = "idle";
        state.bootstrapped = true;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
