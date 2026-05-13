import { useState, useEffect, useCallback, useRef } from 'react';
import { paymentMethodService } from '../../services/billing/paymentMethod.service';
import { getStripe } from '../../services/billing/client';

export const useStripeElements = (options = {}) => {
    const [stripe, setStripe] = useState(null);
    const [elements, setElements] = useState(null);
    const [cardElement, setCardElement] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const mountedRef = useRef(true);
    useEffect(() => {
        const initStripe = async () => {
            try {
                const stripeInstance = await getStripe();
                if (!stripeInstance) {
                    throw new Error('Failed to initialize Stripe');
                }
                
                if (mountedRef.current) {
                    setStripe(stripeInstance);
                }
            } catch (err) {
                if (mountedRef.current) {
                    setError(err.message);
                }
            } finally {
                if (mountedRef.current) {
                    setIsLoading(false);
                }
            }
        };
        initStripe();
        return () => {
            mountedRef.current = false;
            if (cardElement) {
                cardElement.destroy();
            }
        };
    }, []);
    const initializeElements = useCallback(async () => {
        if (!stripe) return null;
        try {
            setIsLoading(true);
            const response = await paymentMethodService.createSetupIntent();
            const secret = response.data?.client_secret;
            if (!secret) {
                throw new Error('Failed to create setup intent');
            }
            setClientSecret(secret);
            const { elements: stripeElements, cardElement: card } = 
                await paymentMethodService.initStripeElements(options);
            if (mountedRef.current) {
                setElements(stripeElements);
                setCardElement(card);
            }
            return { elements: stripeElements, cardElement: card, clientSecret: secret };
        } catch (err) {
            if (mountedRef.current) {
                setError(err.message);
            }
            return null;
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [stripe, options]);
    const confirmSetup = useCallback(async (setAsDefault = true) => {
        if (!stripe || !cardElement || !clientSecret) {
            throw new Error('Stripe not initialized');
        }
        try {
            const setupIntent = await paymentMethodService.confirmSetup(
                stripe,
                cardElement,
                clientSecret
            );
            if (!setupIntent?.payment_method) {
                throw new Error('Setup confirmation failed');
            }
            const response = await paymentMethodService.addPaymentMethod(
                setupIntent.payment_method,
                setAsDefault
            );
            return response.data;
        } catch (err) {
            throw new Error(err.message || 'Failed to confirm setup');
        }
    }, [stripe, cardElement, clientSecret]);
    const cleanup = useCallback(() => {
        if (cardElement) {
            cardElement.destroy();
        }
        setCardElement(null);
        setElements(null);
        setClientSecret(null);
    }, [cardElement]);
    return {
        stripe,
        elements,
        cardElement,
        clientSecret,
        isLoading,
        error,
        initializeElements,
        confirmSetup,
        cleanup,
    };
};