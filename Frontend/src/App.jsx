import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Pages/LandingPage.jsx';
import HomePage from './Pages/HomePage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/HomePage" element={<HomePage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
