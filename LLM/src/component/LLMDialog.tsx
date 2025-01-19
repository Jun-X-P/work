// src/components/LLMDialog.tsx
import React, { useState } from 'react';
import { Input, Button, Typography, Spin, message } from 'antd';
import 'antd/dist/reset.css';

const { Title, Paragraph } = Typography;

interface LLMDialogProps {
  title: string;
}

const LLMDialog: React.FC<LLMDialogProps> = ({ title }) => {
  const [inputText, setInputText] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };
     
  const handleSubmit = async () => {
    if (!inputText) {
      message.warning('请输入你的问题');
      return;
    }
    setLoading(true);
    try {
      // 模拟通过 COZE API 获取响应
      // const mockResponse = await fetchMockResponse(inputText);
      // setResponse(mockResponse);
      const apiResponse = await fetchCOZEAPI(inputText);
      setResponse(apiResponse);
    } catch (error) {
      console.error('获取响应时出错:', error);
      message.error('获取响应时出错，请重试');
    } finally {
      setLoading(false);
    }
  };

  // const fetchMockResponse = async (text: string): Promise<string> => {
  //   // 这里模拟一个 API 调用
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve(`COZE API 响应: ${text}`);
  //     }, 2000);
  //   });
  // };

  const fetchCOZEAPI = async (text: string): Promise<string> => {
    const apiUrl = 'https://api.coze.com/v1/llm'; // 替换为实际的 API URL
    const apiKey = 'YOUR_API_KEY'; // 替换为你的 API 密钥
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ prompt: text }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP 错误！状态码: ${response.status}, 消息: ${errorData.message || '未知错误'}`);
      }
  
      const data = await response.json();
      return data.response; // 根据实际 API 响应结构调整
    } catch (error) {
      console.error('API 请求失败:', error);
      throw error; // 重新抛出错误以便在调用处处理
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>{title}</Title>
      <Input
        placeholder="输入你的问题"
        value={inputText}
        onChange={handleInputChange}
        style={{ marginBottom: '10px' }}
      />
      <Button type="primary" onClick={handleSubmit} loading={loading}>
        提交
      </Button>
      {loading && <Spin style={{ marginTop: '20px' }} />}
      {!loading && response && (
        <div style={{ marginTop: '20px' }}>
          <Title level={4}>响应</Title>
          <Paragraph>{response}</Paragraph>
        </div>
      )}
    </div>
  );
};

export default LLMDialog;