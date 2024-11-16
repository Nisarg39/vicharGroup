"use client"
import React from "react";
const VicharFoundationHero = () => {
  const [showFullText, setShowFullText] = React.useState(false);

  const toggleReadMore = () => {
    setShowFullText(!showFullText);
  };

  return (
    <section className="bg-white min-h-screen flex flex-col items-center justify-center text-center px-4 py-8 mt-8">
      <div className="w-full max-w-3xl mb-8 sm:mt-0">
        <img
          src="/vicharlogo.png"
          alt="Vichar Education Hero"
          className="w-full h-auto max-h-[35vh] sm:max-h-[40vh] object-contain border border-gray-300"
        />
      </div>
      <h1 className="text-5xl font-bold text-center mb-8 md:mb-4 text-gray-800">Vichar Education Foundation</h1>
      <div className="max-w-2xl">
        <p className="text-base leading-relaxed mb-4">
          Welcome to Vichar Education Foundation, where we are dedicated to laying a solid foundation for academic excellence and personal growth in students of Classes 8, 9, and 10. Our foundation courses are meticulously designed to go beyond traditional education, creating an environment where young minds are inspired, challenged, and motivated to reach their highest potential.
        </p>
        {showFullText && (
          <p className="text-base leading-relaxed">
            Through our thoughtfully crafted curriculum, we aim to empower students with a robust academic base, fostering a love for learning and encouraging independent, critical thinking. We understand that these formative years play a crucial role in shaping each student's future, and we are committed to providing the tools and support needed to help them excel not only in academics but also in life. Join us on this journey of discovery, growth, and success as we work together to build a brighter future.
          </p>
        )}
      </div>
      <button
        onClick={toggleReadMore}
        className="mt-4 text-blue-600 hover:text-blue-800 transition-colors duration-300"
      >
        {showFullText ? 'Read Less' : 'Read More'}
      </button>
    </section>
  );
};

export default VicharFoundationHero;