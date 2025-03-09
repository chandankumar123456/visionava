import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Main.css";
import { FaInstagram } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaBars,FaRegTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";


const navigate = useNavigate
// Importing images (you'll need to add these to your assets folder)
import logoImage from "../../assets/logo.jpg";
import heroImage from "../../assets/hero.jpg"; 
import helpImage from "../../assets/help.jpg";
import personal from '../../assets/personalfeedback.webp'
import multi from '../../assets/multimodal.webp'
const Main = () => {
  const [sticky, setSticky] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);

  // For parallax effect
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.6]);

  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setShowWarning(true);
    }

    // Hide the warning after 5 seconds
    if (showWarning) {
      setTimeout(() => {
        setShowWarning(false);
      }, 5000);
    }

    const handleScroll = () => {
      window.scrollY > 50 ? setSticky(true) : setSticky(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showWarning]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const scrollToSection = (ref) => {
    closeMenu();
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleTryNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to access the chatbot.");
      navigate("/auth"); // Redirect to login page
    } else {
      navigate("/chatbot-page"); // Proceed to chatbot page
    }
  };

  return (
    <div className="main-container">
      {/* Warning Message */}
      

      {/* Navbar */}
      <header className={`header ${sticky ? "sticky" : ""}`}>
        <div className="navbar-container">
          <div className="logo">
            <img src={logoImage} alt="Empathy AI Logo" />
            <span className="main-heading">Empathy AI</span>
          </div>

          <div className="menu-icon" onClick={toggleMenu}>
            {menuOpen ? <FaRegTimesCircle /> : <FaBars/>}
          </div>

          <nav className={`navbar ${menuOpen ? "active" : ""}`}>
            <ul>
              <li onClick={() => scrollToSection(heroRef)}>Home</li>
              <li onClick={() => scrollToSection(aboutRef)}>About</li>
              <li onClick={() => scrollToSection(featuresRef)}>Features</li>
              <li>
                <button className="login-button">
                  <Link to="/auth" onClick={closeMenu}>Login</Link>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section with Parallax */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-overlay"></div>
        <motion.div 
          className="hero-content"
          style={{ y: heroY, opacity }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Empathy AI</h1>
          <p>
            Understand your emotions like <br />
            <span className="second-text">never before</span>
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/chatbot-page">Try Now</Link>
          </motion.button>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="about-section" ref={aboutRef}>
        <div className="section-container">
          <motion.div 
            className="left-about-section"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="about-image-container">
              <img src={heroImage} alt="AI emotional analysis" />
            </div>
          </motion.div>
          
          <motion.div 
            className="right-about-section"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2>How We Help</h2>
            <p>
              We use advanced artificial intelligence to help users understand their emotions 
              through multiple forms of communication, providing real-time insights and 
              personalized feedback.
            </p>
            <h3>The features we provide</h3>
            <ul className="about-ul">
              <motion.li whileHover={{ x: 10 }}>Text, Voice, and Video Analysis</motion.li>
              <motion.li whileHover={{ x: 10 }}>Real-time emotional feedback</motion.li>
              <motion.li whileHover={{ x: 10 }}>Personalized wellness insights</motion.li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" ref={featuresRef}>
        <div className="section-container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Choose Us?
          </motion.h2>
          
          <div className="features-grid">
            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="feature-icon">
                <img src={logoImage} alt="Emotion Detection" />
              </div>
              <h3>Emotion Detection</h3>
              <p>Detect emotions from text, voice, and facial expressions to provide comprehensive feedback.</p>
            </motion.div>

            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="feature-icon">
                <img src={multi} alt="Communication Analysis" />
              </div>
              <h3>Multi-mode Analysis</h3>
              <p>We analyze verbal and non-verbal cues across different communication channels to give you complete insights.</p>
            </motion.div>

            <motion.div 
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="feature-icon">
                <img src={personal} alt="Personalized Feedback" />
              </div>
              <h3>Personalized Feedback</h3>
              <p>Get tailored recommendations based on your unique communication style and improvement areas.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" ref={howItWorksRef}>
        <div className="section-container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          
          <div className="steps-container">
            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Sign Up</h3>
                <p>Create an account and log in to access all features</p>
              </div>
            </motion.div>

            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Choose Your Mode</h3>
                <p>Select your preferred chat mode: Text, Voice, or Video</p>
              </div>
            </motion.div>

            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Get Insights</h3>
                <p>Receive personalized feedback and emotional insights</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-logo">
              <img src={logoImage} alt="Empathy AI Logo" />
              <span>Empathy AI</span>
            </div>
            
            <div className="footer-links">
              <div className="footer-links-column">
                <h3>Company</h3>
                <a href="#">About Us</a>
                <a href="#">Our Team</a>
                <a href="#">Careers</a>
              </div>
              
              <div className="footer-links-column">
                <h3>Resources</h3>
                <a href="#">Blog</a>
                <a href="#">Support</a>
                <a href="#">Documentation</a>
              </div>
              
              <div className="footer-links-column">
                <h3>Legal</h3>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
              
              <div className="footer-links-column">
                <h3>Connect</h3>
                <div className="social-media-icons">
                  <a className="social" href="https://www.instagram.com" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                  <a className="social" href="https://www.x.com" aria-label="Twitter">
                    <FaSquareXTwitter />
                  </a>
                  <a className="social" href="https://www.linkedin.com" aria-label="LinkedIn">
                    <FaLinkedin />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="copyright">&copy; {new Date().getFullYear()} Empathy AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Main;