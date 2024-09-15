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
      <div className="logo"><img src="https://cdn.discordapp.com/attachments/965298457877295214/1284900625347383407/roup4Good-removebg-preview.png?ex=66e85075&is=66e6fef5&hm=7d971807adf597402e9073002c16d509188e2f6fa4bc0543ae701166c4871c02&" alt="Logo" /></div>
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