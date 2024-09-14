// src/AuthScreen.jsx
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';

const AuthScreen = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <p>Signed in successfully!</p>
      </SignedIn>
    </header>
  );
};

export default AuthScreen;