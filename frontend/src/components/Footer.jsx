import { SITE_NAME } from "../config/siteConfig";
import "../styles/landing.css";

const Footer = () => {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
    </footer>
  );
};

export default Footer;
