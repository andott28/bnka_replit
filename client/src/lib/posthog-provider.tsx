import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import posthog from 'posthog-js';

// Norsk personvernkontekst
type ConsentStatus = 'pending' | 'accepted' | 'rejected';

interface PostHogContextType {
  posthog: typeof posthog;
  consentStatus: ConsentStatus;
  acceptConsent: () => void;
  rejectConsent: () => void;
}

const PostHogContext = createContext<PostHogContextType | undefined>(undefined);

const CONSENT_COOKIE_NAME = 'bnka_analytics_consent';

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');

  useEffect(() => {
    // Sjekk om bruker allerede har samtykket
    const savedConsent = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (savedConsent) {
      const consent = JSON.parse(savedConsent);
      setConsentStatus(consent.status);
      
      if (consent.status === 'accepted') {
        initPostHog();
      }
    }
  }, []);

  const initPostHog = () => {
    // Initialiser PostHog når brukeren har gitt samtykke
    posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string, {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: {
        css_selector_allowlist: ['data-ph-capture'],
      },
      respect_dnt: true, // Respekter "Do Not Track"
      loaded: (ph) => {
        // Sett eventuelle begrensinger etter innlasting
        if (import.meta.env.MODE !== 'production') {
          ph.opt_out_capturing(); // Opt-out i utviklingsmodus
        }
      }
    });
  };

  const acceptConsent = () => {
    localStorage.setItem(
      CONSENT_COOKIE_NAME,
      JSON.stringify({
        status: 'accepted',
        timestamp: new Date().toISOString(),
        version: '1.0',
      })
    );
    setConsentStatus('accepted');
    initPostHog();
  };

  const rejectConsent = () => {
    localStorage.setItem(
      CONSENT_COOKIE_NAME,
      JSON.stringify({
        status: 'rejected',
        timestamp: new Date().toISOString(),
        version: '1.0',
      })
    );
    setConsentStatus('rejected');
    posthog.opt_out_capturing(); // Deaktiver sporing
  };

  return (
    <PostHogContext.Provider
      value={{
        posthog,
        consentStatus,
        acceptConsent,
        rejectConsent,
      }}
    >
      {children}
    </PostHogContext.Provider>
  );
}

export function usePostHog() {
  const context = useContext(PostHogContext);
  if (context === undefined) {
    throw new Error('usePostHog must be used within a PostHogProvider');
  }
  return context;
}