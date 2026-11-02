import { Button, Form, Input, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="login-wrap">
      <div className="login-card">
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          进销存 ERP 学习版
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          默认账号：admin / admin123
        </Typography.Paragraph>
        <Form
          layout="vertical"
          initialValues={{ username: 'admin', password: 'admin123' }}
          onFinish={async (values) => {
            try {
              await login(values.username, values.password);
              message.success('登录成功');
              navigate('/dashboard');
            } catch {
              /* 错误已由拦截器提示 */
            }
          }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="admin" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="admin123" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
      </div>
    </div>
  );
}
