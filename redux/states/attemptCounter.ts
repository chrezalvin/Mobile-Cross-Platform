import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Interface for the counter state
 */
interface AttemptCounterState {
    /**
     * The count of the counter, the count cannot be negative
     */
    failedAttempts: number;
    successAttempts: number;
}

const initialState: AttemptCounterState = {
    failedAttempts: 0,
    successAttempts: 0
};

export const counterSlice = createSlice({
    name: "counter",
    initialState,
    reducers: {
        addSuccess: (state) => {
            state.successAttempts += 1;
        },
        addFailed: (state) => {
            state.failedAttempts += 1;
        },
        setSuccess: (state, action: PayloadAction<number>) => {
            if(action.payload >= 0)
                state.successAttempts = action.payload;
        },
        setFailed: (state, action: PayloadAction<number>) => {
            if(action.payload >= 0)
                state.failedAttempts = action.payload;
        },
        reset: (state) => {
            state.failedAttempts = 0;
            state.successAttempts = 0;
        }
    }
});

export const { addSuccess, addFailed, setSuccess, setFailed, reset } = counterSlice.actions;

export const selectCount = (state: {counter: AttemptCounterState}) => state.counter;

export default counterSlice.reducer;