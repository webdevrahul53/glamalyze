import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: {},
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // decrement: (state) => {
        // Redux Toolkit allows us to write "mutating" logic in reducers. It
        // doesn't actually mutate the state because it uses the Immer library,
        // which detects changes to a "draft state" and produces a brand new
        // immutable state based off those changes
    //   state.value -= 1
    // },
    setUser: (state, action) => {
      state.value = action.payload
      if(state.value) localStorage.setItem('user', JSON.stringify(action.payload))
      else localStorage.removeItem('user')
    },
  },
})

// Action creators are generated for each case reducer function
export const { setUser } = userSlice.actions

export default userSlice.reducer