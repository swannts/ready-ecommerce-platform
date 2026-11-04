import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { B2BQuoteRequest } from "@/types/cart";
import { RootState } from "../index";

export interface B2BQuoteState {
  quotes: B2BQuoteRequest[];
  status: "idle" | "submitting" | "succeeded" | "failed";
  lastSubmittedQuote: B2BQuoteRequest | null;
  error: string | null;
}

const initialState: B2BQuoteState = {
  quotes: [],
  status: "idle",
  lastSubmittedQuote: null,
  error: null,
};

// Async Thunk: Submit B2B wholesale procurement RFQ
export const submitB2BQuoteThunk = createAsyncThunk<
  B2BQuoteRequest,
  B2BQuoteRequest,
  { state: RootState; rejectValue: string }
>("b2b/submitQuote", async (quoteData, { rejectWithValue }) => {
  try {
    // Simulate procurement quotation submission API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!quoteData.companyName || !quoteData.email || !quoteData.quantityKg) {
      return rejectWithValue("Please fill in all mandatory business fields.");
    }

    const completedQuote: B2BQuoteRequest = {
      ...quoteData,
      id: `RFQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        100 + Math.random() * 900
      )}`,
    };

    return completedQuote;
  } catch {
    return rejectWithValue("Failed to submit RFQ. Please retry or call our desk.");
  }
});

export const b2bQuoteSlice = createSlice({
  name: "b2bQuote",
  initialState,
  reducers: {
    resetQuoteSubmission: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitB2BQuoteThunk.pending, (state) => {
        state.status = "submitting";
        state.error = null;
      })
      .addCase(submitB2BQuoteThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastSubmittedQuote = action.payload;
        state.quotes.push(action.payload);
      })
      .addCase(submitB2BQuoteThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Could not submit wholesale RFQ.";
      });
  },
});

export const { resetQuoteSubmission } = b2bQuoteSlice.actions;

export const selectB2BQuotes = (state: RootState) => state.b2bQuote.quotes;
export const selectB2BQuoteStatus = (state: RootState) =>
  state.b2bQuote.status;
export const selectLastSubmittedQuote = (state: RootState) =>
  state.b2bQuote.lastSubmittedQuote;

export default b2bQuoteSlice.reducer;
