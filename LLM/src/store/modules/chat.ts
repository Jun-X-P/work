import { createSlice } from "@reduxjs/toolkit";

interface ChatState {
  inputText: string;
  lastInputText: string;
  messages: { role: string; name: string; content: string }[];
  llmDialog: string[];
  isScrolling: boolean;
  isGenerating: boolean;
  images: string[];
  display: string;
  previewImage: string;
  isModalVisible: boolean;
}
// 定义初始状态
const defaultState: ChatState = {
  inputText: "",
  lastInputText: "",
  messages: [
    { role: "system", name: "system", content: "You are a helpful assistant." },
  ],
  llmDialog: [],
  isScrolling: false,
  isGenerating: false,
  images: [],
  display: "none",
  previewImage: "null",
  isModalVisible: false,
};

// 从 localStorage 获取所有 chatState，如果没有则使用默认初始状态
const storedChatStates = localStorage.getItem("chatStates");
const chatStates = storedChatStates
  ? JSON.parse(storedChatStates)
  : [defaultState];

// 假设我们使用第一个 chatState 作为初始状态
const initialState = chatStates[0];

// 创建 slice
const { reducer, actions, name } = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setState(state, { payload }) {
      Object.assign(state, payload);

      // 更新特定的 chatState
      let chatStateIndex = chatStates.findIndex(
        (chatState: ChatState) => chatState === state
      );
      chatStateIndex = chatStateIndex === -1 ? 0 : chatStateIndex;
      chatStates[chatStateIndex] = state;
      try {
        localStorage.setItem("chatStates", JSON.stringify(chatStates));
      } catch (error) {
        console.error("Error updating chat states in localStorage:", error);
      }
    },
    addChatState(_, { payload }) {
      chatStates.push(payload);
      try {
        localStorage.setItem("chatStates", JSON.stringify(chatStates));
      } catch (error) {
        console.error("Error adding chat state to localStorage:", error);
      }
    },
    removeChatState(state) {
      const chatStateIndex = chatStates.findIndex(
        (chatState: ChatState) => chatState === state
      );
      if (chatStateIndex !== -1) {
        chatStates.splice(chatStateIndex, 1);
        try {
          localStorage.setItem("chatStates", JSON.stringify(chatStates));
        } catch (error) {
          console.error("Error removing chat state from localStorage:", error);
        }
      }
    },
  },
});

export default {
  name,
  reducer,
  actions,
};
