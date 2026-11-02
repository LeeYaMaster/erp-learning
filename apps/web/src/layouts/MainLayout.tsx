import {
  AppstoreOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, theme, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const { Header, Sider, Content } = Layout;

const items = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  {
    key: 'master',
    icon: <DatabaseOutlined />,
    label: '基础资料',
    children: [
      { key: '/products', label: '商品' },
      { key: '/customers', label: '客户' },
      { key: '/suppliers', label: '供应商' },
      { key: '/warehouses', label: '仓库' },
    ],
  },
  {
    key: 'purchase',
    icon: <ShoppingCartOutlined />,
    label: '采购',
    children: [
      { key: '/purchase/orders', label: '采购订单' },
      { key: '/purchase/receipts', label: '采购入库' },
    ],
  },
  {
    key: 'sales',
    icon: <ShopOutlined />,
    label: '销售',
    children: [
      { key: '/sales/orders', label: '销售订单' },
      { key: '/sales/shipments', label: '销售出库' },
    ],
  },
  {
    key: 'inventory',
    icon: <AppstoreOutlined />,
    label: '库存',
    children: [
      { key: '/inventory/balances', label: '库存余额' },
      { key: '/inventory/movements', label: '出入库流水' },
    ],
  },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { token: themeToken } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100%' }}>
      <Sider breakpoint="lg" collapsedWidth={64} theme="dark">
        <div
          style={{
            height: 56,
            margin: 12,
            color: '#fff',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <TeamOutlined />
          <span>进销存学习版</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['master', 'purchase', 'sales', 'inventory']}
          items={items}
          onClick={({ key }) => {
            if (key.startsWith('/')) navigate(key);
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: themeToken.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Typography.Text type="secondary">
            完整流程：基础资料 → 采购入库 → 库存 → 销售出库
          </Typography.Text>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => {
                    logout();
                    navigate('/login');
                  },
                },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              {user?.displayName || user?.username || '用户'}
            </a>
          </Dropdown>
        </Header>
        <Content style={{ margin: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
