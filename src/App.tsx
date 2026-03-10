import { PointsPage } from './pages/PointsPage'
import { BasicAuth } from './components/BasicAuth'

function App() {
  return (
    <BasicAuth>
      <PointsPage />
    </BasicAuth>
  )
}

export default App
