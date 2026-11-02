import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const statusMap: Record<string, { color: string; text: string }> = {
  DRAFT: { color: 'default', text: '草稿' },
  CONFIRMED: { color: 'blue', text: '已确认' },
  CANCELLED: { color: 'red', text: '已取消' },
};

export default function PurchaseOrdersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/purchase/orders');
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([api.get('/suppliers'), api.get('/products')]).then(
      ([s, p]) => {
        setSuppliers(s.data);
        setProducts(p.data);
      },
    );
    load();
  }, []);

  const submit = async () => {
    const values = await form.validateFields();
    await api.post('/purchase/orders', values);
    message.success('采购订单已创建（草稿）');
    setOpen(false);
    load();
  };

  return (
    <div className="page-card">
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={() => { form.resetFields(); form.setFieldsValue({ items: [{}] }); setOpen(true); }}>
          新建采购订单
        </Button>
        <Button onClick={load}>刷新</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={record.items}
              columns={[
                { title: 'SKU', render: (_, r) => r.product?.sku },
                { title: '商品', render: (_, r) => r.product?.name },
                { title: '数量', dataIndex: 'quantity' },
                { title: '单价', dataIndex: 'unitPrice' },
                { title: '金额', dataIndex: 'amount' },
              ]}
            />
          ),
        }}
        columns={[
          { title: '单号', dataIndex: 'orderNo' },
          { title: '供应商', render: (_, r) => r.supplier?.name },
          { title: '日期', dataIndex: 'orderDate', width: 120 },
          { title: '金额', dataIndex: 'totalAmount', width: 120 },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text || s}</Tag>,
          },
          {
            title: '操作',
            width: 200,
            render: (_, row) => (
              <Space>
                {row.status === 'DRAFT' && (
                  <Button
                    size="small"
                    type="primary"
                    onClick={async () => {
                      await api.post(`/purchase/orders/${row.id}/confirm`);
                      message.success('已确认');
                      load();
                    }}
                  >
                    确认
                  </Button>
                )}
                {row.status !== 'CANCELLED' && (
                  <Button
                    size="small"
                    danger
                    onClick={async () => {
                      await api.post(`/purchase/orders/${row.id}/cancel`);
                      message.success('已取消');
                      load();
                    }}
                  >
                    取消
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
      />

      <Modal title="新建采购订单" open={open} onOk={submit} onCancel={() => setOpen(false)} width={720} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="supplierId" label="供应商" rules={[{ required: true }]}>
            <Select options={suppliers.map((s) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input />
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item {...field} name={[field.name, 'productId']} rules={[{ required: true, message: '商品' }]}>
                      <Select
                        style={{ width: 220 }}
                        placeholder="商品"
                        options={products.map((p) => ({
                          value: p.id,
                          label: `${p.sku} ${p.name}`,
                        }))}
                        onChange={(pid) => {
                          const p = products.find((x) => x.id === pid);
                          if (p) {
                            const items = form.getFieldValue('items') || [];
                            items[field.name] = {
                              ...items[field.name],
                              productId: pid,
                              unitPrice: Number(p.purchasePrice),
                              quantity: items[field.name]?.quantity || 1,
                            };
                            form.setFieldsValue({ items: [...items] });
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true }]}>
                      <InputNumber min={0.01} placeholder="数量" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'unitPrice']} rules={[{ required: true }]}>
                      <InputNumber min={0} placeholder="单价" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加明细
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
