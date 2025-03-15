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

  const initPostHog = () => {
    // Initialiser PostHog når brukeren har gitt samtykke
    posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string, {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: {
        // Configure autocapture to be more specific and privacy-conscious
        css_selector_allowlist: ['button', 'a', 'input', 'form'],
        dom_event_allowlist: ['click', 'submit']
      },
      respect_dnt: true, // Respect Do Not Track browser setting
      property_blacklist: ['$ip', 'email'], // Avoid tracking these properties
      mask_all_text: true, // Don't capture actual text content, just events
      mask_all_element_attributes: true, // Don't capture attributes with personal data
      loaded: (ph) => {
        // Sett eventuelle begrensinger etter innlasting
        if (import.meta.env.MODE !== 'production') {
          ph.opt_out_capturing(); // Opt-out i utviklingsmodus
        } else {
          // Sett opp lytter for når brukeren forlater siden
          window.addEventListener('beforeunload', () => {
            ph.capture('$pageleave');
          });
          
          // Add user properties that help with segment analysis but maintain privacy
          ph.register({
            app_version: '1.0',
            interface_language: navigator.language,
            is_mobile: window.innerWidth < 768,
            viewport_width: window.innerWidth,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
          });
        }
      }
    });
  };

  // Function to track events with standard format
  const trackEvent = (eventName: string | AnalyticsEvents, properties?: Record<string, any>) => {
    if (consentStatus !== 'accepted') return;
    
    // Add standard metadata to all events
    const enhancedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      url_path: window.location.pathname,
      app_context: 'bnka_web'
    };
    
    posthog.capture(eventName, enhancedProperties);
  };

  const acceptConsent = () => {
    localStorage.setItem(
      CONSENT_COOKIE_NAME,
      JSON.stringify({
        status: 'accepted',
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION,
      })
    );
    setConsentStatus('accepted');
    initPostHog();
    
    // Track the consent acceptance
    posthog.capture(AnalyticsEvents.CONSENT_ACCEPT, {
      consent_version: CONSENT_VERSION,
      timestamp: new Date().toISOString()
    });
  };

  const rejectConsent = () => {
    localStorage.setItem(
      CONSENT_COOKIE_NAME,
      JSON.stringify({
        status: 'rejected',
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION,
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