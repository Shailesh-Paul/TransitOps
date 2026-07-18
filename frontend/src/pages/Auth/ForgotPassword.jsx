import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { BUTTON_VARIANTS, INPUT_STYLES } from '../../constants/theme';

export default function ForgotPassword() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-semantic-text-primary">Reset Password</h3>
        <p className="mt-2 text-sm text-semantic-text-secondary">Enter your email to receive reset instructions</p>
      </div>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-semantic-text-primary mb-1">Email</label>
          <input type="email" className={INPUT_STYLES.base} placeholder="name@company.com" />
        </div>
        <button type="submit" className={`w-full ${BUTTON_VARIANTS.primary}`}>
          Send Reset Link
        </button>
      </form>
      <div className="text-center">
        <Link to={ROUTES.LOGIN} className="text-sm font-medium text-semantic-primary hover:text-opacity-80">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
