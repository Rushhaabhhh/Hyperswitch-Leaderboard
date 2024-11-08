import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Pages/LandingPage.jsx';
import HomePage from './Pages/HomePage.jsx';
import AdminPage from './Pages/AdminPage.jsx';
import SuperAdminPage from './Pages/SuperAdminPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/HomePage" element={<HomePage />} /> 
        <Route path="/AdminPage" element={<AdminPage />} />
        <Route path="/SuperAdminPage" element={<SuperAdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
