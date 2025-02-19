import { configureStore } from '@reduxjs/toolkit'
import counterSlice from './counterSlice/counterSlice'
import userSlice from './userSlice/userSlice'
import snackSlice from './snackSlice/snackSlice'

export const store = configureStore({
  reducer: {
    counter: counterSlice,
    user: userSlice,
    snack: snackSlice
  },
})