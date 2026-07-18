export const required = (value) => value ? undefined : 'This field is required';

export const minLength = (min) => (value) =>
  value && value.length < min ? `Must be ${min} characters or more` : undefined;

export const isEmail = (value) => 
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email address'
    : undefined;

export const isPhone = (value) => 
  value && !/^\+?[1-9]\d{1,14}$/i.test(value)
    ? 'Invalid phone number format'
    : undefined;
