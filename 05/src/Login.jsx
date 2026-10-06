import { useState } from 'react';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ onLogin, goToRegister, notice }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Enter your email address.';
    else if (!emailPattern.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Enter your password.';

    setErrors(nextErrors);
    setMessage('');
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await onLogin(form);
    setIsSubmitting(false);
    if (result) setMessage(result);
  };

  return (
    <section className="auth-card">
      <p className="form-eyebrow">MEMBER SIGN IN <span> / </span> 01</p>
      <h2>Come on in.</h2>
      <p className="card-description">Use the email and password you chose when you joined.</p>

      {notice && <p className="form-notice" role="status">{notice}</p>}
      {message && <p className="form-message form-message-error" role="alert">{message}</p>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="login-email">Your email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            required
          />
          {errors.email && <span className="field-error" id="login-email-error">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="login-password">Your password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            required
          />
          {errors.password && <span className="field-error" id="login-password-error">{errors.password}</span>}
        </div>

        <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Opening your space…' : 'Continue to Morrow'} <span aria-hidden="true">↗</span>
        </button>
      </form>

      <p className="auth-switch">First time here? <button type="button" onClick={goToRegister}>Make an account <span aria-hidden="true">→</span></button></p>
      <p className="demo-note">A practice app. Please don’t use a password you use elsewhere.</p>
    </section>
  );
}
