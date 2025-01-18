import { createSlice } from '@reduxjs/toolkit'

export const loginSlice = createSlice({
  name: 'login',
  initialState: {
    loginStatus: false,
    studentDetails: {},
  },
  reducers: {
    loggedIn: (state) => {
      state.loginStatus = true
    },
    loggedOut: (state) => {
        state.loginStatus = false
    },
    studentDetails: (state, action) => {
        state.loginStatus = true
        state.studentDetails = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { loggedIn, loggedOut, studentDetails } = loginSlice.actions

export default loginSlice.reducer