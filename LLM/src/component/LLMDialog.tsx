
import React, { useEffect, useState, useRef } from 'react';
import { Layout, Menu, Input, Button, Typography, message, Space, Popover, Dropdown, MenuProps} from 'antd';
import { UserOutlined, SearchOutlined, ArrowUpOutlined, PauseCircleOutlined } from '@ant-design/icons';
import OpenAI from "openai";
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import DialogBubble from './dialogueBubble';

const { Header, Sider, Content } = Layout;
const { Title} = Typography;
const { TextArea } = Input;
interface MenuItem {
  key: string;
  label: string;
}

export interface LLMDialogProps {
  id: number;
  type: string;
  text: string;
}

const items: MenuItem[] = [
  { key: '1', label: 'AI 搜索' },
  { key: '2', label: '帮我写作' },
  { key: '3', label: '图像生成' },
  { key: '4', label: 'AI 阅读' },
  { key: '5', label: 'AI 编程' },
];

const openai = new OpenAI(
    {
        apiKey: 'sk-abc6845c88d44b2aafd6e189ac3933b6',
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        dangerouslyAllowBrowser: true //需要优化 避免危险
    }
);

const menuItems: MenuProps['items'] = items.map((item) => ({
  key: item.key,
  label: <a href="#">{item.label}</a>,
}));

const LLMDialog: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState< ChatCompletionMessageParam[]>([{ role: "system", content: "You are a helpful assistant." },]);
  const [llmDialog, setLlmDialog] = useState<LLMDialogProps[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isGenerat,setIsGenerat] = useState<boolean>(false);
  // const [isRegenerate,setIsRegenerate] = useState<boolean>(false);
  const [lastInputText,setLastInputText] = useState<string>('')
  const abortControllerRef = useRef<AbortController | null>(null);
  const llmDialogRef=useRef<LLMDialogProps[]>([]);
  const isRegenerateRef = useRef<boolean>(false);
  useEffect(() => {
    // 禁用整个页面的滚动
    document.body.style.overflow = 'hidden';
    return () => {
      // 恢复页面滚动
      document.body.style.overflow = '';
    };
  }, []);  
  async function fetchAi(content: string) {
    llmDialogRef.current=llmDialog
    // console.log('llm',llmDialogRef.current);    
    //设置问题
    if(!isRegenerateRef.current){
      // console.log('is',isRegenerate);
      llmDialogRef.current = [
        ...llmDialog, 
        { id: Date.now(),type: 'user', text: content },
      ]
      // console.log('llm2',llmDialogRef.current);    
    }
    
    let tempMessages: ChatCompletionMessageParam[] = [
      ...messages,
      { role: "user", content: content },
    ]; 
    // 创建一个新的 AbortController 实例
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try{
      const completion = await openai.chat.completions.create({
          model: "qwen-plus",
          messages: tempMessages,
          stream: true,
          // signal: controller.signal, // 将 signal 放入 create 方法的选项对象中
      }, {
        signal: controller.signal, // 将 signal 放入第二个参数对象中
      });

      let responseText = '';
      for await (const chunk of completion) {
        if (chunk.choices && chunk.choices.length > 0) {
            const deltaContent = chunk.choices[0].delta?.content || '';
            responseText += deltaContent;
            let temp:LLMDialogProps[] =[...llmDialogRef.current,{ id: Date.now(), type: 'system', text: responseText }];
            setLlmDialog(temp); 
        }
      }
      
      setMessages([
        ...messages,
        { role: "assistant", content: content }
      ])
      setLlmDialog([
        ...llmDialogRef.current,
        { id: Date.now(), type: 'system', text: responseText }
      ]);
      // console.log('llm', ...llmDialogRef.current);
      
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('请求已中断');
        } else {
          console.error('获取响应时出错:', error);
          message.error('获取响应时出错，请重试');
        }
      } finally {
        abortControllerRef.current = null;
      }
    } 
  const handleSubmit = async () => {
    setIsScrolling(false)
    setIsGenerat(true)
    setLastInputText(inputText)
    setInputText('') // 重置输入框
    if (!inputText) {
      message.warning('请输入你的问题');
      return;
    }

    try {
      await fetchAi(inputText);
    } catch (error) {
      console.error('获取响应时出错:', error);
      message.error('获取响应时出错，请重试');
    } finally{
      setIsGenerat(false)
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
      setIsGenerat(false);
    }
    //打断了也要保留记录 帮助ai回答
    setMessages([
      ...messages,
      { role: "assistant", content: lastInputText }
    ])
  };

  const regenerate = async() => {
    setIsScrolling(false)
    setIsGenerat(true)
    // setIsRegenerate(true)
    // console.log('???',isRegenerate)
    isRegenerateRef.current=true
    try {
      await fetchAi(lastInputText);
    } catch (error) {
      console.error('获取响应时出错:', error);
      message.error('获取响应时出错，请重试');
    } finally{
      setIsGenerat(false)
      isRegenerateRef.current=false
    }
  };

  return (
    <Layout style={{ minHeight: '99vh'}}>
      <Sider width={200} style={{ background: '#fff', height:'10vh'}}>
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
           setIsScrolling={setIsScrolling}
           isGenerating={isGenerat}
           setIsGenerating={setIsGenerat}
           handleStop={handleStop}
           regenerate={regenerate}
          />
        </Content>
          <TextArea 
            autoSize={{ minRows: 4, maxRows: 12 }} // 设置自动伸缩的最小和最大行数
            // placeholder='输入问题或者粘贴图片提问'
            maxLength={1000000} // 设置合理的最大长度
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            // onPressEnter={handleSubmit}
            onKeyDown={handleKeyDown}
            style={{ width:'auto',padding:'20px', borderRadius: '20px',}} // 设置最大高度
          /> 
          { !isGenerat ? (<ArrowUpOutlined 
            style={{
              borderRadius: '25px',
              backgroundColor: !inputText ? 'rgb(208,208,208)': 'rgb(0,102,245)',
              position: 'absolute',
              bottom: 30,
              right: 30,
              fontSize:50,
              cursor: 'pointer',
              color: !inputText ? 'rgb(240,240,240)' : 'rgb(245,245,245)',
            }}
            onClick={handleSubmit}
            />) : (<PauseCircleOutlined
            style={{
              borderRadius: '25px',
              backgroundColor: 'rgb(0,102,245)',
              position: 'absolute',
              bottom: 30,
              right: 30,
              fontSize:50,
              cursor: 'pointer',
              color: !inputText ? 'rgb(240,240,240)' : 'rgb(245,245,245)',
            }}
            onClick={handleStop}
            />) }
      </Layout>
    </Layout>
  );
}
  
export default LLMDialog;


//增加停止和重新生成按钮