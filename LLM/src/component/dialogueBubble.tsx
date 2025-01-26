import { useEffect, useRef } from 'react';
import { Button, Typography } from 'antd';
import { LLMDialogProps } from "./LLMDialog";

const { Paragraph } = Typography;
interface props {
  LlmDialogText: LLMDialogProps[],
  isScrolling: boolean ,
  setIsScrolling: React.Dispatch<React.SetStateAction<boolean>> ,
  isGenerating: boolean,
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  regenerate: () => void
  scrollY: React.MutableRefObject<number>
}

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
export default function DialogBubble( props: props ) {
  const liRef = useRef<HTMLLIElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { LlmDialogText, isScrolling, setIsScrolling, isGenerating, regenerate, scrollY }= props;

  useEffect(() => {
    if (liRef.current && !isScrolling) {
      liRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      // console.log('iss:', isScrolling);
    }
    // console.log('is:',isScrolling);
  }, [LlmDialogText, isScrolling]);
  
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    // event 是合成事件对象
    // 获取滚动的目标元素
    const target = event.target as HTMLDivElement;
    // 获取垂直滚动距离
    const scrollTop = target.scrollTop;
    // console.log('now:',scrollTop,'last:',scrollY.current)
    if(scrollY.current > scrollTop ) setIsScrolling(true),console.log('is:',true);
    scrollY.current = scrollTop;
    
    // 获取水平滚动距离
    // console.log(`垂直滚动距离: ${scrollTop}px`);
    // console.log('is:',isScrolling);
  };

  return ( 
    <div ref={scrollContainerRef} onScroll={handleScroll} style={{ height: '100%', width: '100%', padding: '0 100px', overflowY: 'auto' }}>
    <ul>
      {LlmDialogText.map((item, index) => {
        const positionStyle = item.type === 'user'
          ? { ...baseStyle, float: 'right' as React.CSSProperties['float'], clear: 'both' as React.CSSProperties['clear']}
          : { ...baseStyle, float: 'left' as React.CSSProperties['float'], clear: 'both' as React.CSSProperties['clear'], maxWidth: '100%' };

        return (
          <li key={item.id} style={positionStyle} ref={liRef}>
            <Paragraph copyable style={pStyle} >{item.text}</Paragraph>
            {item.type === 'system' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  {index === LlmDialogText.length - 1 && !isGenerating && (
                    <Button
                      type="default"
                      onClick={regenerate}
                      style={{ marginRight: '10px' }}
                    >
                      重新生成
                    </Button>
                  )}
                </div>
              )}
          </li>
        );
      })}
    </ul>
  </div>
  );
}
