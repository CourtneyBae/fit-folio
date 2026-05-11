import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import Landing from '@/pages/Landing'
import Analyze from '@/pages/Analyze'
import Report from '@/pages/Report'
import Login from '@/pages/Login'
import MyPage from '@/pages/MyPage'
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
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
        <Toaster position="bottom-center" />
      </AuthProvider>
    </BrowserRouter>
  )
}
