// src/components/LLMDialog.tsx
import React, { useState } from 'react';
import { Input, Button, Typography, Spin, message } from 'antd';
import OpenAI from "openai";

const openai = new OpenAI(
    {
        apiKey: 'sk-abc6845c88d44b2aafd6e189ac3933b6',
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        dangerouslyAllowBrowser: true
    }
);

const { Title, Paragraph } = Typography;

interface LLMDialogProps {
  title: string;
}

const LLMDialog: React.FC<LLMDialogProps> = ({ title }) => {
  const [inputText, setInputText] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);


  async function fetchAi(content: string) {
    const completion = await openai.chat.completions.create({
        model: "qwen-plus",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: content }
        ],
        stream: true,
    });

    let responseText = '';
    for await (const chunk of completion) {
        if (chunk.choices && chunk.choices.length > 0) {
            const deltaContent = chunk.choices[0].delta?.content || '';
            responseText += deltaContent;
            setResponse(responseText); // 更新状态以显示最新的内容
            console.log(deltaContent);
        }
    }
    
    // console.log(responseText);
    console.log('Final Response:', responseText);
  }
  const handleSubmit = async () => {
    if (!inputText) {
      message.warning('请输入你的问题');
      return;
    }
    // setLoading(true);
    try {
      await fetchAi(inputText);
    } catch (error) {
      console.error('获取响应时出错:', error);
      message.error('获取响应时出错，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>{title}</Title>
      <Input
        placeholder="输入你的问题"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      {/* <Button type="primary" onClick={handleSubmit} loading={loading}>
        提交
      </Button> */}
      <Button type="primary" onClick={handleSubmit} >
        提交
      </Button>
      {/* {loading && <Spin style={{ marginTop: '20px' }} />} */}
      {response && ( 
        <div style={{ marginTop: '20px' }}>
          <Title level={4}>响应</Title>
          <Paragraph>{response}</Paragraph>
        </div>
      )}
    </div>
  );
};

export default LLMDialog;