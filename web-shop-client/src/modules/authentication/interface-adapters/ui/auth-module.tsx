'use client';

import { useState } from 'react';
import { LoginButton } from '../components/login-button';
import { AuthPopup } from '../components/auth-popup';

interface AuthModuleProps {
  children?: React.ReactNode;
}

export function AuthModule({ children }: AuthModuleProps) {
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  return (
    <>
      {children}
      
      {/* Auth Popup Overlay */}
      {showAuthPopup && (
        <AuthPopup onClose={() => setShowAuthPopup(false)} />
      )}
    </>
  );
}

// Export the LoginButton with integrated popup management
export function AuthLoginButton() {
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  return (
    <>
      <LoginButton onLoginClick={() => setShowAuthPopup(true)} />
      
      {/* Auth Popup Overlay */}
      {showAuthPopup && (
        <AuthPopup onClose={() => setShowAuthPopup(false)} />
      )}
    </>
  );
}
