import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import welcomeAnimation from "../assets/animations/welcome-animation.json";
import "../assets/LandingPage.css"

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [displayedName, setDisplayedName] = useState("");
  const [nameVisible, setNameVisible] = useState(false);

  const fullName = "Sharanya Ramchandra !";

  useEffect(() => {
    // Trigger animations on mount
    setTimeout(() => setIsVisible(true), 300);
    setTimeout(() => setTextVisible(true), 800);
    setTimeout(() => setNameVisible(true), 1200);
  }, []);

  useEffect(() => {
    if (nameVisible) {
      let currentIndex = 0;
      const typewriterInterval = setInterval(() => {
        if (currentIndex <= fullName.length) {
          setDisplayedName(fullName.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typewriterInterval);
        }
      }, 100);

      return () => clearInterval(typewriterInterval);
    }
  }, [nameVisible, fullName]);

  return (
    <div className="landing-container">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="landing-content">
        <div className={`welcome-section ${isVisible ? "visible" : ""}`}>
          <div className="lottie-container">
            <Lottie
              animationData={welcomeAnimation}
              loop={true}
              autoplay={true}
              style={{ width: 300, height: 300 }}
            />
          </div>

          <div className={`text-content ${textVisible ? "visible" : ""}`}>
            <h1 className="welcome-title">
              Hi, I am{" "}
              <span className="name-highlight typewriter">
                {displayedName}
                <span className="cursor">|</span>
              </span>
            </h1>
            <p className="welcome-subtitle">
              Welcome to my custom calendar application
            </p>
            <p className="welcome-description">
              A fully-featured event management calendar with drag-and-drop
              functionality, recurring events, conflict detection, and
              more!
            </p>
          <div className="cta-section">
            <Link to="/calendar" className="cta-button">
              <span className="button-text">
                Click here to view my custom calendar
              </span>
              <div className="button-animation">
                <div className="ripple"></div>
              </div>
            </Link>
          </div>
          </div>


        </div>
      </div>

    </div>
  );
};

export default LandingPage;
