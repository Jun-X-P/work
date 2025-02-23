import chat from './modules/chat'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    [chat.name]: chat.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>

export default {
  actions: {
    [chat.name]: chat.actions,
  },
  reducer: {
    [chat.name]: chat.reducer,
  }
}
