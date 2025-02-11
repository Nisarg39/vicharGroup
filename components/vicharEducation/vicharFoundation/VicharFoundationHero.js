import React from "react";

const VicharFoundationHero = () => {
  return (
    <section className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4 py-16 pt-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/path/to/pattern.png')] opacity-10"></div>
      <div className="max-w-2xl relative z-10">
        <h1 className="text-5xl md:text-5xl font-bold mb-4 text-white bg-clip-text ">Foundation Course</h1>
        <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6 hover:text-white transition-colors duration-300">
          Welcome to Vichar Education Foundation, where we are dedicated to laying a solid foundation for academic excellence and personal growth in students of Classes 8, 9, and 10. Our foundation courses are meticulously designed to go beyond traditional education, creating an environment where young minds are inspired, challenged, and motivated to reach their highest potential.
        </p>
        <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8 hover:text-white transition-colors duration-300">
          Through our thoughtfully crafted curriculum, we aim to empower students with a robust academic base, fostering a love for learning and encouraging independent, critical thinking. We understand that these formative years play a crucial role in shaping each student's future, and we are committed to providing the tools and support needed to help them excel not only in academics but also in life. Join us on this journey of discovery, growth, and success as we work together to build a brighter future.
        </p>
      </div>
    </section>
  );
};

export default VicharFoundationHero;