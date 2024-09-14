import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from "@clerk/clerk-react";
import '../styles/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <SignedIn>
        <header className="dashboard-header">
          <h1>Welcome to the Dashboard</h1>
          <UserButton />
        </header>
        <main className="dashboard-main">
          <p>This is a protected route.</p>
        </main>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
};

export default Dashboard;