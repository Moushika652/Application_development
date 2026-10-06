import { useState } from 'react';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Registration({ onRegister, goToLogin }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
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
    if (!form.username.trim()) nextErrors.username = 'Choose a username.';
    else if (form.username.trim().length > 32) nextErrors.username = 'Use 32 characters or fewer.';
    if (!form.email.trim()) nextErrors.email = 'Enter your email address.';
    else if (!emailPattern.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Create a password.';
    else if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (!form.confirm) nextErrors.confirm = 'Enter your password again.';
    else if (form.confirm !== form.password) nextErrors.confirm = 'These passwords do not match.';

    setErrors(nextErrors);
    setMessage('');
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await onRegister({
      username: form.username,
      email: form.email,
      password: form.password,
    });
    setIsSubmitting(false);
    if (result) {
      setMessage(result);
      return;
    }
    setForm({ username: '', email: '', password: '', confirm: '' });
  };

  const passwordScore = [
    form.password.length >= 8,
    /[A-Z]/.test(form.password) && /[a-z]/.test(form.password),
    /\d/.test(form.password),
    /[^A-Za-z0-9]/.test(form.password),
  ].filter(Boolean).length;
  const strengthLabel = passwordScore < 2 ? 'Add length and variety' : passwordScore < 4 ? 'Getting stronger' : 'Strong password';

  return (
    <section className="auth-card registration-card">
      <p className="form-eyebrow">NEW MEMBER <span> / </span> 02</p>
      <h2>Let’s make this yours.</h2>
      <p className="card-description">Set up your details to create a little space of your own.</p>

      {message && <p className="form-message form-message-error" role="alert">{message}</p>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="register-username">A name to go by</label>
          <input
            id="register-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Choose your display name"
            maxLength={32}
            value={form.username}
            onChange={handleChange}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'register-username-error' : undefined}
            required
          />
          {errors.username && <span className="field-error" id="register-username-error">{errors.username}</span>}
        </div>

        <div className="field">
          <label htmlFor="register-email">Your email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            maxLength={254}
            value={form.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            required
          />
          {errors.email && <span className="field-error" id="register-email-error">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="register-password">Create a password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Make it 8 characters or longer"
            value={form.password}
            onChange={handleChange}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'register-password-error' : 'password-strength'}
            required
          />
          {errors.password
            ? <span className="field-error" id="register-password-error">{errors.password}</span>
            : form.password && <span className="strength-hint" id="password-strength">{strengthLabel}</span>}
        </div>

        <div className="field">
          <label htmlFor="register-confirm">One more time</label>
          <input
            id="register-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={form.confirm}
            onChange={handleChange}
            aria-invalid={Boolean(errors.confirm)}
            aria-describedby={errors.confirm ? 'register-confirm-error' : undefined}
            required
          />
          {errors.confirm && <span className="field-error" id="register-confirm-error">{errors.confirm}</span>}
        </div>

        <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Setting things up…' : 'Create my space'} <span aria-hidden="true">↗</span>
        </button>
      </form>

      <p className="auth-switch">Already part of Morrow? <button type="button" onClick={goToLogin}>Come back in <span aria-hidden="true">→</span></button></p>
      <p className="demo-note">Practice project · Your account details live in this browser.</p>
    </section>
  );
}
