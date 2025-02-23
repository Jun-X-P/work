import React from 'react';
import { Layout, Menu, MenuProps } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { ItemType } from 'antd/es/menu/interface';
const { Sider } = Layout;

const items: ItemType[] = [
  { key: 'current', label: '新对话' },
  { key: 'recent', label: '历史对话' },
];

const selfLayout: React.FC = () => {
  const navigate = useNavigate();
  const onClick: MenuProps['onClick'] = (e) => {
    if(e.key !== 'current') navigate(`/${e.key}`);
    else navigate('/');
  };

  return (
    <div className='Layout'>
      <Layout style={{ minHeight: '99vh' }}>
        <Sider width={200} style={{ background: 'rgb(247,247,247)', height: '100vh' }}>
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

export default selfLayout;