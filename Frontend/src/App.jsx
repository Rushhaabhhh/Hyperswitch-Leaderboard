import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import UserPage from './Pages/UserPage.jsx';
import AdminPage from './Pages/AdminPage.jsx';
import LandingPage from './Pages/LandingPage.jsx';
import SuperAdminPage from './Pages/SuperAdminPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<UserPage />} /> 
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/super-admin" element={<SuperAdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
