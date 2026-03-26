export default function FacebookLoginPage() {
  return (
    <>
    <div className="page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html, body, #root {
          margin: 0;
          min-height: 100%;
          width: 100%;
          font-family: Arial, Helvetica, sans-serif;
          background: #f2f3f5;
          color: #111;
        }

        body {
          margin: 0;
        }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
        }

        .left,
        .right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .left {
          border-right: 1px solid #d9d9d9;
          background: #f3f4f6;
        }

        .left-inner {
          width: 100%;
          max-width: 760px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .branding {
          flex: 1;
          min-width: 260px;
        }

        .logo-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #1877f2;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 52px;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 30px;
        }

        .headline {
          font-size: 76px;
          line-height: 0.95;
          font-weight: 800;
          letter-spacing: -2px;
          margin: 0;
        }

        .headline .accent {
          color: #1877f2;
        }

        .visual {
          flex: 1;
          min-width: 320px;
          display: flex;
          justify-content: center;
        }

        .visual-card {
          position: relative;
          width: 430px;
          height: 560px;
        }

        .main-photo {
          position: absolute;
          top: 20px;
          left: 110px;
          width: 260px;
          height: 470px;
          border-radius: 24px;
          object-fit: cover;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
        }

        .side-card {
          position: absolute;
          left: 0;
          top: 120px;
          width: 230px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          padding: 14px;
        }

        .side-card img {
          width: 100%;
          height: 170px;
          object-fit: cover;
          border-radius: 14px;
          display: block;
        }

        .side-lines {
          margin-top: 12px;
        }

        .side-lines div {
          height: 12px;
          border-radius: 999px;
          background: #e5e7eb;
          margin-bottom: 10px;
        }

        .side-lines div:first-child {
          width: 92%;
        }

        .side-lines div:last-child {
          width: 70%;
        }

        .avatar {
          position: absolute;
          left: 145px;
          bottom: 10px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 5px solid #1877f2;
          object-fit: cover;
          background: #fff;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .badge {
          position: absolute;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          padding: 8px 14px;
          font-size: 18px;
          font-weight: 600;
        }

        .badge.time {
          right: 8px;
          top: 74px;
          background: #7267f0;
          color: #fff;
          border-radius: 12px;
        }

        .badge.emoji {
          left: -10px;
          top: 58px;
          font-size: 54px;
          background: transparent;
          box-shadow: none;
          padding: 0;
        }

        .badge.heart {
          right: 18px;
          top: 375px;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #ff3b82;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
        }

        .dots {
          position: absolute;
          left: 230px;
          top: 442px;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 3px solid #fff;
          background: transparent;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .dot.active {
          width: 120px;
          border-radius: 999px;
        }

        .right {
          background: #f5f5f5;
        }

        .login-panel {
          width: 100%;
          max-width: 660px;
        }

        .login-panel h2 {
          margin: 0 0 28px;
          font-size: 24px;
          font-weight: 700;
        }

        .field {
          width: 100%;
          height: 72px;
          border-radius: 20px;
          border: 2px solid #d7dbe2;
          background: #fff;
          padding: 0 20px;
          font-size: 24px;
          outline: none;
          margin-bottom: 22px;
        }

        .field:focus {
          border-color: #1877f2;
        }

        .btn-primary,
        .btn-secondary {
          width: 100%;
          height: 70px;
          border-radius: 999px;
          font-size: 22px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .btn-primary {
          border: none;
          background: #1877f2;
          color: #fff;
          margin-top: 8px;
        }

        .btn-primary:hover {
          filter: brightness(0.96);
        }

        .forgot {
          text-align: center;
          margin: 30px 0 90px;
        }

        .forgot a {
          text-decoration: none;
          color: #111827;
          font-size: 20px;
          font-weight: 500;
        }

        .btn-secondary {
          background: transparent;
          color: #1877f2;
          border: 2px solid #1877f2;
        }

        .meta-brand {
          margin-top: 40px;
          text-align: center;
          color: #4b5563;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.2px;
        }

        @media (max-width: 1200px) {
          .page {
            grid-template-columns: 1fr;
          }

          .left {
            border-right: none;
            border-bottom: 1px solid #d9d9d9;
          }

          .left-inner {
            flex-direction: column;
          }

          .headline {
            font-size: 58px;
          }

          .login-panel {
            max-width: 760px;
          }
        }

        @media (max-width: 768px) {
          .left,
          .right {
            padding: 24px;
          }

          .headline {
            font-size: 46px;
          }

          .visual-card {
            transform: scale(0.9);
            transform-origin: center top;
          }

          .field,
          .btn-primary,
          .btn-secondary {
            height: 60px;
            font-size: 18px;
          }

          .forgot a {
            font-size: 17px;
          }
        }

        .footer {
  width: 100%;
  background: #f0f2f5;
  border-top: 1px solid #ddd;
  padding: 20px 40px;
}

.footer-inner {
  max-width: 1200px;
  margin: auto;
}

.footer-languages,
.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 18px;
  font-size: 14px;
  color: #606770;
  margin-bottom: 10px;
}

.footer-languages span,
.footer-links span {
  cursor: pointer;
}

.footer-languages span:hover,
.footer-links span:hover {
  text-decoration: underline;
}

.footer-languages .more {
  font-weight: 500;
}

.footer-copy {
  margin-top: 12px;
  font-size: 13px;
  color: #8a8d91;
}
      `}</style>

      <section className="left">
        <div className="left-inner">
          <div className="branding">
            <div className="logo-circle">f</div>
            <h1 className="headline">
              Explore
              <br />
              the
              <br />
              things
              <br />
              <span className="accent">you love</span>.
            </h1>
          </div>

          <div className="visual">
            <div className="visual-card">
              <img
                className="main-photo"
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80"
                alt="Main"
              />

              <div className="badge emoji">😆</div>
              <div className="badge time">🕒 16:45</div>
              <div className="badge heart">♥</div>

              <div className="side-card">
                <img
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80"
                  alt="DJ"
                />
                <div className="side-lines">
                  <div></div>
                  <div></div>
                </div>
              </div>

              <div className="dots">
                <div className="dot active"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>

              <img
                className="avatar"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
                alt="Avatar"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="right">
        <div className="login-panel">
          <h2>Log in to your account</h2>

          <input className="field" type="text" placeholder="Email address or mobile number" />
          <input className="field" type="password" placeholder="Password" />

          <button className="btn-primary">Log in</button>

          <div className="forgot">
            <a href="#">Forgotten password?</a>
          </div>

          <button className="btn-secondary">Create new account</button>

          <div className="meta-brand">Meta</div>
        </div>
      </section>

      
    </div>

    <footer className="footer">
  <div className="footer-inner">
    
    {/* Languages */}
    <div className="footer-languages">
      <span>English (UK)</span>
      <span>Tiếng Việt</span>
      <span>中文(台灣)</span>
      <span>한국어</span>
      <span>日本語</span>
      <span>Français (France)</span>
      <span>ภาษาไทย</span>
      <span className="more">More languages…</span>
    </div>

    {/* Links row 1 */}
    <div className="footer-links">
      <span>Sign up</span>
      <span>Log in</span>
      <span>Messenger</span>
      <span>Lite</span>
      <span>Video</span>
      <span>Pay</span>
      <span>Store</span>
      <span>Quest</span>
      <span>AI</span>
      <span>Instagram</span>
      <span>Threads</span>
      <span>Privacy Policy</span>
    </div>

    {/* Links row 2 */}
    <div className="footer-links">
      <span>Privacy Centre</span>
      <span>About</span>
      <span>Create ad</span>
      <span>Create Page</span>
      <span>Developers</span>
      <span>Careers</span>
      <span>Cookies</span>
      <span>AdChoices</span>
      <span>Terms</span>
      <span>Help</span>
      <span>Contact</span>
    </div>

    <div className="footer-copy">
      Meta © 2026
    </div>

  </div>
</footer>
</>
  );
}