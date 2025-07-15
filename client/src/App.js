import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './header';
import Footer from './footer';
import Home from './homepage';
import ResultsPage from './ResultsPage';
import LoginPage from './LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          }
        />
        <Route
          path="/results"
          element={
            <>
              <Header />
              <ResultsPage />
              <Footer />
            </>
          }
        />
        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
