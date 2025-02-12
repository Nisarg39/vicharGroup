import Image from "next/image";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { src: "/vivekSirBanner.png", alt: "Education Group Logo" },
    { src: "https://wallpapercg.com/download/heartbeat-stock-market-candlestick-trading-chart-amoled--19463.png", alt: "Slide 2" },
    // { src: "/slide3.jpg", alt: "Slide 3" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 bg-gradient-to-b from-white to-gray-200">
      <div className="w-full relative z-10">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full px-4 lg:px-0 lg:w-3/4 mx-auto">
            <div className="relative w-full aspect-video">
              <div className="carousel absolute top-0 left-0 w-full h-full">
                {slides.map((slide, index) => (
                  index === currentSlide && (
                    <div
                      key={index}
                      className="carousel-item absolute w-full h-full flex items-center justify-center"
                    >
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        style={{ objectFit: "contain" }}
                        priority={index === 0}
                        className="transition-opacity duration-500"
                      />
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;