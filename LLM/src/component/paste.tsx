import React from 'react';
import { Input, Modal } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import { useDispatch, useSelector } from 'react-redux';
import store from '@/store';
const { TextArea } = Input;

// interface CombinedInputAreaProps extends TextAreaProps {
//   imageUrlRef: React.MutableRefObject<string[]>;
// }

const CombinedInputArea: React.FC<TextAreaProps> = ({ onPaste, ...props }) => {
  const actions = store.actions.chat;
  const dispatch = useDispatch();
  const images:string[] = useSelector((state: any) => state.chat.images)
  const display = useSelector((state: any) => state.chat.display)
  const previewImage = useSelector((state: any) => state.chat.previewImage)
  const isModalVisible = useSelector((state: any) => state.chat.isModalVisible)

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
              dispatch(actions.setState({ display: 'flex' }));
              dispatch(actions.setState({ images: [...images, result as string] }))
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleImageClick = (image: string) => {
    dispatch(actions.setState({ previewImage: image }))
    dispatch(actions.setState({ isModalVisible: true }))
  };

  const handleModalCancel = () => {
    dispatch(actions.setState({ isModalVisible: false }))
  };

  const handleImageDelete = (index : number) => {
    const temp = images.filter((_: any, i: number) => i !== index)
    if(temp.length === 0) dispatch(actions.setState({ display: 'none' }));
    dispatch(actions.setState({ images: temp }))
  };

  return (
    <div>
      <div 
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
        resize: 'none',//禁用文本区域大小手动调整
        borderRadius:'40px',
        padding: '10px',
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