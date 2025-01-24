import { useEffect, useRef, useState } from 'react';
import { Typography } from 'antd';
import { LLMDialogProps } from "./LLMDialog";
import { set } from 'date-fns';
const { Paragraph } = Typography;
export default function DialogBubble({ LlmDialogText,isScrolling, setIsScrolling}: { LlmDialogText: LLMDialogProps[], isScrolling: boolean , setIsScrolling: React.Dispatch<React.SetStateAction<boolean>> }) {
  const paragraphRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollY =useRef(0);
  const baseStyle = {
    listStyleType: 'none',
    backgroundColor: 'rgb(245,245,245)',
    minWidth: 0,
    maxWidth: '40%',
    borderRadius: '15px',
    fontSize: '26px',
    lineHeight: '26px',
    padding: '0px 10px 0px 10px',
    marginTop: '20px',
  };

  const pStyle = {
    whiteSpace: 'pre-wrap',
    textAlign: 'left' as React.CSSProperties['textAlign'],
    margin: '10px',
    fontSize: '18px',
    lineHeight: '30px',
    // userSelect: 'text'as React.CSSProperties['userSelect'] // 允许用户选择文本
  };

  useEffect(() => {
    if (paragraphRef.current && !isScrolling) {
      paragraphRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [LlmDialogText]);
  
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    // event 是合成事件对象
    // 获取滚动的目标元素
    const target = event.target as HTMLDivElement;
    // 获取垂直滚动距离
    const scrollTop = target.scrollTop;
    if(scrollY.current > scrollTop + 5) setIsScrolling(true);
    scrollY.current = scrollTop;
    // 获取水平滚动距离
    console.log(`垂直滚动距离: ${scrollTop}px`);
    console.log('is:',isScrolling);
};

  return ( 
    <div ref={scrollContainerRef} onScroll={handleScroll} style={{ height: '100%', width: '100%', padding: '0 100px', overflowY: 'auto' }}>
    <ul>
      {LlmDialogText.map((item, index) => {
        const positionStyle = item.type === 'user'
          ? { ...baseStyle, float: 'right' as React.CSSProperties['float'], clear: 'both' as React.CSSProperties['clear']}
          : { ...baseStyle, float: 'left' as React.CSSProperties['float'], clear: 'both' as React.CSSProperties['clear'], maxWidth: '100%' };

        return (
          <li key={index} style={positionStyle}>
            <Paragraph copyable style={pStyle} ref={paragraphRef}>{item.text}</Paragraph>
          </li>
        );
      })}
    </ul>
  </div>
  );
}
