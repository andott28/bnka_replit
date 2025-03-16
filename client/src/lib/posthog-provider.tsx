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

  // Implementerer PostHog-sporing via direkte API-kall
  const trackEvent = (eventName: string | AnalyticsEvents, properties?: Record<string, any>) => {
    // Ikke track hvis bruker ikke har samtykket eller i utviklingsmodus
    if (consentStatus !== 'accepted' || import.meta.env.MODE !== 'production') {
      if (import.meta.env.MODE !== 'production') {
        console.log('Analytics tracking (dev only):', eventName, properties);
      }
      return;
    }

    // Kjør API-kall utenfor hovedtråden med setTimeout
    setTimeout(async () => {
      try {
        // Forbered data som skal sendes
        const payload = {
          api_key: 'phc_zducSI4daJVemOPzwDohrkNtzpTjtY9qlw55GdPoCCz',
          event: eventName,
          properties: {
            distinct_id: localStorage.getItem('user_id') || 'anonymous',
            app_version: '1.0',
            interface_language: navigator.language,
            is_mobile: window.innerWidth < 768,
            viewport_width: window.innerWidth,
            url_path: window.location.pathname,
            app_context: 'bnka_web',
            ...properties,
          },
          timestamp: new Date().toISOString(),
          $process_person_profile: false // Ikke lag person-profiler
        };

        // Send via fetch API
        const response = await fetch('https://us.i.posthog.com/capture/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          // Kort timeout for å ikke blokkere brukeropplevelsen
          signal: AbortSignal.timeout(2000) // 2 sekunder timeout
        });

        // Bare logg respons i utviklingsmodus
        if (import.meta.env.MODE !== 'production' && !response.ok) {
          console.warn('PostHog API error:', await response.text());
        }
      } catch (error) {
        // Stille feil - ikke la dette påvirke brukeropplevelsen
        if (import.meta.env.MODE !== 'production') {
          console.warn('Error sending analytics:', error);
        }
      }
    }, 0);
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