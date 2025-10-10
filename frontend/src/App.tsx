import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Flights from './pages/Flights';
import Airlines from './pages/Airlines';
import RoutesPage from './pages/Routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="flights" element={<Flights />} />
          <Route path="airlines" element={<Airlines />} />
          <Route path="routes" element={<RoutesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
