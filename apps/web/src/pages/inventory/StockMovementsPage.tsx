import { Button, Select, Space, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function StockMovementsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouseId, setWarehouseId] = useState<number | undefined>();
  const [direction, setDirection] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/inventory/movements', {
        params: { warehouseId, direction },
      });
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/warehouses').then((r) => setWarehouses(r.data));
    load();
  }, []);

  return (
    <div className="page-card">
      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          allowClear
          placeholder="仓库"
          style={{ width: 180 }}
          options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          onChange={(v) => setWarehouseId(v)}
        />
        <Select
          allowClear
          placeholder="方向"
          style={{ width: 120 }}
          options={[
            { value: 'IN', label: '入库' },
            { value: 'OUT', label: '出库' },
          ]}
          onChange={(v) => setDirection(v)}
        />
        <Button type="primary" onClick={load}>
          查询
        </Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: '时间', dataIndex: 'createdAt', width: 180 },
          { title: '仓库', render: (_, r) => r.warehouse?.name },
          { title: 'SKU', render: (_, r) => r.product?.sku },
          { title: '商品', render: (_, r) => r.product?.name },
          {
            title: '方向',
            dataIndex: 'direction',
            width: 90,
            render: (v) =>
              v === 'IN' ? <Tag color="green">入库</Tag> : <Tag color="red">出库</Tag>,
          },
          { title: '数量', dataIndex: 'quantity', width: 100 },
          { title: '结存', dataIndex: 'balanceAfter', width: 100 },
          { title: '业务类型', dataIndex: 'bizType', width: 140 },
          { title: '单号', dataIndex: 'bizNo', width: 180 },
        ]}
      />
    </div>
  );
}
