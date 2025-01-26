import React, { useRef } from 'react';
import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';

const { TextArea } = Input;

interface CombinedInputAreaProps extends TextAreaProps {
  imageUrlRef: React.MutableRefObject<string | null>;
}

const CombinedInputArea: React.FC<CombinedInputAreaProps> = ({ onPaste, imageUrlRef, ...props }) => {
  const editableDivRef = useRef<HTMLDivElement | null>(null);

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    if (!clipboardData) return;

    const imageItem = Array.from(clipboardData.items).find(item => item.type.startsWith('image'));
    if (imageItem) {
      handleImagePaste(imageItem.getAsFile());
    } else {
      // 如果不是图片，则调用传入的 onPaste 处理文本粘贴 
      // onPaste(event);
    }
  };

  const handleImagePaste = (file: File | null) => {
    if (!file) return;  
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target?.result as string;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      imageUrlRef.current = img.src; // 修改这里
      if (editableDivRef.current) {
        editableDivRef.current.appendChild(img);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      ref={editableDivRef}
      contentEditable
      onPaste={handlePaste}
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        minHeight: '100px',
        overflowY: 'auto',
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box', // 确保 padding 和 border 包含在宽度内
      }}
    >
      <TextArea
        {...props}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          outline: 'none',
          resize: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: 'transparent',
          boxSizing: 'border-box', // 确保 padding 和 border 包含在宽度内
        }}
        // onPaste={handlePaste}
      />
    </div>
  );
};

export default CombinedInputArea;