import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { PointsPage } from './pages/PointsPage'
import { BadgesPage } from './pages/BadgesPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { SettingsPage } from './pages/SettingsPage'
import { SignupPage } from './pages/SignupPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { BasicAuth } from './components/BasicAuth'
import { Layout } from './components/Layout'

function AppContent() {
  const location = useLocation()
  const isPublicPage = ['/signup', '/terms', '/privacy-policy'].includes(location.pathname)

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      </Routes>
    )
  }

  return (
    <BasicAuth>
      <Layout>
        <Routes>
          <Route path="/" element={<PointsPage />} />
          <Route path="/mypage/badges" element={<BadgesPage />} />

          {/* Coming Soon ページ - IRBANK情報 */}
          <Route path="/top" element={<ComingSoonPage />} />
          <Route path="/stocks" element={<ComingSoonPage />} />
          <Route path="/screening" element={<ComingSoonPage />} />
          <Route path="/screening2" element={<ComingSoonPage />} />
          <Route path="/comparison" element={<ComingSoonPage />} />
          <Route path="/investor-search" element={<ComingSoonPage />} />
          <Route path="/industry-map" element={<ComingSoonPage />} />
          <Route path="/macro" element={<ComingSoonPage />} />
          <Route path="/sector-heatmap" element={<ComingSoonPage />} />
          <Route path="/factor-model" element={<ComingSoonPage />} />

          {/* Coming Soon ページ - マイページ */}
          <Route path="/new-note" element={<ComingSoonPage />} />
          <Route path="/mypage" element={<ComingSoonPage />} />
          <Route path="/notes" element={<ComingSoonPage />} />
          <Route path="/workspace" element={<ComingSoonPage />} />
          <Route path="/dashboard" element={<ComingSoonPage />} />
          <Route path="/dashboard2" element={<ComingSoonPage />} />
          <Route path="/portfolio" element={<ComingSoonPage />} />
          <Route path="/timeline" element={<ComingSoonPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/learning" element={<ComingSoonPage />} />
          <Route path="/community" element={<ComingSoonPage />} />

          {/* Coming Soon ページ - AI機能・その他 */}
          <Route path="/ai" element={<ComingSoonPage />} />

          {/* 設定ページ */}
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BasicAuth>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
