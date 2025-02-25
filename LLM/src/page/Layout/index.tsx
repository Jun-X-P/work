import React from 'react';
import { Button, Layout, Menu, MenuProps } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { ItemType } from 'antd/es/menu/interface';
import { PlusOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { ChatState } from '@/store/modules/chat';
import { useDispatch } from 'react-redux';
import store from '@/store';
const { Sider } = Layout;

let items: ItemType[] = []

const SelfLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const actions = store.actions.chat;
  // const chatStates = useSelector((state: RootState) => state.chat.chatStates);
  const handleAdd = () => {
    const newChatState: ChatState = {
      id: uuidv4(),
      name: "新对话",
      inputText: "",
      lastInputText: "",
      messages: [
        { role: "system", name: "system", content: "You are a helpful assistant." },
      ],
      llmDialog: [],
      isScrolling: false,
      isGenerating: false,
      images: [],
      display: "none",
      previewImage: "null",
      isModalVisible: false,
    };
    dispatch(actions.addChatState(newChatState));
    // dispatch(actions.setState(newChatState));//设置为新的空对话
    navigate(`/recent/${newChatState.id}`);//跳转到新的空对话
  };
  const onClick: MenuProps['onClick'] = (e) => {
    navigate(`/recent/${e.key}`);
  };
  const storedChatStates = localStorage.getItem("chatStates");
  const chatStates = storedChatStates
    ? JSON.parse(storedChatStates)
    : [];
  // console.log("历史对话", chatStates);
  // localStorage.setItem('chatStates', JSON.stringify([]));
  items = [
    ...chatStates
      .slice(0, 25) // 创建副本避免修改原数组
      .reverse() // 倒序排列
      .map((chatState: ChatState) => ({
        key: chatState.id,
        label: chatState.name,
      })),
  ];

  return (
    <div className='Layout'>
      <Layout style={{ minHeight: '99vh' }}>
        <Sider width={200} style={{ background: 'rgb(247,247,247)', height: '100vh' }}>
          <Button color="default" variant="outlined" style={{ width: '100%', marginBottom: '4px' }}
            onClick={handleAdd}
          >
            <PlusOutlined /> 新对话
          </Button>
          <Menu
            mode="inline"
            defaultSelectedKeys={['current']}
            items={items}
            onClick={onClick}
          />
        </Sider>
        <Outlet />
      </Layout>
    </div>
  );
};

export default SelfLayout;