import React from "react";

const VicharFoundationHero = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-200 flex flex-col items-center justify-center text-center px-4 py-16 pt-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/path/to/pattern.png')] opacity-10"></div>
      <div className="max-w-2xl relative z-10">
        <h1 className="text-5xl md:text-5xl font-bold mb-4 text-gray-900 bg-clip-text ">Foundation Course</h1>
        <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 hover:text-gray-900 transition-colors duration-300">
          Welcome to Vichar Education Foundation, where we are dedicated to laying a solid foundation for academic excellence and personal growth in students of Classes 8, 9, and 10. Our foundation courses are meticulously designed to go beyond traditional education, creating an environment where young minds are inspired, challenged, and motivated to reach their highest potential.
        </p>
      </div>
    </section>
  );
};

export default VicharFoundationHero;