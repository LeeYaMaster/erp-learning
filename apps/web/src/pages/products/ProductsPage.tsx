import { Button, Form, Input, InputNumber, Modal, Space, Switch, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function ProductsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { keyword } });
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ unit: '件', purchasePrice: 0, salePrice: 0, safetyStock: 0, enabled: true });
    setOpen(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    form.setFieldsValue(row);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await api.put(`/products/${editing.id}`, values);
      message.success('已更新');
    } else {
      await api.post('/products', values);
      message.success('已创建');
    }
    setOpen(false);
    load();
  };

  return (
    <div className="page-card">
      <Space style={{ marginBottom: 12 }}>
        <Input.Search
          placeholder="SKU / 名称"
          allowClear
          onSearch={(v) => {
            setKeyword(v);
            setTimeout(load, 0);
          }}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 240 }}
        />
        <Button
          onClick={() => {
            load();
          }}
        >
          查询
        </Button>
        <Button type="primary" onClick={openCreate}>
          新建商品
        </Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: 'SKU', dataIndex: 'sku' },
          { title: '名称', dataIndex: 'name' },
          { title: '单位', dataIndex: 'unit', width: 80 },
          { title: '采购价', dataIndex: 'purchasePrice', width: 100 },
          { title: '销售价', dataIndex: 'salePrice', width: 100 },
          { title: '安全库存', dataIndex: 'safetyStock', width: 100 },
          {
            title: '启用',
            dataIndex: 'enabled',
            width: 80,
            render: (v) => (v ? '是' : '否'),
          },
          {
            title: '操作',
            width: 160,
            render: (_, row) => (
              <Space>
                <Button size="small" onClick={() => openEdit(row)}>
                  编辑
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={async () => {
                    await api.delete(`/products/${row.id}`);
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
        title={editing ? '编辑商品' : '新建商品'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input />
          </Form.Item>
          <Form.Item name="purchasePrice" label="采购价">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="salePrice" label="销售价">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="safetyStock" label="安全库存">
            <InputNumber style={{ width: '100%' }} min={0} />
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
