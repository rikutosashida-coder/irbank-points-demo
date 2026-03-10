import { BrowserRouter } from 'react-router-dom'
import { PointsPage } from './pages/PointsPage'
import { BasicAuth } from './components/BasicAuth'

function App() {
  return (
    <BrowserRouter>
      <BasicAuth>
        <PointsPage />
      </BasicAuth>
    </BrowserRouter>
  )
}

export default App
