import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { BUTTON_VARIANTS, INPUT_STYLES } from '../../constants/theme';

export default function ResetPassword() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-semantic-text-primary">Create New Password</h3>
        <p className="mt-2 text-sm text-semantic-text-secondary">Please enter your new secure password</p>
      </div>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-semantic-text-primary mb-1">New Password</label>
          <input type="password" className={INPUT_STYLES.base} placeholder="••••••••" />
        </div>
        <div>
          <label className="block text-sm font-medium text-semantic-text-primary mb-1">Confirm Password</label>
          <input type="password" className={INPUT_STYLES.base} placeholder="••••••••" />
        </div>
        <button type="submit" className={`w-full ${BUTTON_VARIANTS.primary}`}>
          Update Password
        </button>
      </form>
    </div>
  );
}
