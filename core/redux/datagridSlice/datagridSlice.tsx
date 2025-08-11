import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  perPage: "10",
}

export const datagridSlice = createSlice({
  name: 'datagrid',
  initialState,
  reducers: {
    setPerPage: (state, action) => {
      state.perPage = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setPerPage } = datagridSlice.actions

export default datagridSlice.reducer