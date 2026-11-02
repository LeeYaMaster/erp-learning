import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import CustomersPage from './pages/customers/CustomersPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import WarehousesPage from './pages/warehouses/WarehousesPage';
import PurchaseOrdersPage from './pages/purchase/PurchaseOrdersPage';
import PurchaseReceiptsPage from './pages/purchase/PurchaseReceiptsPage';
import SalesOrdersPage from './pages/sales/SalesOrdersPage';
import SalesShipmentsPage from './pages/sales/SalesShipmentsPage';
import StockBalancesPage from './pages/inventory/StockBalancesPage';
import StockMovementsPage from './pages/inventory/StockMovementsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="warehouses" element={<WarehousesPage />} />
            <Route path="purchase/orders" element={<PurchaseOrdersPage />} />
            <Route path="purchase/receipts" element={<PurchaseReceiptsPage />} />
            <Route path="sales/orders" element={<SalesOrdersPage />} />
            <Route path="sales/shipments" element={<SalesShipmentsPage />} />
            <Route path="inventory/balances" element={<StockBalancesPage />} />
            <Route path="inventory/movements" element={<StockMovementsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
