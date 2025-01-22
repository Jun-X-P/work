// src/components/LLMDialog.tsx
import React, { useState } from 'react';
import { Input, Button, Typography, Spin, message } from 'antd';
import 'antd/dist/reset.css';
import OpenAI from "openai";
// import { log } from 'console';

const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: 'sk-abc6845c88d44b2aafd6e189ac3933b6',
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        dangerouslyAllowBrowser:true
    }
);

async function fetchAi(content: string) {
    const completion = await openai.chat.completions.create({
        model: "qwen-plus",
        messages: [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": `你是谁`}
        ],
        stream: false,
    });
    console.log(completion);
    
    return completion
    // for await (const chunk of completion) {
    //     console.log(JSON.stringify(chunk));
    // }
}

const { Title, Paragraph } = Typography;

interface LLMDialogProps {
  title: string;
}

const LLMDialog: React.FC<LLMDialogProps> = ({ title }) => {
  const [inputText, setInputText] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!inputText) {
      message.warning('请输入你的问题');
      return;
    }
    setLoading(true);
    try {
      const apiResponse = await fetchAi(inputText);
      // setResponse(apiResponse);
    } catch (error) {
      console.error('获取响应时出错:', error);
      message.error('获取响应时出错，请重试');
    } finally {
      setLoading(false);
    }
  };

  // const fetchCOZEAPI = async (text: string): Promise<string> => {
  //   const apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1'; // 替换为实际的 API URL
  //   const apiKey = 'sk-abc6845c88d44b2aafd6e189ac3933b6'; // 确保正确引用环境变量
     
  //   if (!apiKey) {
  //     throw new Error('API 密钥未设置');
  //   }

  //   try {
  //     const response = await fetch(apiUrl, {
  //       method: 'GET',
  //       // headers: {
  //       //   'Content-Type': 'application/json',
  //       //   // 'Authorization': `Bearer ${apiKey}`,
  //       // },
  //       // body: JSON.stringify({
  //       //   model: "qwen-plus", // 确保包含模型名称
  //       //   messages: [
  //       //     { role: "system", content: "You are a helpful assistant." },
  //       //     { role: "user", content: text }
  //       //   ],
  //       //   stream: false // 如果需要流式输出，设置为 true
  //       // }),
  //     });
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(`HTTP 错误！状态码: ${response.status}, 消息: ${errorData.message || '未知错误'}`);
  //     } 
  //     const data = await response.json();
  //     console.log('API 响应:', data); // 添加日志检查响应内容
  //     return data.choices[0].message.content; // 根据实际 API 响应结构调整
  //   } catch (error) {
  //     console.error('API 请求失败:', error);
  //     throw error; // 重新抛出错误以便在调用处处理
  //   }
  // };
  
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>{title}</Title>
      <Input
        placeholder="输入你的问题"
        value={inputText}
        onChange={(e)=> setInputText(e.target.value)}
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