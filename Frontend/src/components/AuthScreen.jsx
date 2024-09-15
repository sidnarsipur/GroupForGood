import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import '../styles/AuthScreen.css';

const AuthScreen = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  return (
    <header className="authHeader">
      <div className="logo">LOGO</div>
      <SignedOut>
        <SignInButton className="sign-in-button">Sign Up or Sign In</SignInButton>
        <div className="subtitle">You will be redirected to Clerk to sign in</div>
      </SignedOut>
      <SignedIn>
        <p>Signed in successfully!</p>
      </SignedIn>
    </header>
  );
};

export default AuthScreen;