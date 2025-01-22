// src/components/LLMDialog.tsx
import React, { useState } from 'react';
import { Input, Button, Typography, message, Image, Flex, Layout, Card} from 'antd';
import OpenAI from "openai";
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { Descriptions } from 'antd';
import type { DescriptionsProps } from 'antd';
// import { PdfDocument, PdfPage } from 'react-pdf';
// import { Document as PdfDocument, Page as PdfPage } from 'react-pdf';
// import { UploadOutlined } from '@ant-design/icons';
// import { set } from 'date-fns';

const items: DescriptionsProps['items'] = [
  // {
  //   label: 'USER',
  //   span: 'filled', // span = 3
  //   children: 'empty',
  // },
  // {
  //   label: 'LLM',
  //   span: 'filled', // span will be 3 and warning for span is not align to the end
  //   children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China',
  // },
];

const openai = new OpenAI(
    {
        apiKey: 'sk-abc6845c88d44b2aafd6e189ac3933b6',
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        dangerouslyAllowBrowser: true
    }
);

// const { Title, Paragraph } = Typography;

interface LLMDialogProps {
  title: string;
}

let messages: ChatCompletionMessageParam[] = [
  { role: "system", content: "You are a helpful assistant." },
  // { role: "user", content: '' }
]

let storedResponseText=''


const LLMDialog: React.FC<LLMDialogProps> = ({ title }) => {
  const [inputText, setInputText] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  // const [id,setID] = useState<number>()
  const [items, setItems] = useState<DescriptionsProps['items']>([]);
  const [storedResponse, setStoredResponse] = useState<string>('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);  
  async function fetchAi(content: string) {
    const newItems = [...items, { // 使用已确保为数组的 items
      label: 'USER',
      span: 'filled',
      children: content,
    }];
    setItems(newItems);
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
    console.log('storedResponseText',storedResponseText);
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
      setInputText('') // 重置输入框
    } 
  };

    /**
   * 处理文件选择框变化事件的函数
   * @param info 包含所选文件信息的对象
   */
  const handleFileChange =(info: any) => {
    // 检查文件是否已成功上传
    if(info.file.status === 'done'){
      // 获取原始文件对象
      const file = info.file.originFileObj;
      // 创建FileReader对象用于读取文件
      const reader = new FileReader();
      // 定义文件读取完成后的回调函数
      reader.onloadend = () => {
        // 获取文件的Base64编码字符串
        const base64String = reader.result as string;
        // 根据文件类型处理文件内容
        if(file.type.startsWith('image/')) {
          // 如果是图片，设置图片源
          setImageSrc(base64String)
        } else if(file.type === 'application/pdf') {
          // 如果是PDF，设置PDF源
          setPdfSrc(base64String)
        }
      }
      // 读取文件并将其转换为Data URL格式
      reader.readAsDataURL(file);
    }
  }

  /**
   * 当文档加载成功时调用的回调函数
   * 该函数的主要作用是获取文档的总页数，并将其传递给setNumPages方法
   * 以更新组件的状态
   * 
   * @param {Object} args - 一个包含文档总页数的对象
   * @param {number} args.numPages - 文档的总页数
   */
  const onDocumentLoadSuccess = ({ numPages } : { numPages: number }) => {
    setNumPages(numPages);
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography>
        {/* <Title level={2}>{title}</Title> */}
        {/* <div>
          {storedResponseText && (
            <div style={{ marginTop: '20px' }}>
              <Title level={4}>历史响应</Title>
              <Paragraph copyable>{storedResponseText}</Paragraph>
            </div>
          )}   
          {response && (
            <div style={{ marginTop: '20px' }}>
              <Title level={4}>最新响应</Title>
              <Paragraph copyable>{response}</Paragraph>
            </div>
          )}
          {imageSrc && (
            <div style={{ marginTop: '20px' }}>
              <Title level={4}>图片</Title>
              <Image src={imageSrc} alt="上传的图片" />
            </div>
          )}
          {pdfSrc && (
            <div style={{ marginTop: '20px' }}>
              <Title level={4}>PDF</Title>
              <PdfDocument file={pdfSrc} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from(new Array(numPages), (el, index) => (
                  <PdfPage key={`page_${index + 1}`} pageNumber={index + 1} />
                ))}
              </PdfDocument>
            </div>
          )}
        </div> */}
        <Descriptions bordered title={title} items={items} />
      </Typography>
      <Flex gap="middle" style={{ position: 'fixed', bottom: '5vw', left: '5vw', right: '5vw', padding: '10px' }}>
        <Input
          placeholder="输入你的问题"
          value={inputText}
          onPressEnter={handleSubmit}
          onChange={(e) => setInputText(e.target.value)}
          style={{ width: 'calc(100% - 120px)' }}
        />
        <Button type="primary" onClick={handleSubmit} style={{ marginRight: '10px' }}>
          提交
        </Button>
      </Flex>
  </div>
    );
};

export default LLMDialog;