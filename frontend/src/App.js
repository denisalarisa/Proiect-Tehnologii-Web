import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';

import Dashboard from './pages/Dashboard';
import NewProject from './pages/NewProject';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <div className="navbar"> 
        <div className="container navInner">
          <div className="brand">
            <span className="brandDot"></span>
            <span>Anonymous Grading</span>
          </div>

          <div className="navLinks">
            <NavLink
              to="/"
              end
              className={({ isActive }) => "navLink " + (isActive ? "navLinkActive" : "")}
            >
              Sarcini Evaluare
            </NavLink>

            <NavLink
              to="/new-project"
              className={({ isActive }) => "navLink " + (isActive ? "navLinkActive" : "")}
            >
              Adauga Proiect
            </NavLink>

            <NavLink
              to="/results"
              className={({ isActive }) => "navLink " + (isActive ? "navLinkActive" : "")}
            >
              Clasament / Rezultate
            </NavLink>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-project" element={<NewProject />} />
        <Route path="/results" element={<Results />} />
      </Routes>

      <div className="container footer">
        Anonymous Grading • SPARK
      </div>
    </Router>
  );
}

export default App;
