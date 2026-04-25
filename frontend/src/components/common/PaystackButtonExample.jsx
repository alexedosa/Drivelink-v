/**
 * Example: Using PaystackButton in a Purchase Component
 * 
 * This file demonstrates how to integrate the PaystackButton component
 * into your React application for handling purchases.
 */

import React, { useState } from 'react';
import PaystackButton from '../common/PaystackButton';

const CheckoutExample = ({ purchase }) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    setPaymentStatus('success');
    setErrorMessage(null);
    
    // Redirect or show success message
    // Example: redirect to order confirmation page
    // navigate('/order-confirmation', { state: { transactionId: paymentData.transactionId } });
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentStatus('error');
    setErrorMessage(error.message);
  };

  // Get Paystack public key from environment or props
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  return (
    <div className="checkout-container">
      <h1>Complete Your Purchase</h1>

      {/* Display purchase details */}
      <div className="purchase-details">
        <h2>{purchase.car.name}</h2>
        <p>Quantity: {purchase.quantity}</p>
        <p>Price per unit: ₦{purchase.unit_price.toLocaleString()}</p>
        <h3>Total: ₦{purchase.total_amount.toLocaleString()}</h3>
      </div>

      {/* Payment status messages */}
      {paymentStatus === 'success' && (
        <div className="success-message">
          Payment successful! Your order has been confirmed.
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      {/* Paystack payment button */}
      {paymentStatus !== 'success' && (
        <PaystackButton
          amount={Number(purchase.total_amount)}
          transactionType="purchase"
          purchaseId={purchase.id}
          email={purchase.user.email}
          fullName={`${purchase.user.first_name} ${purchase.user.last_name}`}
          phone={purchase.user.phone}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          buttonText="Complete Payment"
          buttonClassName="btn-primary"
          paystackPublicKey={paystackPublicKey}
        />
      )}
    </div>
  );
};

export default CheckoutExample;
