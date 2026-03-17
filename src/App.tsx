import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PointsPage } from './pages/PointsPage'
import { BadgesPage } from './pages/BadgesPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { BasicAuth } from './components/BasicAuth'
import { Layout } from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <BasicAuth>
        <Layout>
          <Routes>
            <Route path="/" element={<PointsPage />} />
            <Route path="/mypage/badges" element={<BadgesPage />} />

            {/* Coming Soon ページ */}
            <Route path="/mypage" element={<ComingSoonPage />} />
            <Route path="/notes" element={<ComingSoonPage />} />
            <Route path="/workspace" element={<ComingSoonPage />} />
            <Route path="/dashboard" element={<ComingSoonPage />} />
            <Route path="/dashboard2" element={<ComingSoonPage />} />
            <Route path="/portfolio" element={<ComingSoonPage />} />
            <Route path="/timeline" element={<ComingSoonPage />} />
            <Route path="/notifications" element={<ComingSoonPage />} />
            <Route path="/learning" element={<ComingSoonPage />} />
            <Route path="/community" element={<ComingSoonPage />} />
            <Route path="/ai" element={<ComingSoonPage />} />
            <Route path="/settings" element={<ComingSoonPage />} />
          </Routes>
        </Layout>
      </BasicAuth>
    </BrowserRouter>
  )
}

export default App
