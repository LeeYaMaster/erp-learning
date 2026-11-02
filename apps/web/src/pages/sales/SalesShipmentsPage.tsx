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
  CONFIRMED: { color: 'green', text: '已出库' },
  CANCELLED: { color: 'red', text: '已取消' },
};

export default function SalesShipmentsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sales/shipments');
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/customers'),
      api.get('/warehouses'),
      api.get('/products'),
      api.get('/sales/orders'),
    ]).then(([c, w, p, o]) => {
      setCustomers(c.data);
      setWarehouses(w.data);
      setProducts(p.data);
      setOrders(o.data.filter((x: any) => x.status === 'CONFIRMED'));
    });
    load();
  }, []);

  const fillFromOrder = (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    form.setFieldsValue({
      customerId: order.customerId,
      salesOrderId: orderId,
      items: order.items.map((i: any) => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    });
  };

  const submit = async () => {
    const values = await form.validateFields();
    await api.post('/sales/shipments', values);
    message.success('出库单已创建（草稿）');
    setOpen(false);
    load();
  };

  return (
    <div className="page-card">
      <Space style={{ marginBottom: 12 }}>
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            form.setFieldsValue({ items: [{}] });
            setOpen(true);
          }}
        >
          新建销售出库
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
          { title: '出库单号', dataIndex: 'shipmentNo' },
          { title: '客户', render: (_, r) => r.customer?.name },
          { title: '仓库', render: (_, r) => r.warehouse?.name },
          { title: '日期', dataIndex: 'shipmentDate', width: 120 },
          { title: '金额', dataIndex: 'totalAmount', width: 120 },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (s) => (
              <Tag color={statusMap[s]?.color}>{statusMap[s]?.text || s}</Tag>
            ),
          },
          {
            title: '操作',
            width: 120,
            render: (_, row) =>
              row.status === 'DRAFT' ? (
                <Button
                  size="small"
                  type="primary"
                  onClick={async () => {
                    try {
                      await api.post(`/sales/shipments/${row.id}/confirm`);
                      message.success('已确认出库，库存已扣减');
                      load();
                    } catch {
                      /* 库存不足等错误由拦截器提示 */
                    }
                  }}
                >
                  确认出库
                </Button>
              ) : null,
          },
        ]}
      />

      <Modal
        title="新建销售出库单"
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        width={760}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="salesOrderId" label="关联销售订单（可选）">
            <Select
              allowClear
              options={orders.map((o) => ({
                value: o.id,
                label: `${o.orderNo} / ${o.customer?.name}`,
              }))}
              onChange={(v) => v && fillFromOrder(v)}
            />
          </Form.Item>
          <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
            <Select
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item
            name="warehouseId"
            label="出库仓库"
            rules={[{ required: true }]}
          >
            <Select
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input />
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space
                    key={field.key}
                    align="baseline"
                    style={{ display: 'flex', marginBottom: 8 }}
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, 'productId']}
                      rules={[{ required: true, message: '商品' }]}
                    >
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
                              unitPrice: Number(p.salePrice),
                              quantity: items[field.name]?.quantity || 1,
                            };
                            form.setFieldsValue({ items: [...items] });
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'quantity']}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0.01} placeholder="数量" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'unitPrice']}
                      rules={[{ required: true }]}
                    >
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
