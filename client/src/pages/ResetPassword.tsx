import ForgotPassword from './ForgotPassword';

/**
 * Same flow as /member/forgot-password (SMS OTP + new password).
 * Kept as a separate route for links/bookmarks to “reset password”.
 */
export default function ResetPassword() {
  return <ForgotPassword />;
}
