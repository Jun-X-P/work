import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export interface ChatState {
  id: string; // 添加唯一标识符
  name: string; // 对话名称
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
  id: uuidv4(),
  name: "新对话",
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
let storedChatStates = localStorage.getItem("chatStates");

let initialChatStates = storedChatStates
  ? JSON.parse(storedChatStates)
  : [defaultState];

if (initialChatStates.length === 0) initialChatStates.push(defaultState);

// 假设我们使用第一个 chatState 作为初始状态
const initialState = initialChatStates[0];

// 创建 slice
const { reducer, actions, name } = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setState(state, { payload }) {
      Object.assign(state, payload);

      // 更新特定的 chatState 并保存到 localStorage
      storedChatStates = localStorage.getItem("chatStates"); //重新获取一下

      initialChatStates = storedChatStates
        ? JSON.parse(storedChatStates)
        : [defaultState];
      const updatedChatStates = initialChatStates.map((chatState: ChatState) =>
        chatState.id === state.id ? { ...state } : chatState
      );
      try {
        localStorage.setItem("chatStates", JSON.stringify(updatedChatStates));
        // console.log(
        //   "state改变",
        //   JSON.parse(localStorage.getItem("chatStates")),
        //   initialChatStates
        // );
      } catch (error) {
        console.error("Error updating chat states in localStorage:", error);
      }
    },
    addChatState(_, { payload }) {
      const newChatState: ChatState = {
        id: uuidv4(), // 生成唯一标识符
        name: "新对话",
        ...payload,
      };
      // 添加新的 chatState 并保存到 localStorage
      storedChatStates = localStorage.getItem("chatStates"); //重新获取一下

      initialChatStates = storedChatStates
        ? JSON.parse(storedChatStates)
        : [defaultState];
      const updatedChatStates = [...initialChatStates, newChatState];
      try {
        localStorage.setItem("chatStates", JSON.stringify(updatedChatStates));
        // console.log(
        //   "新对话",
        //   JSON.parse(localStorage.getItem("chatStates")),
        //   initialChatStates
        // );
      } catch (error) {
        console.error("Error adding chat state to localStorage:", error);
      }

      return newChatState;
    },
    removeChatState(_, { payload }) {
      storedChatStates = localStorage.getItem("chatStates"); //重新获取一下

      initialChatStates = storedChatStates
        ? JSON.parse(storedChatStates)
        : [defaultState];
      const updatedChatStates = initialChatStates.filter(
        (chatState: ChatState) => chatState.id !== payload.id
      );

      // 移除 chatState 并保存到 localStorage
      try {
        localStorage.setItem("chatStates", JSON.stringify(updatedChatStates));
        // initialChatStates = updatedChatStates;
      } catch (error) {
        console.error("Error removing chat state from localStorage:", error);
      }
    },
  },
});

export default {
  name,
  reducer,
  actions,
};
