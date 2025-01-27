import React, { useState } from 'react';
import { Input, Modal } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
const { TextArea } = Input;

interface CombinedInputAreaProps extends TextAreaProps {
  imageUrlRef: React.MutableRefObject<string[]>;
}

const CombinedInputArea: React.FC<CombinedInputAreaProps> = ({ onPaste, imageUrlRef, ...props }) => {
  // const editableDivRef = useRef<HTMLDivElement | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [display, setDisplay] = useState<string>('none');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result;
            if (result) {
              setDisplay('flex')
              setImages((prevImages) => [...prevImages, result as string]);
              imageUrlRef.current=[...imageUrlRef.current,result as string]
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleImageClick = (image: string) => {
    setPreviewImage(image);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleImageDelete = (index : number) => {
    const temp = images.filter((_, i) => i !== index)
    if(temp.length === 0) setDisplay('none'),console.log(temp);
    // console.log(temp);
    setImages(temp)
  };

  return (
    <div>
      <div 
      //  contentEditable
       style={{
        width: '100%',
        height: '50px',
        display: `${display}`
       }}
      >
        {images.map((image, index) => (
         <div
         key={index}
         style={{
           position: 'relative',
           float: 'left',
           margin: '0px 10px 0px 10px',
         }}
       >
         <img
           src={image}
           alt={`Image ${index}`}
           style={{ width: '50px', height: '50px', cursor: 'pointer' }}
           onClick={() => handleImageClick(image)}
         />
         <button
           onClick={() => handleImageDelete(index)}
           style={{
             position: 'absolute',
             top: '-5px',
             right: '-5px',
             backgroundColor: 'red',
             color: 'white',
             border: 'none',
             borderRadius: '50%',
             width: '15px',
             height: '15px',
             fontSize: '15px',
             cursor: 'pointer',
             textAlign: 'center',
           }}
         >
           ×
         </button>
       </div>
        ))}
    </div>
    <TextArea
      {...props}
      style={{
        width: '100%',
        height: '100%',
        border: '2px solid rgb(41, 4, 4)',
        // outline: 'none',
        resize: 'none',
        borderRadius:'40px',
        padding: '10px',
        // position: 'relative',
        // backgroundColor: 'transparent',
        // boxSizing: 'border-box', // 确保 padding 和 border 包含在宽度内
      }}
      onPaste={handlePaste}
    />
      <Modal
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={800}
      >
        {previewImage && <img src={previewImage} alt="Preview" style={{ width: '100%', height: 'auto' }} />}
      </Modal>
    </div>
  );
};

export default CombinedInputArea;