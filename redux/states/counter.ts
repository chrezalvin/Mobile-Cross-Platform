import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Interface for the counter state
 */
interface CounterState {
    /**
     * The count of the counter, the count cannot be negative
     */
    count: number;
}

const initialState: CounterState = {
    count: 0
}

export const counterSlice = createSlice({
    name: "counter",
    initialState,
    reducers: {
        /**
         * increment counter value
         */
        add: (state) => {
            state.count += 1;
        },
        /**
         * decrement counter value
         */
        reduce: (state) => {
            if(state.count != 0)
                state.count -= 1;
        },
        /**
         * set the count of the counter
         * @param action non negative number
         */
        set: (state, action: PayloadAction<number>) => {
            if(action.payload >= 0)
                state.count = action.payload;
        }
    }
});

export const { add, reduce, set } = counterSlice.actions;

export const selectCount = (state: {counter: CounterState}) => state.counter.count;

export default counterSlice.reducer;