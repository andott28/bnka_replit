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
    try {
      // Sjekk om PostHog allerede er initialisert (fra inline script i index.html)
      // @ts-ignore: Property '__loaded' does not exist on type 'PostHogType'
      const isAlreadyLoaded = typeof posthog !== 'undefined' && posthog.__loaded;
      
      if (!isAlreadyLoaded) {
        // Initialiser PostHog når brukeren har gitt samtykke og hvis det ikke allerede er initialisert
        posthog.init('phc_zducSI4daJVemOPzwDohrkNtzpTjtY9qlw55GdPoCCz', {
          api_host: 'https://us.i.posthog.com',
          capture_pageview: true,
          capture_pageleave: true,
          person_profiles: 'identified_only', // Bare lag profiler for identifiserte brukere
          autocapture: {
            // Configure autocapture to be more specific and privacy-conscious
            css_selector_allowlist: ['button', 'a', 'input', 'form'],
            dom_event_allowlist: ['click', 'submit']
          },
          respect_dnt: true, // Respect Do Not Track browser setting
          property_blacklist: ['$ip', 'email'], // Avoid tracking these properties
          mask_all_text: true, // Don't capture actual text content, just events
          mask_all_element_attributes: true, // Don't capture attributes with personal data
          bootstrap: {
            distinctID: 'anonymous_user'
          },
          // Fjern on_xhr_error siden vi har problemer med typene
          // og vi har allerede try-catch rundt hele initialiseringen
          loaded: (ph) => {
            console.log('PostHog loaded successfully from provider');
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
      } else {
        console.log('PostHog already initialized from HTML script');
        
        // Still register our configuration
        if (import.meta.env.MODE !== 'production') {
          posthog.opt_out_capturing(); // Opt-out i utviklingsmodus
        } else {
          // Register standard properties even when initialized by head script
          posthog.register({
            app_version: '1.0',
            interface_language: navigator.language,
            is_mobile: window.innerWidth < 768,
            viewport_width: window.innerWidth,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize PostHog from provider:', error);
    }
  };

  // Function to track events with standard format
  // Mer robust og fault-tolerant analytics-tracking
  const trackEvent = (eventName: string | AnalyticsEvents, properties?: Record<string, any>) => {
    // Ikke track hvis bruker ikke har samtykket
    if (consentStatus !== 'accepted') return;
    
    // Bruk setTimeout for å hindre at tracking blokkerer UI, og håndtere feil bedre
    setTimeout(() => {
      try {
        // Add standard metadata to all events
        const enhancedProperties = {
          ...properties,
          timestamp: new Date().toISOString(),
          url_path: window.location.pathname,
          app_context: 'bnka_web'
        };
        
        // Sjekk om PostHog faktisk er tilgjengelig og fungerer
        if (typeof posthog !== 'undefined' && typeof posthog.capture === 'function') {
          // Promise-wrap for bedre feilhåndtering
          Promise.resolve().then(() => {
            return posthog.capture(eventName, enhancedProperties);
          }).catch(err => {
            // Stille feilhåndtering, ikke skriv til konsoll i produksjon
            if (import.meta.env.MODE !== 'production') {
              console.warn('PostHog capture failed:', err);
            }
          });
        } else if (import.meta.env.MODE !== 'production') {
          console.warn('PostHog not fully initialized for tracking:', eventName);
        }
      } catch (error) {
        // Ikke la analytics-feil krasje applikasjonen
        if (import.meta.env.MODE !== 'production') {
          console.error('Error in analytics tracking:', error);
        }
      }
    }, 0);
  };

  // Forbedret samtykke-aksept med feilhåndtering
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
      
      // Initialiser PostHog etter samtykke
      initPostHog();
      
      // Track i en setTimeout for å unngå mulige blokkeringsproblemer
      setTimeout(() => {
        try {
          if (typeof posthog !== 'undefined' && typeof posthog.capture === 'function') {
            // Promise-wrap feilhåndtering
            Promise.resolve().then(() => {
              return posthog.capture(AnalyticsEvents.CONSENT_ACCEPT, {
                consent_version: CONSENT_VERSION,
                timestamp: new Date().toISOString()
              });
            }).catch(err => {
              if (import.meta.env.MODE !== 'production') {
                console.warn('Error tracking consent acceptance:', err);
              }
            });
          }
        } catch (innerError) {
          if (import.meta.env.MODE !== 'production') {
            console.warn('Failed to track consent acceptance:', innerError);
          }
        }
      }, 0);
    } catch (error) {
      console.error('Error during consent acceptance:', error);
      // Fortsatt sette samtykke selv om tracking mislyktes
      setConsentStatus('accepted');
    }
  };

  // Forbedret samtykke-avvisning med feilhåndtering
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
      
      // Kjør i setTimeout for å unngå å blokkere UI
      setTimeout(() => {
        try {
          if (typeof posthog !== 'undefined') {
            // Prøv å deaktivere først
            try {
              posthog.opt_out_capturing();
            } catch (optOutError) {
              if (import.meta.env.MODE !== 'production') {
                console.warn('Failed to opt out of tracking:', optOutError);
              }
            }
            
            // Forsøk en siste sporing i en try-catch
            if (typeof posthog.capture === 'function') {
              Promise.resolve().then(() => {
                return posthog.capture(AnalyticsEvents.CONSENT_REJECT, {
                  consent_version: CONSENT_VERSION,
                  timestamp: new Date().toISOString()
                });
              }).catch(err => {
                // Ikke logg i produksjon
                if (import.meta.env.MODE !== 'production') {
                  console.warn('Error logging consent rejection:', err);
                }
              });
            }
          }
        } catch (innerError) {
          if (import.meta.env.MODE !== 'production') {
            console.warn('Error in rejection tracking:', innerError);
          }
        }
      }, 0);
    } catch (error) {
      console.error('Error during consent rejection:', error);
      // Fortsatt sette avvisning selv om storage mislyktes
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