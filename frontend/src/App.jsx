import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnimatedBackground from './components/AnimatedBackground';
import Home from './pages/Home';
import BlogHistory from './pages/BlogHistory';
import BlogView from './pages/BlogView';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<BlogHistory />} />
            <Route path="/blog/:id" element={<BlogView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
