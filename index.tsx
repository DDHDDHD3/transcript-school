import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import './index.css';
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key – add VITE_CLERK_PUBLISHABLE_KEY to .env.local");
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/#/"
      signInFallbackRedirectUrl="/#/admin/dashboard"
      signUpFallbackRedirectUrl="/#/admin/dashboard"
      afterSignInUrl="/#/admin/dashboard"
      afterSignUpUrl="/#/admin/dashboard"
      appearance={{
        variables: {
          colorPrimary: '#f59e0b',          // amber-400 – matches school CTA buttons
          colorTextOnPrimaryBackground: '#0a0f1e',
          colorBackground: '#0d1225',       // deep navy matching the login page
          colorInputBackground: 'rgba(255,255,255,0.05)',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: 'rgba(255,255,255,0.5)',
          colorDanger: '#f87171',
          colorSuccess: '#34d399',
          borderRadius: '1rem',
          fontFamily: 'Inter, Cairo, sans-serif',
          fontWeight: { bold: 800, normal: 500 },
        },
        elements: {
          // Hide ALL Clerk branding
          footer: { display: 'none' },
          footerAction: { display: 'none' },
          footerActionLink: { display: 'none' },
          footerPages: { display: 'none' },

          // Card styling
          card: {
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
            borderRadius: '2rem',
          },
          // Header
          headerTitle: {
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '1.4rem',
          },
          headerSubtitle: {
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.85rem',
          },
          // Logo area – the logo you set in Clerk dashboard will show here
          logoBox: {
            marginBottom: '0.5rem',
          },
          logoImage: {
            borderRadius: '1rem',
            width: '72px',
            height: '72px',
          },
          // Form inputs
          formFieldInput: {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#ffffff',
            borderRadius: '0.75rem',
            fontSize: '0.9rem',
          },
          formFieldLabel: {
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 700,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          },
          // Primary button
          formButtonPrimary: {
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#0a0f1e',
            fontWeight: 900,
            borderRadius: '0.875rem',
            fontSize: '0.9rem',
            boxShadow: '0 10px 30px rgba(245,158,11,0.35)',
            border: 'none',
          },
          // Social buttons
          socialButtonsBlockButton: {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#ffffff',
            borderRadius: '0.875rem',
            fontWeight: 700,
          },
          dividerText: {
            color: 'rgba(255,255,255,0.2)',
          },
          dividerLine: {
            background: 'rgba(255,255,255,0.08)',
          },
          // Internal nav links (already have account? etc.)
          identityPreviewEditButtonIcon: { color: '#f59e0b' },
          formResendCodeLink: { color: '#a78bfa' },
        },
        layout: {
          logoPlacement: 'inside',
          showOptionalFields: false,
          helpPageUrl: undefined,
          privacyPageUrl: undefined,
          termsPageUrl: undefined,
          shimmer: false,
          socialButtonsVariant: 'blockButton',
        },
      }}
      localization={{
        signIn: {
          start: {
            title: "Sign In to Your School",
            subtitle: "Aqooni Digital — School Management",
            actionText: "New school?",
            actionLink: "Register here",
          },
        },
        signUp: {
          start: {
            title: "Register Your School",
            subtitle: "Get started with Aqooni Digital",
            actionText: "Already registered?",
            actionLink: "Sign in",
          },
        },
        userButton: {
          action__signOut: "Sign Out",
        },
        formButtonPrimary: "Continue",
        socialButtonsBlockButton: "Continue with {{provider|titleize}}",
        dividerText: "or",
        formFieldInputPlaceholder__emailAddress: "Enter your school email",
        formFieldInputPlaceholder__password: "Enter your password",
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
