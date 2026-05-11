import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import Landing from '@/pages/Landing'
import Analyze from '@/pages/Analyze'
import Report from '@/pages/Report'
import Login from '@/pages/Login'
import MyPage from '@/pages/MyPage'
import PaymentSuccess from '@/pages/PaymentSuccess'
import PaymentFail from '@/pages/PaymentFail'
import ChargePage from '@/pages/ChargePage'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"        element={<Landing />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/report"  element={<Report />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/mypage"          element={<MyPage />} />
          <Route path="/payment/charge"   element={<ChargePage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/fail"    element={<PaymentFail />} />
        </Routes>
        <Toaster position="bottom-center" />
      </AuthProvider>
    </BrowserRouter>
  )
}
