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
            {SITE_NAME} acts as a unified hub for all your Google Drive accounts. 
            Connect multiple cloud identities into a single, intelligent dashboard. 
            Search files, browse photos in a stunning gallery, and seamlessly upload 
            massive 5GB files using our smart storage-balancing algorithm.
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section className="workflow-section">
          <div className="workflow-step">
            <div className="step-icon">🔗</div>
            <h3>Connect Securely</h3>
            <p>Link multiple Google Drive accounts instantly using industry-standard OAuth authentication.</p>
          </div>

          <div className="workflow-step">
            <div className="step-icon">🖼️</div>
            <h3>Infinite Gallery</h3>
            <p>Browse all your photos and videos from every account in one fast, cached, infinite-scrolling grid.</p>
          </div>

          <div className="workflow-step">
            <div className="step-icon">✨</div>
            <h3>Smart Upload</h3>
            <p>Drop a file up to 5GB. Unicloud instantly scans your accounts and routes it to the one with the most free space.</p>
          </div>
        </section>

        
      </main>

      <Footer />
    </>
  );
};

export default Landing;
