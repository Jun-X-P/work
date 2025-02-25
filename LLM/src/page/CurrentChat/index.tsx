import React, { useEffect, useRef } from 'react';
import { Layout, Input, message } from 'antd';
import { ArrowUpOutlined, PauseCircleOutlined } from '@ant-design/icons';
import OpenAI from "openai";
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import DialogBubble from '@/component/dialogueBubble';
import CombinedInputArea from '@/component/paste';
import { useDispatch, useSelector } from 'react-redux';
import store from '@/store';
import { RootState } from '@/store';
import { useParams } from 'react-router-dom';
import { ChatState } from '@/store/modules/chat';

const { Content } = Layout;

export interface LLMDialogProps {
  id: number;
  type: string;
  text: string;
}

interface Input {
  imgurl: string[];
  text: string;
}

const openai = new OpenAI({
  apiKey: 'sk-abc6845c88d44b2aafd6e189ac3933b6',
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  dangerouslyAllowBrowser: true //需要优化 避免危险
});


const LLMDialog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const actions = store.actions.chat;
  const inputText = useSelector((state: RootState) => state.chat.inputText);
  const lastInputText = useSelector((state: RootState) => state.chat.lastInputText);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const llmDialog = useSelector((state: RootState) => state.chat.llmDialog);
  const isScrolling = useSelector((state: RootState) => state.chat.isScrolling);
  const isGenerating = useSelector((state: RootState) => state.chat.isGenerating);
  const images = useSelector((state: RootState) => state.chat.images);
  const name = useSelector((state: RootState) => state.chat.name);

  const abortControllerRef = useRef<AbortController | null>(null);
  const llmDialogRef = useRef<LLMDialogProps[]>([]);
  const isRegenerateRef = useRef<boolean>(false);
  const scrollY = useRef(0);

  useEffect(() => {
    if (id) {
      const storedChatStates = localStorage.getItem("chatStates");
      const chatStates = storedChatStates
        ? JSON.parse(storedChatStates)
        : [];
      const chatState = chatStates.find((chatState: ChatState) => chatState.id === id);
      if (chatState) {
        dispatch(actions.setState(chatState));
      }
      // setCurrentChatState(chatState);
    }
  }, [id]);


  // useEffect(() => {
  //   // 禁用整个页面的滚动
  //   document.body.style.overflow = 'hidden';
  //   return () => {
  //     // 恢复页面滚动
  //     document.body.style.overflow = '';
  //   };
  // }, []); 

  const fetchAi = async (content: Input) => {
    // 设置问题
    llmDialogRef.current = [
      ...llmDialog,
      { id: Date.now(), type: 'user', text: content.text ? content.text : '这是什么' },
    ];//有可能单独黏贴一张图片就按回车提问了 所以要初始化text

    dispatch(actions.setState({ llmDialog: llmDialogRef.current }));
    const tempMessages: ChatCompletionMessageParam[] = [...messages];//function需要name 其他role不需要 暂时不管

    if (content.imgurl) {
      content.imgurl.forEach((item: string) => {
        tempMessages.push({
          role: "user",
          content: [
            { type: "image_url", image_url: { url: item } }
          ]
        });
      });

      tempMessages.push({
        role: "user",
        content: [
          { type: "text", text: content.text ? content.text : '这是什么' }
        ]
      })
    };
    // } else {
    //   tempMessages = [
    //     ...messages,
    //     { role: "user", content: content.text ? content.text : '这是什么' }
    //   ];
    // }

    // 创建一个新的 AbortController 实例用来中断回复及中断请求
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const completion = await openai.chat.completions.create({
        model: "qwen-vl-max",
        messages: tempMessages,
        stream: true,
      }, {
        signal: controller.signal, // 将 signal 放入第二个参数对象中 用于监听取消信号 以用来打断请求
      });

      let responseText = '';
      //流式输出
      for await (const chunk of completion) {
        if (chunk.choices && chunk.choices.length > 0) {
          const deltaContent = chunk.choices[0].delta?.content || '';
          responseText += deltaContent;
          const temp: LLMDialogProps[] = [...llmDialogRef.current, { id: Date.now(), type: 'system', text: responseText }];
          dispatch(actions.setState({ llmDialog: temp }));
        }
      }

      dispatch(actions.setState({
        messages: [
          ...tempMessages,
          {
            role: "assistant",
            content: [
              { type: "text", text: responseText }
            ]
          }
        ]
      }))

      dispatch(actions.setState({
        llmDialog: [
          ...llmDialogRef.current,
          { id: Date.now(), type: 'system', text: responseText }
        ]
      }))
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('请求已中断');
      } else {
        console.error('获取响应时出错:', error);
        message.error('获取响应时出错，请重试');
      }
    } finally {
      abortControllerRef.current = null;//清空引用
    }
  };

  const handleSubmit = async () => {
    if (name === "新对话") dispatch(actions.setState({ name: inputText }));

    if (!inputText && !images) {
      message.warning('请输入你的问题');
      return;
    }
    dispatch(actions.setState({ display: 'none' }))
    dispatch(actions.setState({ images: [] }))
    dispatch(actions.setState({ isScrolling: false }))
    dispatch(actions.setState({ isGenerating: true }))
    dispatch(actions.setState({ lastInputText: inputText }))
    dispatch(actions.setState({ inputText: '' }))// 重置输入框

    try {
      await fetchAi({ text: inputText, imgurl: images });
    } catch (error) {
      console.error('获取响应时出错:', error);
      message.error('获取响应时出错，请重试');
    } finally {
      dispatch(actions.setState({ isGenerating: false }))
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // 阻止默认的换行行为
      handleSubmit(); // 手动触发 onPressEnter 事件
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      dispatch(actions.setState({ isGenerating: false }))
    }
    // 打断了也要保留记录 帮助ai回答
    dispatch(actions.setState({
      messages: [
        ...messages,
        { role: "assistant", content: lastInputText }
      ]
    }))
  };

  const regenerate = async () => {
    dispatch(actions.setState({ isScrolling: false }))
    dispatch(actions.setState({ isGenerating: true }))

    isRegenerateRef.current = true;

    try {
      await fetchAi({ text: lastInputText, imgurl: images });
    } catch (error) {
      console.error('获取响应时出错:', error);
      message.error('获取响应时出错，请重试');
    } finally {
      dispatch(actions.setState({ isGenerating: false }))

      isRegenerateRef.current = false;
    }
  };

  return (
    <Layout >
      <Content style={{ padding: 24, background: '#fff', height: '50vh' }}>
        <DialogBubble
          LlmDialogText={llmDialog}
          isScrolling={isScrolling}
          setIsScrolling={() => dispatch(actions.setState({ isScrolling: true }))}
          isGenerating={isGenerating}
          setIsGenerating={() => dispatch(actions.setState({ isGenerating: true }))}
          scrollY={scrollY}
          regenerate={regenerate}
        />
      </Content>
      <CombinedInputArea
        autoSize={{ minRows: 4, maxRows: 12 }} // 设置自动伸缩的最小和最大行数
        placeholder='输入问题或者粘贴图片提问'
        maxLength={1000000} // 设置合理的最大长度
        value={inputText}
        onChange={(e) => dispatch(actions.setState({ inputText: e.target.value }))}
        onKeyDown={handleKeyDown}
        style={{ width: 'auto', padding: '20px', borderRadius: '20px' }} // 设置最大高度
      />
      {!isGenerating ? (
        <ArrowUpOutlined
          style={{
            borderRadius: '25px',
            backgroundColor: !inputText ? 'rgb(208,208,208)' : 'rgb(0,102,245)',
            position: 'absolute',
            bottom: 30,
            right: 30,
            fontSize: 50,
            cursor: 'pointer',
            color: !inputText ? 'rgb(240,240,240)' : 'rgb(245,245,245)',
          }}
          onClick={handleSubmit}
        />
      ) : (
        <PauseCircleOutlined
          style={{
            borderRadius: '25px',
            backgroundColor: 'rgb(0,102,245)',
            position: 'absolute',
            bottom: 30,
            right: 30,
            fontSize: 50,
            cursor: 'pointer',
            color: !inputText ? 'rgb(240,240,240)' : 'rgb(245,245,245)',
          }}
          onClick={handleStop}
        />
      )}
    </Layout>
  );
};

export default LLMDialog;