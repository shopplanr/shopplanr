import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ConfirmEmail from './pages/ConfirmEmail'
import Dashboard from './pages/app/Dashboard'
import ShoppingLists from './pages/app/ShoppingLists'
import ShoppingListView from './pages/app/ShoppingListView'
import History from './pages/app/History'
import Settings from './pages/Settings'
import Stats from './pages/admin/Stats'
import Users from './pages/admin/Users'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'
import './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          
          <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lists" element={<ShoppingLists />} />
          <Route path="/list/:id" element={<ShoppingListView />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  </StrictMode>,
)
