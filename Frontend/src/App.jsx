import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import GroupScreen from './components/GroupScreen';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/group/:groupId" element={<GroupScreen />} />
      </Routes>
    </Router>
  );
};

export default App;