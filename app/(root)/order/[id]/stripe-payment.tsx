import { Button } from "@/components/ui/button";
import { SERVER_URL } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  CardElement,
  Elements,
  LinkAuthenticationElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import { useTheme } from "next-themes";
import React, { FormEvent, useState, useMemo, useRef, useCallback } from "react";

// Create Stripe promise outside component to avoid recreation
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

// Global flag to track if Stripe Elements is already initialized
let isStripeElementsInitialized = false;

// Error Boundary Component for PaymentElement
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('PaymentElement Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PaymentElement Error Details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '16px', border: '1px solid red', borderRadius: '4px' }}>
          <p>Payment form failed to load.</p>
          <p className="text-sm mt-2">Error: {this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007cba', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const StripePayment = React.memo(({
  priceInCents,
  orderId,
  clientSecret,
}: {
  priceInCents: number;
  orderId: string;
  clientSecret: string;
}) => {
  // Early return if clientSecret is invalid
  if (!clientSecret) {
    console.error('No client secret provided to StripePayment component');
    return (
      <div style={{ color: 'red', padding: '16px', border: '1px solid red', borderRadius: '4px' }}>
        Unable to initialize payment. Please refresh the page and try again.
      </div>
    );
  }

  const { theme, systemTheme } = useTheme();

  // Static Elements options - create once and never recreate
  const elementsOptions = useMemo(() => {
    console.log('Creating Elements options with clientSecret:', !!clientSecret);
    return {
      clientSecret,
      // Force development-friendly settings
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#0570de',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          fontFamily: 'Ideal Sans, system-ui, sans-serif',
          spacingUnit: '2px',
          borderRadius: '4px',
        }
      },
      loader: 'auto',
    };
  }, []); // No dependencies - options are set once when component mounts

  // Stripe Form Component
  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isStripeReady, setIsStripeReady] = useState(false);
    const initializationRef = useRef(false);

    // Check if Stripe is properly initialized - only once
    React.useEffect(() => {
      console.log('StripeForm useEffect - stripe:', !!stripe, 'elements:', !!elements, 'initialized:', initializationRef.current);
      
      if (isStripeElementsInitialized) {
        console.warn('Stripe Elements already initialized globally - skipping duplicate initialization');
        return;
      }
      
      if (stripe && elements && !initializationRef.current) {
        initializationRef.current = true;
        isStripeElementsInitialized = true;
        setIsStripeReady(true);
        console.log('Stripe Elements fully initialized');
        
        // Check if PaymentElement exists multiple times
        // Check CardElement status with detailed debugging
        setTimeout(() => {
          const cardElement = elements.getElement(CardElement);
          console.log('CardElement found after 1s:', !!cardElement);
          
          // Check if CardElement DOM is present and visible
          const cardWrapper = document.getElementById('card-element-wrapper');
          console.log('Card wrapper element:', cardWrapper);
          
          const stripeElements = document.querySelectorAll('.StripeElement');
          console.log('StripeElement DOM elements found:', stripeElements.length);
          
          stripeElements.forEach((el, index) => {
            console.log(`StripeElement ${index}:`, {
              tagName: el.tagName,
              className: el.className,
              display: window.getComputedStyle(el).display,
              visibility: window.getComputedStyle(el).visibility,
              opacity: window.getComputedStyle(el).opacity,
              height: window.getComputedStyle(el).height,
              width: window.getComputedStyle(el).width,
              childNodes: el.childNodes.length
            });
          });
        }, 2000);
        
        setTimeout(() => {
          const cardElement = elements.getElement(CardElement);
          console.log('CardElement found after 5s:', !!cardElement);
          
          // Try to see if iframe is loaded
          const iframes = document.querySelectorAll('iframe[name*="stripe"]');
          console.log('Stripe iframes found:', iframes.length);
          iframes.forEach((iframe, index) => {
            console.log(`Stripe iframe ${index}:`, {
              src: iframe.src,
              display: window.getComputedStyle(iframe).display,
              visibility: window.getComputedStyle(iframe).visibility,
              height: window.getComputedStyle(iframe).height,
              width: window.getComputedStyle(iframe).width
            });
          });
          
          // If no iframes found, try to diagnose the issue
          if (iframes.length === 0) {
            console.error('❌ STRIPE IFRAME ISSUE: No Stripe iframes loaded!');
            console.log('🔍 Possible causes:');
            console.log('  1. HTTPS certificate issues blocking iframe loading');
            console.log('  2. Content Security Policy blocking iframes');
            console.log('  3. Stripe API key configuration issue');
            console.log('  4. Network connectivity to Stripe servers');
            console.log('💡 Recommendation: Try switching to HTTP mode for development');
            
            // Check if elements actually has the card element
            const cardEl = elements?.getElement(CardElement);
            if (cardEl) {
              console.log('✅ CardElement exists but iframes not loading');
              console.log('Skipping manual remount to avoid IntegrationError. If this persists, it is almost certainly a CSP or browser/extension issue.');
            }
          }
        }, 5000);
      }
      
      // Cleanup function
      return () => {
        if (initializationRef.current) {
          console.log('Cleaning up Stripe Elements initialization');
          isStripeElementsInitialized = false;
          initializationRef.current = false;
        }
      };
    }, [stripe, elements]);

    // Handle Stripeform Submit form
    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        console.log('=== PAYMENT SUBMISSION START ===');
        console.log('Form submitted, stripe available:', !!stripe, 'elements available:', !!elements);
        console.log('Client secret available:', !!clientSecret);
        console.log('Stripe ready:', isStripeReady);
        
        if (!isStripeReady || stripe == null || elements == null) {
          console.error('Stripe not properly initialized yet');
          setErrorMessage('Stripe is still loading. Please wait a moment and try again.');
          return;
        }

        // Additional check - wait for Card Element to be ready
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          console.error('Card Element not found');
          setErrorMessage('Payment form not ready. Please refresh the page.');
          return;
        }
        
        setIsLoading(true);
        setErrorMessage(undefined);
        
        try {
          console.log('Confirming payment with return URL:', `${window.location.origin}/order/${orderId}/stripe-payment-success`);
          
          // Add timeout to prevent hanging
          const confirmationPromise = stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
            }
          });
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Payment confirmation timeout')), 30000); // 30 second timeout
          });
          
          const confirmationResult = await Promise.race([confirmationPromise, timeoutPromise]);
          
          console.log('Payment confirmation completed. Result:', confirmationResult);
          
          if (confirmationResult.error) {
            console.error('Payment error details:', {
              type: confirmationResult.error.type,
              code: confirmationResult.error.code,
              message: confirmationResult.error.message,
              decline_code: confirmationResult.error.decline_code
            });
            
            if (confirmationResult.error.type === 'card_error' || confirmationResult.error.type === 'validation_error') {
              setErrorMessage(confirmationResult.error.message || 'Payment failed');
            } else {
              setErrorMessage('An unexpected error occurred. Please try again.');
            }
          } else {
            console.log('Payment successful! Should redirect now...');
          }
          // If no error, the user will be redirected to the return_url
        } catch (err) {
          console.error('Payment confirmation exception:', err);
          console.error('Error details:', {
            name: (err as Error).name,
            message: (err as Error).message,
            stack: (err as Error).stack
          });
          setErrorMessage('Payment failed. Please try again.');
        } finally {
          console.log('=== PAYMENT SUBMISSION END ===');
          setIsLoading(false);
        }
      }, [stripe, elements, isStripeReady, orderId, clientSecret]);
  
      // return for StripeForm
      return (
        <div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
            <div style={{ fontSize: '24px', marginBottom: '20px', fontWeight: 'bold' }}>Stripe Checkout</div>
            {errorMessage && <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>{errorMessage}</div>}
          
          {/* Payment Element Container */}
          <div style={{ 
            border: '2px solid #ccc', 
            padding: '20px', 
            borderRadius: '8px', 
            backgroundColor: 'white',
            minHeight: '200px',
            margin: '20px 0'
          }}>
            <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
              Enter your payment details:
            </div>
            {!isStripeReady ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 2s linear infinite',
                    margin: '0 auto'
                  }}></div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>Loading payment form...</div>
                </div>
              </div>
            ) : (
              <div id="card-element-wrapper" style={{ 
                minHeight: '150px', 
                width: '100%',
                display: 'block',
                position: 'relative'
              }}>
                <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                  Debug: Stripe ready, rendering CardElement...
                </div>
                <ErrorBoundary>
                  <CardElement
                    onReady={() => {
                      console.log('CardElement onReady callback fired!');
                    }}
                    onChange={(event) => {
                      console.log('CardElement onChange:', event);
                      if (event.error) {
                        console.error('CardElement error:', event.error);
                      }
                    }}
                    onFocus={() => {
                      console.log('CardElement focused');
                    }}
                    onBlur={() => {
                      console.log('CardElement blurred');
                    }}
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </ErrorBoundary>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <LinkAuthenticationElement />
          </div>
          <button
            type='submit'
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: '16px',
              backgroundColor: isLoading || !isStripeReady ? '#ccc' : '#007cba',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading || !isStripeReady ? 'not-allowed' : 'pointer',
              marginTop: '20px'
            }}
            disabled={!isStripeReady || stripe == null || elements == null || isLoading}
          >
            {isLoading
              ? 'Purchasing...'
              : `Purchase - ${formatCurrency(priceInCents / 100)}`}
          </button>
          </form>
        </div>
      );
    };
  
    // Return for StripePayment
    return (
      <Elements
        key="stripe-elements" // Static key to prevent re-initialization
        options={elementsOptions}
        stripe={stripePromise}
      >
        <StripeForm />
      </Elements>
    );
  });
  
  export default StripePayment;
