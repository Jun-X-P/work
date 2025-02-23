import React, { useRef } from 'react';
import { Layout, Menu, Input, Button, Typography, message, Space, Popover, Dropdown, MenuProps } from 'antd';
import { UserOutlined, SearchOutlined, ArrowUpOutlined, PauseCircleOutlined } from '@ant-design/icons';
import OpenAI from "openai";
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import DialogBubble from './dialogueBubble';
import CombinedInputArea from './paste';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
// const { TextArea } = Input;
interface MenuItem {
  key: string;
  label: string;
}

export interface LLMDialogProps {
  id: number;
  type: string;
  text: string;
}

interface Input {
  imgurl: string[];
  text: string;
}

const items: MenuItem[] = [
  { key: '1', label: 'AI 搜索' },
  { key: '2', label: '帮我写作' },
  { key: '3', label: '图像生成' },
  { key: '4', label: 'AI 阅读' },
  { key: '5', label: 'AI 编程' },
];

const menuItems: MenuProps['items'] = items.map((item) => ({
  key: item.key,
  label: <a href="#">{item.label}</a>,
}));

const openai = new OpenAI({
  apiKey: 'sk-abc6845c88d44b2aafd6e189ac3933b6',
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  dangerouslyAllowBrowser: true //需要优化 避免危险
});

const LLMDialog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const inputText = useSelector((state: RootState) => state.inputText);
  const lastInputText = useSelector((state: RootState) => state.lastInputText);
  const messages = useSelector((state: RootState) => state.messages);
  const llmDialog = useSelector((state: RootState) => state.llmDialog);
  const isScrolling = useSelector((state: RootState) => state.isScrolling);
  const isGenerat = useSelector((state: RootState) => state.isGenerat);
  const images = useSelector((state: RootState) => state.images);

  const abortControllerRef = useRef<AbortController | null>(null);
  const llmDialogRef = useRef<LLMDialogProps[]>([]);
  const isRegenerateRef = useRef<boolean>(false);
  // const imageUrlRef = useRef<string[]>([]);
  const scrollY = useRef(0);
  
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

    dispatch({ type: 'SET_LLM_DIALOG', payload: llmDialogRef.current });

    let tempMessages: ChatCompletionMessageParam[] = [...messages];
    
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
      });
    } else {
      tempMessages = [
        ...messages,
        { role: "user", content: content.text ? content.text : '这是什么' }
      ];
    }

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
          dispatch({ type: 'SET_LLM_DIALOG', payload: temp });
        }
      }
      
      dispatch({
        type: 'SET_MESSAGES',
        payload: [
          ...tempMessages,
          {
            role: "assistant",
            content: [
              { type: "text", text: responseText }
            ]
          }
        ]
      });

      dispatch({
        type: 'SET_LLM_DIALOG',
        payload: [
          ...llmDialogRef.current,
          { id: Date.now(), type: 'system', text: responseText }
        ]
      });
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
    if (!inputText && !images) {
      message.warning('请输入你的问题');
      return;
    }
    dispatch({ type: 'SET_DISPLAY', payload: 'none' })
    dispatch({ type: 'SET_IMAGES', payload: []})
    dispatch({ type: 'SET_IS_SCROLLING', payload: false });
    dispatch({ type: 'SET_IS_GENERAT', payload: true });
    dispatch({ type: 'SET_LAST_INPUT_TEXT', payload: inputText });
    dispatch({ type: 'SET_INPUT_TEXT', payload: '' }); // 重置输入框

    try {
      await fetchAi({ text: inputText, imgurl: images });
    } catch (error) {
      console.error('获取响应时出错:', error);
      message.error('获取响应时出错，请重试');
    } finally {
      // imageUrlRef.current = [];
      dispatch({ type: 'SET_IS_GENERAT', payload: false });
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
      dispatch({ type: 'SET_IS_GENERAT', payload: false });
    }
    // 打断了也要保留记录 帮助ai回答
    dispatch({
      type: 'SET_MESSAGES',
      payload: [
        ...messages,
        { role: "assistant", content: lastInputText }
      ]
    });
  };

  const regenerate = async () => {
    dispatch({ type: 'SET_IS_SCROLLING', payload: false });
    dispatch({ type: 'SET_IS_GENERAT', payload: true });
    isRegenerateRef.current = true;

    try {
      await fetchAi({ text: lastInputText, imgurl: images });
    } catch (error) {
      console.error('获取响应时出错:', error);
      message.error('获取响应时出错，请重试');
    } finally {
      dispatch({ type: 'SET_IS_GENERAT', payload: false });
      isRegenerateRef.current = false;
    }
  };

  return (
    <Layout style={{ minHeight: '99vh' }}>
      <Sider width={200} style={{ background: '#fff', height: '10vh' }}>
        <Menu mode="inline" defaultSelectedKeys={['1']} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 50px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ fontSize: 24 }} />
            <Title level={5} >豆包</Title>
            <Space>
              <Button icon={<SearchOutlined />} />
              <Popover content="最近对话" title="最近对话">
                <Button>最近对话</Button>
              </Popover>
              <Dropdown menu={{ items }}>
                <Button>更多</Button>
              </Dropdown>
            </Space>
          </div>  
        </Header>
        <Content style={{ padding: 24, background: '#fff', height: '50vh' }}>
          <DialogBubble
            LlmDialogText={llmDialog}
            isScrolling={isScrolling}
            setIsScrolling={() => dispatch({ type: 'SET_IS_SCROLLING', payload: true })}
            isGenerating={isGenerat}
            setIsGenerating={() => dispatch({ type: 'SET_IS_GENERAT', payload: true })}
            scrollY={scrollY}
            regenerate={regenerate}
          />
        </Content>
          <CombinedInputArea
            autoSize={{ minRows: 4, maxRows: 12 }} // 设置自动伸缩的最小和最大行数
            placeholder='输入问题或者粘贴图片提问'
            maxLength={1000000} // 设置合理的最大长度
            value={inputText}
            onChange={(e) => dispatch({ type: 'SET_INPUT_TEXT', payload: e.target.value })}
            onKeyDown={handleKeyDown}
            style={{ width: 'auto', padding: '20px', borderRadius: '20px' }} // 设置最大高度
            // imageUrlRef={imageUrlRef}
          />
          {!isGenerat ? (
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
    </Layout>
  );
};

export default LLMDialog;