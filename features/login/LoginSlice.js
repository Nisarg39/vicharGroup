import { createSlice } from '@reduxjs/toolkit'

export const loginSlice = createSlice({
  name: 'login',
  initialState: {
    loginStatus: false,
  },
  reducers: {
    loggedIn: (state) => {
      state.loginStatus = true
    },
    loggedOut: (state) => {
        state.loginStatus = false
      },
  }
})

// Action creators are generated for each case reducer function
export const { loggedIn, loggedOut } = loginSlice.actions

export default loginSlice.reducer