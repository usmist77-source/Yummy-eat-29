import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './AppContext'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Menu from './pages/Menu'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Admin from './pages/Admin'

function Shell() {
  const [cartOpen, setCartOpen] = useState(false)
  return (
    <div className="h-full flex flex-col bg-app text-main">
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <main className="flex-1 min-h-0">
        <Routes>
          <Route path="/" element={<Menu onOpenCart={() => setCartOpen(true)} />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppProvider>
  )
}
