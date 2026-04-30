import Header from "../components/Header";
import Footer from "../components/Footer";
import { SITE_NAME } from "../config/siteConfig";
import "../styles/about.css";

const About = () => {
  return (
    <>
      <Header />

      <main className="about-main">
        {/* HERO */}
        <section className="about-hero">
          <h1>About {SITE_NAME}</h1>
          <p>
            {SITE_NAME} is a unified cloud management platform built to simplify
            working with multiple cloud storage services through a single,
            consistent interface.
          </p>
        </section>

        {/* CORE CARDS */}
        <section className="about-grid">
          <div className="about-card">
            <h3>The Problem</h3>
            <p>
              Users often rely on multiple Google Drive accounts for personal, work, and school. 
              Each account operates independently, forcing users to constantly sign in and out, 
              switch tabs, and manage storage quotas separately.
            </p>
            <p>
              This fragmentation makes organizing files and finding old photos incredibly frustrating.
            </p>
          </div>

          <div className="about-card">
            <h3>The Approach</h3>
            <p>
              {SITE_NAME} connects to your existing Google Drive accounts instead of replacing them. 
              It aggregates all your files, documents, and media into a stunning unified dashboard.
            </p>
            <p>
              Features like <b>Smart Upload</b> take it a step further by automatically scanning 
              all your connected accounts to find the one with the most free space before uploading.
            </p>
          </div>

          <div className="about-card">
            <h3>Data Handling</h3>
            <p>
              Cloud services are securely connected using Google's official OAuth mechanism.
              We never store your passwords. Your login is safeguarded by OTP email verification.
            </p>
            <p>
              To ensure peak performance without hitting Google's rate limits, Unicloud utilizes 
              intelligent backend caching and disk-streaming algorithms for large file uploads.
            </p>
          </div>
        </section>

        {/* CURRENT SCOPE */}
        <section className="about-highlight">
          <h2>Current Capabilities</h2>
          <p>
            The current version of {SITE_NAME} boasts a fully-featured Unified File Explorer, 
            an infinite-scrolling Photos/Videos gallery equipped with caching and skeleton loaders, 
            and a Smart Upload Hub capable of streaming files up to 5GB directly into the optimal cloud account.
          </p>
        </section>

        {/* FUTURE DIRECTION */}
        <section className="about-future">
          <h2>Future Direction</h2>
          <div className="future-card">
            <p>
              Planned enhancements include cross-account file transfers, intelligent AI-driven categorization, 
              and integration with additional cloud providers like OneDrive and Dropbox. These features will 
              build upon our highly scalable Node.js architecture.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default About;
