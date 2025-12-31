import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  TAGLINE,
  DESCRIPTION,
  SITE_NAME
} from "../config/siteConfig";
import { Link, useNavigate } from "react-router-dom";
import "../styles/landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handlePrimaryAction = () => {
    navigate(isLoggedIn ? "/dashboard" : "/auth");
  };

  return (
    <>
      <Header />

      <main className="landing-main">
        {/* HERO */}
        <section className="hero hero-centered">
          <div className="hero-text">
            <span className="hero-badge">Unified Cloud Platform</span>
            <h1>{TAGLINE}</h1>
            <p>{DESCRIPTION}</p>

            <div className="hero-actions">
              <button className="btn-primary" onClick={handlePrimaryAction}>
                {isLoggedIn ? "Open dashboard" : "Get started"}
              </button>

              
            </div>
          </div>
        </section>

        {/* VALUE STATEMENT */}
        <section className="value-section">
          <h2>One workspace. All your clouds.</h2>
          <p>
            {SITE_NAME} brings Google Drive, Google Photos, OneDrive, and Dropbox
            into a single intelligent dashboard — so you can search, manage,
            and organize everything without switching platforms.
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section className="workflow-section">
          <div className="workflow-step">
           
            <h3>Connect</h3>
            <p>Securely link your cloud accounts using OAuth.</p>
          </div>

          <div className="workflow-step">
            
            <h3>Unify</h3>
            <p>View files and photos together in one dashboard.</p>
          </div>

          <div className="workflow-step">
           
            <h3>Control</h3>
            <p>Search, filter, and manage content effortlessly.</p>
          </div>
        </section>

        
      </main>

      <Footer />
    </>
  );
};

export default Landing;
