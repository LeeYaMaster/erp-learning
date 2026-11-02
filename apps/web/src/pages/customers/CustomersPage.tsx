import { Button, Form, Input, Modal, Space, Switch, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', { params: { keyword } });
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await api.put(`/customers/${editing.id}`, values);
      message.success('已更新');
    } else {
      await api.post('/customers', values);
      message.success('已创建');
    }
    setOpen(false);
    load();
  };

  return (
    <div className="page-card">
      <Space style={{ marginBottom: 12 }}>
        <Input.Search
          placeholder="编码 / 名称"
          allowClear
          onSearch={() => load()}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 240 }}
        />
        <Button onClick={load}>查询</Button>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            form.setFieldsValue({ enabled: true });
            setOpen(true);
          }}
        >
          新建客户
        </Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: '编码', dataIndex: 'code' },
          { title: '名称', dataIndex: 'name' },
          { title: '联系人', dataIndex: 'contact' },
          { title: '电话', dataIndex: 'phone' },
          { title: '地址', dataIndex: 'address' },
          {
            title: '操作',
            width: 160,
            render: (_, row) => (
              <Space>
                <Button
                  size="small"
                  onClick={() => {
                    setEditing(row);
                    form.setFieldsValue(row);
                    setOpen(true);
                  }}
                >
                  编辑
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={async () => {
                    await api.delete(`/customers/${row.id}`);
                    message.success('已删除');
                    load();
                  }}
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={editing ? '编辑客户' : '新建客户'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="编码" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contact" label="联系人">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
