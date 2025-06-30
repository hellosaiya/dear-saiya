import { Outlet, Link } from "react-router-dom";
import '../styles/Layout.css';

export default function Layout() {
  return (
    <div className="layout-wrapper">
      <header className="header">
        <Link to="/" className="logo-link">
          Dear Saiya💖
        </Link>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>Made with 💜 by Sai & Sia</p>
      </footer>
    </div>
  );
}
