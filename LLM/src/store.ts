// src/store/index.ts
import { configureStore, createReducer } from '@reduxjs/toolkit';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { LLMDialogProps } from './component/LLMDialog';

// 定义初始状态
const initialState = {
  inputText: '',
  lastInputText: '',
  messages: [{ role: "system", content: "You are a helpful assistant." }],
  llmDialog: [],
  isScrolling: false,
  isGenerat: false,
  images: [],
  display: 'none',
  previewImage: 'null',
  isModalVisible: false,
};

// 通用的 action type 前缀
const ACTION_PREFIX = 'SET_';

// 生成 reducer 的函数
const createSetReducer = <T>(initialValue: T, actionType: string) =>
  createReducer(initialValue, (builder) => {
    builder.addCase(`${ACTION_PREFIX}${actionType}`, (_, action : any) => action.payload);
  });

// 定义 rootReducer
const rootReducer = {
  inputText: createSetReducer(initialState.inputText, 'INPUT_TEXT'),
  lastInputText: createSetReducer(initialState.lastInputText, 'LAST_INPUT_TEXT'),
  messages: createSetReducer(initialState.messages, 'MESSAGES'),
  llmDialog: createSetReducer(initialState.llmDialog, 'LLM_DIALOG'),
  isScrolling: createSetReducer(initialState.isScrolling, 'IS_SCROLLING'),
  isGenerat: createSetReducer(initialState.isGenerat, 'IS_GENERAT'),
  images: createSetReducer(initialState.images, 'IMAGES'),
  display: createSetReducer(initialState.display, 'DISPLAY'),
  previewImage: createSetReducer(initialState.previewImage, 'PREVIEW_IMAGE'),
  isModalVisible: createSetReducer(initialState.isModalVisible, 'IS_MODAL_VISIBLE'),
};

// 配置 store
const store = configureStore({
  reducer: rootReducer,
});

// 定义 RootState 接口
export interface RootState {
  inputText: string;
  lastInputText: string;
  messages: ChatCompletionMessageParam[];
  llmDialog: LLMDialogProps[];
  isScrolling: boolean;
  isGenerat: boolean;
  images: any[];
  display: string;
  previewImage: string;
  isModalVisible: boolean;
}

// 定义 AppDispatch 类型
export type AppDispatch = typeof store.dispatch;

export default store;