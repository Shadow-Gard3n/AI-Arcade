import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SemantiGuess from './pages/SemantiGuess';

function App() {
  return (
    <Router>
      <Routes>
        {/* The Menu Page */}
        <Route path="/" element={<Home />} />
        
        {/* The Game Page */}
        <Route path="/semantiguess" element={<SemantiGuess />} />
      </Routes>
    </Router>
  );
}

export default App;