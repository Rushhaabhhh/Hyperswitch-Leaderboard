import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Pages/LandingPage.jsx';
import TestPage from './Pages/TestPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/TestPage" element={<TestPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
