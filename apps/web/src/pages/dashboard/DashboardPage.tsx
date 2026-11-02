import { Alert, Card, Col, Row, Statistic, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setData(r.data));
  }, []);

  if (!data) return <Card loading />;

  return (
    <div className="page-card">
      <Typography.Title level={4}>仪表盘</Typography.Title>
      <Row gutter={12}>
        <Col span={6}>
          <Card>
            <Statistic title="今日单据合计" value={data.todayDocs.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日采购订单"
              value={data.todayDocs.purchaseOrders}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日销售订单" value={data.todayDocs.salesOrders} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="近7日销售金额"
              value={data.recent7Days.salesAmount}
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} title="近 7 日汇总">
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="采购入库单数 / 金额"
              value={`${data.recent7Days.purchaseCount} / ¥${Number(
                data.recent7Days.purchaseAmount,
              ).toFixed(2)}`}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="销售出库单数 / 金额"
              value={`${data.recent7Days.salesCount} / ¥${Number(
                data.recent7Days.salesAmount,
              ).toFixed(2)}`}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 16 }} title="低于安全库存预警">
        {data.lowStock.length === 0 ? (
          <Alert type="success" message="暂无低于安全库存的商品" showIcon />
        ) : (
          <Table
            rowKey="productId"
            size="small"
            pagination={false}
            dataSource={data.lowStock}
            columns={[
              { title: 'SKU', dataIndex: 'sku' },
              { title: '商品', dataIndex: 'name' },
              { title: '单位', dataIndex: 'unit', width: 80 },
              { title: '安全库存', dataIndex: 'safetyStock', width: 100 },
              { title: '当前合计', dataIndex: 'totalQty', width: 100 },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
