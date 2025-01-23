
import React, { useEffect, useState } from 'react';
import { Layout, Menu, Input, Button, Typography, message, Flex, Space, Popover, Dropdown, MenuProps, DescriptionsProps } from 'antd';
import { ArrowRightOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import OpenAI from "openai";
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
const { Header, Sider, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;
interface MenuItem {
  key: string;
  label: string;
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
        dangerouslyAllowBrowser: true
    }
);

const menuItems: MenuProps['items'] = items.map((item) => ({
  key: item.key,
  label: <a href="#">{item.label}</a>,
}));

const LLMDialog: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [items, setItems] = useState<DescriptionsProps['items']>([]);
  const [messages, setMessages] = useState< ChatCompletionMessageParam[]>([{ role: "system", content: "You are a helpful assistant." },]);
  
  useEffect(() => {
    // 禁用整个页面的滚动
    document.body.style.overflow = 'hidden';
    return () => {
      // 恢复页面滚动
      document.body.style.overflow = '';
    };
  }, []);
  async function fetchAi(content: string) {
      const newItems = [...items, { // 使用已确保为数组的 items
        label: 'USER',
        span: 'filled',
        children: content,
      }];
      setItems(newItems);
      // const newMessages=[...messages,]
      messages.push({ role: "user", content: content });
      const completion = await openai.chat.completions.create({
          model: "qwen-plus",
          messages: messages,
          stream: true,
      });
      let responseText = '';
      for await (const chunk of completion) {
        if (chunk.choices && chunk.choices.length > 0) {
            const deltaContent = chunk.choices[0].delta?.content || '';
            responseText += deltaContent;
            console.log(deltaContent);
        }
      }
      messages.pop()
      messages.push({ role: "assistant", content: responseText });
      console.log('Final Response:', responseText);
      const updatedItems = [...newItems, {
        label: 'LLM',
        span: 'filled',
        children: responseText,
      }];
      setItems(updatedItems);
    } 
    const handleSubmit = async () => {
      if (!inputText) {
        message.warning('请输入你的问题');
        return;
      }
      setInputText('') // 重置输入框
      // setLoading(true);
      try {
        await fetchAi(inputText);
      } catch (error) {
        console.error('获取响应时出错:', error);
        message.error('获取响应时出错，请重试');
      } 
    };
  return (
    <Layout style={{ minHeight: '100vh'}}>
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
              <Dropdown overlay={<Menu items={menuItems} />}>
                <Button>更多</Button>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content style={{ padding: 24, background: '#fff', height: '50vh' }}>
          <div style={{ height: '100%', width: '100%', overflowY: 'auto' }}>
            
          </div>
        </Content>
            <TextArea 
              autoSize={{ minRows: 3, maxRows: 12 }} // 设置自动伸缩的最小和最大行数
              placeholder='输入问题或者粘贴图片提问'
              maxLength={1000000} // 设置合理的最大长度
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPressEnter={handleSubmit}
              style={{ width: '100%', maxHeight: '20vh',padding:'20px'}} // 设置最大高度
            />
            <ArrowRightOutlined 
              style={{
                position: 'absolute',
                bottom: 10,
                right: 70,
                fontSize: 40,
                cursor: 'pointer',
                color: !inputText ? 'rgb(126,126,126)' : 'rgb(106,106,106)',
              }}
              onClick={handleSubmit}
            />
      </Layout>
    </Layout>
  );
};

export default LLMDialog;