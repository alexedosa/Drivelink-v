/**
 * Example: Using PaystackButton in a Rental Component
 * 
 * This file demonstrates how to integrate the PaystackButton component
 * into your React application for handling rental payments.
 */

import React, { useState } from 'react';
import PaystackButton from '../common/PaystackButton';

const RentalCheckoutExample = ({ rental, user }) => {
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const handlePaymentSuccess = (paymentData) => {
    console.log('Rental payment successful:', paymentData);
    setPaymentCompleted(true);
    setTransactionId(paymentData.transactionId);
    setPaymentError(null);

    // Show success message
    // In production, you might redirect to a confirmation page
    // Example: navigate(`/rental/${rental.id}/confirmation`, { 
    //   state: { transactionId: paymentData.transactionId }
    // });
  };

  const handlePaymentError = (error) => {
    console.error('Rental payment error:', error);
    setPaymentCompleted(false);
    setPaymentError(error.message);
  };

  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  return (
    <div className="rental-checkout-container">
      <div className="rental-header">
        <h1>Confirm Your Rental</h1>
        <p>Complete the payment to finalize your booking</p>
      </div>

      {/* Rental details section */}
      <div className="rental-details-card">
        <h2>{rental.car.name}</h2>
        
        <div className="rental-info-grid">
          <div className="info-item">
            <label>Car Model</label>
            <p>{rental.car.model}</p>
          </div>
          <div className="info-item">
            <label>Rental Period</label>
            <p>{rental.start_date} to {rental.end_date}</p>
          </div>
          <div className="info-item">
            <label>Number of Days</label>
            <p>{rental.total_days} days</p>
          </div>
          <div className="info-item">
            <label>Daily Rate</label>
            <p>₦{(rental.total_amount / rental.total_days).toLocaleString()}</p>
          </div>
        </div>

        <div className="rental-total">
          <h3>Total Amount Due</h3>
          <div className="amount-display">
            ₦{rental.total_amount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Customer information section */}
      <div className="customer-info-card">
        <h3>Customer Information</h3>
        <div className="info-display">
          <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
        </div>
      </div>

      {/* Payment status messages */}
      {paymentCompleted && (
        <div className="success-message alert alert-success">
          <h4>✓ Payment Successful!</h4>
          <p>Your rental has been confirmed.</p>
          <p>Transaction ID: {transactionId}</p>
          <p>A confirmation email has been sent to {user.email}</p>
          <div className="next-steps">
            <p>Next steps:</p>
            <ul>
              <li>Check your email for rental details</li>
              <li>Prepare your ID and payment method for pickup</li>
              <li>Arrive 15 minutes early for the pickup date</li>
              <li>View your active rentals in your dashboard</li>
            </ul>
          </div>
        </div>
      )}

      {paymentError && (
        <div className="error-message alert alert-danger">
          <h4>✗ Payment Failed</h4>
          <p>{paymentError}</p>
          <p>Please try again or contact support if the problem persists.</p>
        </div>
      )}

      {/* Payment button section */}
      {!paymentCompleted && (
        <div className="payment-section">
          <div className="payment-terms">
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">
              I agree to the rental terms and conditions
            </label>
          </div>

          <PaystackButton
            amount={Number(rental.total_amount)}
            transactionType="rental"
            rentalId={rental.id}
            email={user.email}
            fullName={`${user.first_name} ${user.last_name}`}
            phone={user.phone}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            buttonText={`Pay ₦${rental.total_amount.toLocaleString()} to Confirm Rental`}
            buttonClassName="btn-primary btn-lg btn-payment"
            paystackPublicKey={paystackPublicKey}
            apiBaseUrl={import.meta.env.VITE_API_BASE_URL}
          />

          <div className="payment-note">
            <p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              Your card will be charged ₦{rental.total_amount.toLocaleString()} 
              for this rental booking.
            </p>
            <p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              All transactions are secure and encrypted.
            </p>
          </div>
        </div>
      )}

      {/* Back to rentals button */}
      {paymentCompleted && (
        <div className="action-buttons">
          <a href="/rentals" className="btn btn-secondary">
            Back to Rentals
          </a>
          <a href="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </a>
        </div>
      )}
    </div>
  );
};

export default RentalCheckoutExample;
