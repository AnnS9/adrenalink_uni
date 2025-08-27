import { useState, useEffect } from 'react';

const RotatingText = ({ texts, interval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [texts, interval]);

  return <p className="rotating-text">{texts[currentIndex]}</p>;
};

export default RotatingText;