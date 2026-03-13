import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PointsPage } from './pages/PointsPage'
import { BadgesPage } from './pages/BadgesPage'
import { BasicAuth } from './components/BasicAuth'

function App() {
  return (
    <BrowserRouter>
      <BasicAuth>
        <Routes>
          <Route path="/" element={<PointsPage />} />
          <Route path="/mypage/badges" element={<BadgesPage />} />
        </Routes>
      </BasicAuth>
    </BrowserRouter>
  )
}

export default App
