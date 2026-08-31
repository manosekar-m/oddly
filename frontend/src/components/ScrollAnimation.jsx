import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { FiStar, FiShield, FiZap } from 'react-icons/fi';
import './ScrollAnimation.css';

const ScrollAnimation = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 20,
    restDelta: 0.001
  });

  // Background scales up and eventually dims aggressively
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.3]);
  const bgOpacity = useTransform(smoothProgress, [0.7, 0.9], [1, 0.15]); 

  // Phase 1 Text (Huge bold text that blur-fades in and out)
  const text1Opacity = useTransform(smoothProgress, [0, 0.1, 0.25, 0.35], [0, 1, 1, 0]);
  const text1Scale = useTransform(smoothProgress, [0, 0.1, 0.25, 0.35], [2, 1, 1, 0.5]);
  const text1Blur = useTransform(smoothProgress, [0, 0.1, 0.25, 0.35], ["blur(30px)", "blur(0px)", "blur(0px)", "blur(20px)"]);
  
  // Phase 2 Text (Sliding from side)
  const text2Opacity = useTransform(smoothProgress, [0.3, 0.45, 0.55, 0.65], [0, 1, 1, 0]);
  const text2X = useTransform(smoothProgress, [0.3, 0.45, 0.55, 0.65], [-200, 0, 0, 200]);
  
  // Phase 3 Final Reveal (3D Rotation & Rise)
  const finalOpacity = useTransform(smoothProgress, [0.65, 0.8], [0, 1]);
  const finalY = useTransform(smoothProgress, [0.65, 0.8], [300, 0]);
  const finalRotateX = useTransform(smoothProgress, [0.65, 0.8], [40, 0]); // tilts up
  const finalScale = useTransform(smoothProgress, [0.65, 0.8], [0.8, 1]);

  return (
    <div ref={containerRef} className="scroll-animation-container">
      <div className="sticky-wrapper">
        
        {/* Dynamic Video Background */}
        <motion.div 
          className="scroll-bg-video"
          style={{ 
            scale: bgScale,
            opacity: bgOpacity,
          }}
        >
          <video autoPlay loop muted playsInline>
             <source src="https://assets.mixkit.co/videos/preview/mixkit-particles-of-gold-dust-floating-in-the-air-24151-large.mp4" type="video/mp4" />
          </video>
          <div className="bg-gradient-overlay"></div>
        </motion.div>

        {/* Phase 1 Text */}
        <motion.div 
          className="scroll-text-layer text-center"
          style={{ opacity: text1Opacity, scale: text1Scale, filter: text1Blur }}
        >
          <h2 className="glitch-title">
            BEYOND<br/><span className="text-stroke">ORDINARY</span>
          </h2>
        </motion.div>

        {/* Phase 2 Text */}
        <motion.div 
          className="scroll-text-layer"
          style={{ opacity: text2Opacity, x: text2X }}
        >
          <div className="floating-badge">THE PHILOSOPHY</div>
          <h2 className="elegant-title">
            Art in motion.<br/>
            Crafted for <i className="gold-accent">eternity</i>.
          </h2>
        </motion.div>

        {/* Phase 3 Final Reveal */}
        <motion.div 
          className="final-reveal-layer perspective-container"
          style={{ 
            opacity: finalOpacity, 
            y: finalY, 
            scale: finalScale,
            rotateX: finalRotateX
          }}
        >
          <h3 className="final-heading">The Standard</h3>
          
          <div className="glass-grid">
            {/* Card 1 */}
            <div className="glass-card dim">
              <h4>THE OLD WAY</h4>
              <ul className="glass-list">
                <li><span className="x-icon">✕</span> Disposable Trends</li>
                <li><span className="x-icon">✕</span> Synthetics</li>
                <li><span className="x-icon">✕</span> Mass Produced</li>
              </ul>
            </div>

            {/* Card 2 (Premium) */}
            <div className="glass-card premium-card">
              <div className="card-flare"></div>
              <div className="premium-tag">ODDLY EXCLUSIVE</div>
              <h4>THE NEW ERA</h4>
              <ul className="glass-list gold-list">
                <li><div className="icon-wrap"><FiZap /></div> Unmatched Aesthetics</li>
                <li><div className="icon-wrap"><FiShield /></div> Generational Quality</li>
                <li><div className="icon-wrap"><FiStar /></div> Curated Drops</li>
              </ul>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ScrollAnimation;
