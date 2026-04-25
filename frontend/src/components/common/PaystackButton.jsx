import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * PaystackButton Component
 * 
 * A reusable component to handle Paystack payment initialization and popup.
 * 
 * Props:
 * - amount: Payment amount in Naira
 * - transactionType: 'purchase' or 'rental'
 * - purchaseId: ID of purchase (required if transactionType is 'purchase')
 * - rentalId: ID of rental (required if transactionType is 'rental')
 * - email: Customer email
 * - fullName: Customer full name
 * - phone: Customer phone number
 * - onSuccess: Callback function called when payment is successful
 * - onError: Callback function called when payment fails
 * - buttonText: Custom button text
 * - buttonClassName: Custom button className
 * - paystackPublicKey: Paystack public key (from env)
 * - apiBaseUrl: API base URL (from env)
 */
const PaystackButton = ({
  amount,
  transactionType,
  purchaseId,
  rentalId,
  email,
  fullName,
  phone,
  onSuccess,
  onError,
  buttonText = 'Pay Now',
  buttonClassName = '',
  paystackPublicKey,
  apiBaseUrl = 'http://localhost:8000/api',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Validate input props
   */
  const validateInputs = useCallback(() => {
    const errors = [];

    if (!amount || amount <= 0) errors.push('Valid amount required');
    if (!transactionType) errors.push('Transaction type required');
    if (!email) errors.push('Email required');
    if (!fullName) errors.push('Full name required');
    if (!phone) errors.push('Phone required');
    if (!paystackPublicKey) errors.push('Paystack public key not configured');

    if (transactionType === 'purchase' && !purchaseId) {
      errors.push('Purchase ID required for purchase transactions');
    }
    if (transactionType === 'rental' && !rentalId) {
      errors.push('Rental ID required for rental transactions');
    }

    return errors;
  }, [amount, transactionType, purchaseId, rentalId, email, fullName, phone, paystackPublicKey]);

  /**
   * Initialize payment with backend
   */
  const initializePayment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      const validationErrors = validateInputs();
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        setError(errorMessage);
        if (onError) onError(new Error(errorMessage));
        setLoading(false);
        return;
      }

      // Get auth token from localStorage
      const token = localStorage.getItem('access_token');
      if (!token) {
        const errorMsg = 'Not authenticated. Please login first.';
        setError(errorMsg);
        if (onError) onError(new Error(errorMsg));
        setLoading(false);
        return;
      }

      // Call backend to initialize payment
      const payloadData = {
        amount,
        transaction_type: transactionType,
        email,
        full_name: fullName,
        phone,
      };

      if (transactionType === 'purchase') {
        payloadData.purchase_id = purchaseId;
      } else if (transactionType === 'rental') {
        payloadData.rental_id = rentalId;
      }

      const response = await fetch(`${apiBaseUrl}/payments/initialize/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payloadData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        setError(errorMsg);
        if (onError) onError(new Error(errorMsg));
        setLoading(false);
        return;
      }

      const paymentData = await response.json();

      // Show Paystack popup
      showPaystackPopup(paymentData);
    } catch (err) {
      const errorMsg = `Failed to initialize payment: ${err.message}`;
      setError(errorMsg);
      if (onError) onError(err);
      setLoading(false);
    }
  }, [
    amount,
    transactionType,
    purchaseId,
    rentalId,
    email,
    fullName,
    phone,
    validateInputs,
    onError,
    paystackPublicKey,
    apiBaseUrl,
  ]);

  /**
   * Display Paystack inline popup
   */
  const showPaystackPopup = useCallback(
    (paymentData) => {
      if (!window.PaystackPop) {
        setError('Paystack library not loaded');
        setLoading(false);
        return;
      }

      const popup = window.PaystackPop.setup({
        key: paystackPublicKey,
        email,
        amount: Math.round(paymentData.amount * 100), // Convert to kobo
        ref: paymentData.reference, // Use backend reference
        accessCode: paymentData.access_code,
        onClose: () => {
          console.log('Payment window closed');
          setLoading(false);
        },
        onSuccess: (response) => {
          handlePaymentSuccess(paymentData, response);
        },
      });

      popup.openIframe();
    },
    [paystackPublicKey, email]
  );

  /**
   * Handle successful payment
   */
  const handlePaymentSuccess = useCallback(
    async (paymentData, paystackResponse) => {
      try {
        setLoading(true);

        // Get auth token
        const token = localStorage.getItem('access_token');

        // Verify payment with backend
        const verifyResponse = await fetch(`${apiBaseUrl}/payments/callback/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            reference: paymentData.reference,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok || !verifyData.status) {
          const errorMsg = verifyData.message || 'Payment verification failed';
          setError(errorMsg);
          if (onError) onError(new Error(errorMsg));
        } else {
          setError(null);
          if (onSuccess) {
            onSuccess({
              transactionId: paymentData.transaction_id,
              reference: paymentData.reference,
              amount: paymentData.amount,
              status: paymentData.status,
            });
          }
        }
      } catch (err) {
        const errorMsg = `Payment verification error: ${err.message}`;
        setError(errorMsg);
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
    },
    [apiBaseUrl, onSuccess, onError]
  );

  /**
   * Handle button click
   */
  const handleClick = () => {
    initializePayment();
  };

  return (
    <div className={`paystack-button-container ${error ? 'error' : ''}`}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`paystack-button ${buttonClassName} ${loading ? 'loading' : ''}`}
        type="button"
      >
        {loading ? 'Processing...' : buttonText}
      </button>

      {error && (
        <div className="paystack-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

PaystackButton.propTypes = {
  amount: PropTypes.number.isRequired,
  transactionType: PropTypes.oneOf(['purchase', 'rental']).isRequired,
  purchaseId: PropTypes.number,
  rentalId: PropTypes.number,
  email: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  phone: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  buttonText: PropTypes.string,
  buttonClassName: PropTypes.string,
  paystackPublicKey: PropTypes.string.isRequired,
  apiBaseUrl: PropTypes.string,
};

PaystackButton.defaultProps = {
  purchaseId: null,
  rentalId: null,
  onSuccess: null,
  onError: null,
  buttonText: 'Pay Now',
  buttonClassName: '',
  apiBaseUrl: 'http://localhost:8000/api',
};

export default PaystackButton;
