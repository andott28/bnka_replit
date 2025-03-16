import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import posthog from 'posthog-js';

// Norsk personvernkontekst
type ConsentStatus = 'pending' | 'accepted' | 'rejected';

// Define standard event types for consistency
export enum AnalyticsEvents {
  // Navigation events
  NAVIGATION = 'navigation',
  PAGE_VIEW = 'page_view',
  
  // User actions
  BUTTON_CLICK = 'button_click',
  LINK_CLICK = 'link_click',
  FORM_SUBMISSION = 'form_submission',
  FORM_ERROR = 'form_error',
  
  // User authentication
  USER_LOGIN = 'user_login',
  USER_REGISTER = 'user_register',
  USER_LOGOUT = 'user_logout',
  
  // Loan application flow
  LOAN_APPLICATION_START = 'loan_application_start',
  LOAN_APPLICATION_STEP = 'loan_application_step',
  LOAN_APPLICATION_COMPLETE = 'loan_application_complete',
  
  // Other interactions
  TOGGLE_PREFERENCE = 'toggle_preference',
  OPEN_MODAL = 'open_modal',
  CLOSE_MODAL = 'close_modal',
  
  // BankID verification
  BANKID_START = 'bankid_start',
  BANKID_SUCCESS = 'bankid_success',
  BANKID_FAILURE = 'bankid_failure',
  
  // Consent management
  CONSENT_ACCEPT = 'consent_accept',
  CONSENT_REJECT = 'consent_reject'
}

interface PostHogContextType {
  posthog: typeof posthog;
  consentStatus: ConsentStatus;
  acceptConsent: () => void;
  rejectConsent: () => void;
  // New analytics tracking function
  trackEvent: (eventName: string | AnalyticsEvents, properties?: Record<string, any>) => void;
}

const PostHogContext = createContext<PostHogContextType | undefined>(undefined);

const CONSENT_COOKIE_NAME = 'bnka_analytics_consent';
const CONSENT_VERSION = '1.1'; // Update version when changing consent requirements

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');

  useEffect(() => {
    // Sjekk om bruker allerede har samtykket
    const savedConsent = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (savedConsent) {
      try {
        const consent = JSON.parse(savedConsent);
        
        // If consent version has changed, reset to pending
        if (consent.version !== CONSENT_VERSION) {
          setConsentStatus('pending');
          return;
        }
        
        setConsentStatus(consent.status);
        
        if (consent.status === 'accepted') {
          initPostHog();
        }
      } catch (error) {
        // If parsing fails, reset to pending
        console.error('Error parsing consent data:', error);
        setConsentStatus('pending');
      }
    }
  }, []);

  // Deaktivert PostHog initialisering
  const initPostHog = () => {
    // Ikke gjør noe, PostHog er deaktivert
    if (import.meta.env.MODE !== 'production') {
      console.log('PostHog initialisering deaktivert');
    }
    return;
  };

  // Deaktivert tracking funksjon som ikke gjør noe
  const trackEvent = (eventName: string | AnalyticsEvents, properties?: Record<string, any>) => {
    // Ikke gjør noe, logging er deaktivert
    if (import.meta.env.MODE !== 'production') {
      // Logg bare i utviklingsmiljø for debugging
      console.log('Analytics tracking deaktivert:', eventName, properties);
    }
    return; // Ikke gjør noe
  };

  // Forenklet samtykke-aksept som ikke gjør noe sporing
  const acceptConsent = () => {
    try {
      localStorage.setItem(
        CONSENT_COOKIE_NAME,
        JSON.stringify({
          status: 'accepted',
          timestamp: new Date().toISOString(),
          version: CONSENT_VERSION,
        })
      );
      setConsentStatus('accepted');
      
      // Logging bare i utviklingsmiljø
      if (import.meta.env.MODE !== 'production') {
        console.log('Samtykke akseptert, men sporing er deaktivert');
      }
    } catch (error) {
      console.error('Error during consent acceptance:', error);
      // Fortsatt sette samtykke selv om lagring mislyktes
      setConsentStatus('accepted');
    }
  };

  // Forenklet samtykke-avvisning som ikke gjør noe sporing
  const rejectConsent = () => {
    try {
      localStorage.setItem(
        CONSENT_COOKIE_NAME,
        JSON.stringify({
          status: 'rejected',
          timestamp: new Date().toISOString(),
          version: CONSENT_VERSION,
        })
      );
      setConsentStatus('rejected');
      
      // Logging bare i utviklingsmiljø
      if (import.meta.env.MODE !== 'production') {
        console.log('Samtykke avvist, sporing var allerede deaktivert');
      }
    } catch (error) {
      console.error('Error during consent rejection:', error);
      // Fortsatt sette avvisning selv om lagring mislyktes
      setConsentStatus('rejected');
    }
  };

  return (
    <PostHogContext.Provider
      value={{
        posthog,
        consentStatus,
        acceptConsent,
        rejectConsent,
        trackEvent
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