import React from 'react';
import { Input, Modal } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState} from '../store';
const { TextArea } = Input;

// interface CombinedInputAreaProps extends TextAreaProps {
//   imageUrlRef: React.MutableRefObject<string[]>;
// }

const CombinedInputArea: React.FC<TextAreaProps> = ({ onPaste, ...props }) => {
  const dispatch = useDispatch<AppDispatch>();
  const images = useSelector((state: RootState) => state.images)
  const display = useSelector((state: RootState) => state.display)
  const previewImage = useSelector((state: RootState) => state.previewImage)
  const isModalVisible = useSelector((state: RootState) => state.isModalVisible)

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
              dispatch({ type: 'SET_DISPLAY', payload: 'flex' });
              dispatch({ type: 'SET_IMAGES', payload: [...images, result as string]})
              // setImages((prevImages) => [...prevImages, result as string]);
              // imageUrlRef.current=[...imageUrlRef.current,result as string]
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleImageClick = (image: string) => {
    dispatch({ type: 'SET_PREVIEW_IMAGE', payload: image });
    dispatch({ type: 'SET_IS_MODAL_VISIBLE', payload: true }); 
  };

  const handleModalCancel = () => {
    dispatch({ type: 'SET_IS_MODAL_VISIBLE', payload: false });
  };

  const handleImageDelete = (index : number) => {
    const temp = images.filter((_, i) => i !== index)
    if(temp.length === 0) dispatch({ type: 'SET_DISPLAY', payload: 'none' });
    // console.log(temp);
    dispatch({ type: 'SET_IMAGES', payload: temp})
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