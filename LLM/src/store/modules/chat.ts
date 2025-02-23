import { createSlice } from "@reduxjs/toolkit";
// 定义初始状态
const initialState = {
  inputText: "",
  lastInputText: "",
  messages: [
    { role: "system", name: "system", content: "You are a helpful assistant." },
  ],
  llmDialog: [],
  isScrolling: false,
  isGenerat: false,
  images: [],
  display: "none",
  previewImage: "null",
  isModalVisible: false,
};

// 创建 slice
const { reducer, actions, name } = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setState(state, { payload }) {
      Object.assign(state, payload);
    },
  },
});

export default {
  name,
  reducer,
  actions,
};
