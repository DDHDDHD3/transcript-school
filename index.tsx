import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import './index.css';
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#5b21b6',
          colorText: '#1e293b',
          colorTextSecondary: '#64748b',
          borderRadius: '1rem',
        },
        elements: {
          footer: 'hidden',
          footerAction: 'hidden',
          clerkBranding: 'hidden'
        },
        layout: {
          logoPlacement: 'inside',
          showOptionalFields: false,
          helpPageUrl: null,
          privacyPageUrl: null,
          shimmer: true
        }
      }}
      localization={{
        signIn: {
          start: {
            title: "Continue with Aqooni Digital",
            subtitle: "to access your dashboard",
          },
        },
        signUp: {
          start: {
            title: "Continue with Aqooni Digital",
            subtitle: "to create your account",
          },
        },
        socialButtonsBlockButton: "Continue with {{provider|titleize}}",
        dividerText: "or continue with",
        formButtonPrimary: "Continue",
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
