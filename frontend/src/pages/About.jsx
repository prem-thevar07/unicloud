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
              Users often rely on multiple cloud platforms such as Google Drive,
              Google Photos, OneDrive, and Dropbox. Each platform operates
              independently, forcing users to switch between interfaces and
              manage files separately.
            </p>
            <p>
              This fragmentation makes organization difficult and increases
              time spent searching for content.
            </p>
          </div>

          <div className="about-card">
            <h3>The Approach</h3>
            <p>
              {SITE_NAME} connects to existing cloud services instead of
              replacing them. It aggregates content from connected accounts and
              presents it in a unified dashboard.
            </p>
            <p>
              Files remain on their original platforms, ensuring no duplication
              or unnecessary data movement.
            </p>
          </div>

          <div className="about-card">
            <h3>Data Handling</h3>
            <p>
              Cloud services are connected using OAuth-based authentication.
              User credentials are never stored within the platform.
            </p>
            <p>
              Users have full control over connected services and can disconnect
              them at any time.
            </p>
          </div>
        </section>

        {/* CURRENT SCOPE */}
        <section className="about-highlight">
          <h2>Current Scope</h2>
          <p>
            The current version of {SITE_NAME} focuses on authentication,
            secure cloud connections, and unified browsing of files and photos.
            The platform is intentionally minimal to ensure reliability and
            clarity.
          </p>
        </section>

        {/* FUTURE DIRECTION */}
        <section className="about-future">
          <h2>Future Direction</h2>
          <div className="future-card">
            <p>
              Planned enhancements include improved search capabilities, file
              previews, intelligent categorization, and cross-cloud operations.
              These features will be introduced incrementally while maintaining
              strict privacy and data ownership principles.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default About;
