import { useState } from 'react';
import Login from './Login.jsx';
import Registration from './Registration.jsx';
import { createUser, findUser, saveSession, clearSession } from './auth.js';

export default function App() {
  const [page, setPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [notice, setNotice] = useState('');

  const handleRegister = async (details) => {
    try {
      const user = await createUser(details);
      setNotice(`Account created for ${user.email}. You can now log in.`);
      setPage('login');
      return null;
    } catch (error) {
      return error.message;
    }
  };

  const handleLogin = async ({ email, password }) => {
    try {
      const user = await findUser(email, password);
      if (!user) return 'We could not find an account with those details.';

      saveSession(user.email);
      setCurrentUser(user);
      setNotice('');
      setPage('dashboard');
      return null;
    } catch (error) {
      return error.message;
    }
  };

  const handleLogout = () => {
    try {
      clearSession();
      setCurrentUser(null);
      setNotice('You have been signed out.');
      setPage('login');
    } catch (error) {
      setNotice(error.message);
    }
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" onClick={(event) => event.preventDefault()}>
          <span className="brand-icon" aria-hidden="true">m</span>
          <span>morrow<span className="brand-period">.</span></span>
        </a>
        <span className="header-note"><span className="header-indicator" /> PERSONAL SPACE <span className="header-divider">/</span> MEMBER ACCESS</span>
      </header>

      <section className={`auth-layout auth-layout-${page}`} aria-live="polite">
        <aside className="welcome-panel">
          <div className="panel-topline"><span>THE MORROW EDIT</span><span>NO. 05</span></div>
          <div className="panel-copy">
            <p className="panel-kicker">{page === 'register' ? 'A GOOD PLACE TO BEGIN' : page === 'dashboard' ? 'YOUR SPACE, YOUR PACE' : 'A MOMENT FOR YOURSELF'}</p>
            <h1>{page === 'register' ? <>Start with<br />a little space.</> : page === 'dashboard' ? <>Welcome to<br />your corner.</> : <>A quieter place<br />to <span>begin again.</span></>}</h1>
            <p>{page === 'register'
              ? 'Make a home for your account. A few details are all it takes to get started.'
              : page === 'dashboard'
                ? 'Your account is ready whenever you are. Take a breath and settle in.'
                : 'Sign in, get comfortable, and pick up right where you left off.'}</p>
          </div>
          <div className="still-life" aria-hidden="true">
            <div className="sun-disc" />
            <div className="orbit orbit-outer" />
            <div className="orbit orbit-inner" />
            <div className="leaf leaf-one" />
            <div className="leaf leaf-two" />
            <div className="leaf leaf-three" />
            <div className="book book-back" />
            <div className="book book-front"><span>make<br />some room</span></div>
          </div>
          <div className="panel-caption"><span>01 — TAKE IT ONE STEP AT A TIME</span><span>✳</span></div>
        </aside>

        <div className="form-area">
          {page === 'login' && (
            <Login
              onLogin={handleLogin}
              goToRegister={() => { setNotice(''); setPage('register'); }}
              notice={notice}
            />
          )}
          {page === 'register' && (
            <Registration
              onRegister={handleRegister}
              goToLogin={() => { setNotice(''); setPage('login'); }}
            />
          )}
          {page === 'dashboard' && currentUser && (
            <section className="auth-card dashboard-card">
              <div className="dashboard-heading">
                <div className="avatar" aria-hidden="true">
                  {currentUser.username.slice(0, 1).toUpperCase()}
                </div>
                <div><p className="card-kicker">YOUR ACCOUNT</p><h2>Your details, all in one place.</h2></div>
              </div>
              <p className="card-description">You’re signed in as <strong>{currentUser.username}</strong>. Here’s the information attached to your account.</p>
              <dl className="account-details">
                <div><dt>Username</dt><dd>{currentUser.username}</dd></div>
                <div><dt>Email address</dt><dd>{currentUser.email}</dd></div>
                <div><dt>Account status</dt><dd><span className="account-status">Ready to go</span></dd></div>
              </dl>
              <button className="button button-outline button-full" type="button" onClick={handleLogout}>
                Sign out of Morrow <span aria-hidden="true">↗</span>
              </button>
              {notice && <p className="form-notice" role="status">{notice}</p>}
            </section>
          )}
        </div>
      </section>

      <footer className="app-footer">
        <span>© MORROW, 2026</span>
        <span>A small React demo <i>·</i> Your details stay in this browser</span>
        <span className="footer-mark">MADE FOR A FRESH START <b>↗</b></span>
      </footer>
    </main>
  );
}
