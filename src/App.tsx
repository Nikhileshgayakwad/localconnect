/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SellerDashboard from './pages/SellerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetails from './pages/ProductDetails';
import Community from './pages/Community';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Marketplace from './pages/Marketplace';
import NearbySellers from './pages/NearbySellers';
import UserProfile from './pages/UserProfile';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/nearby-sellers" element={<NearbySellers />} />
          <Route path="/community" element={<Community />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/users/:userId" element={<UserProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
          </Route>
          <Route element={<ProtectedRoute requiredRole="seller" />}>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
