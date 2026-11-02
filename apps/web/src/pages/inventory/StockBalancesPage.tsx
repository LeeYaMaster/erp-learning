import { Button, Input, Select, Space, Table } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function StockBalancesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouseId, setWarehouseId] = useState<number | undefined>();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const loadMeta = async () => {
    const wh = await api.get('/warehouses');
    setWarehouses(wh.data);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/inventory/balances', {
        params: { warehouseId, keyword },
      });
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta().then(load);
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
        <Input
          placeholder="SKU / 商品名"
          style={{ width: 200 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
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
          { title: '仓库', render: (_, r) => r.warehouse?.name },
          { title: 'SKU', render: (_, r) => r.product?.sku },
          { title: '商品', render: (_, r) => r.product?.name },
          { title: '单位', render: (_, r) => r.product?.unit, width: 80 },
          { title: '数量', dataIndex: 'quantity', width: 120 },
          {
            title: '安全库存',
            width: 100,
            render: (_, r) => r.product?.safetyStock,
          },
        ]}
      />
    </div>
  );
}
