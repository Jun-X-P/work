import React from 'react';
import { Button, Layout, Menu, MenuProps } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { ItemType } from 'antd/es/menu/interface';
import { PlusOutlined } from '@ant-design/icons';
const { Sider } = Layout;

const items: ItemType[] = [
  { key: 'current', label: '新对话' },
  { key: 'recent', label: '历史对话' },
];

const handleAdd = () => {
  console.log('Add');
};

const SelfLayout: React.FC = () => {
  const navigate = useNavigate();
  const onClick: MenuProps['onClick'] = (e) => {
    if (e.key !== 'current') navigate(`/${e.key}`);
    else navigate('/');
  };

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