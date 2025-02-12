"use client"
import React from "react";
const HeroSection = () => {
  const [showFullText, setShowFullText] = React.useState(false);

  const toggleReadMore = () => {
    setShowFullText(!showFullText);
  };

  return (
    <section className="bg-gradient-to-b from-white to-gray-200 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-8 mt-8">
      <div className="w-full max-w-3xl mb-8 sm:mt-0">
        <img
          src="/vicharlogo.png"
          alt="Vichar Education Hero"
          className="w-full h-auto max-h-[35vh] sm:max-h-[40vh] object-contain border border-gray-200"
        />
      </div>
      <h1 className="text-5xl font-bold text-center mb-8 md:mb-4 text-black">Vichar Education</h1>
      <div className="max-w-2xl">
        <p className="text-base leading-relaxed mb-4 text-gray-700">
            Offering comprehensive academic classes for grades 8th-10th, including expert coaching for JEE, NEET, MHT-CET, and 11th-12th boards. It emphasizes building a solid foundation and strategic preparation for competitive exams.
        </p>
        {showFullText && (
          <p className="text-base leading-relaxed text-gray-700">
            This segment targets around Competitive and Academic Learning for the students from 8th - 12th .We train students for Competitive Exams like JEE, NEET, MHT-CET and Academic Exams for 8th, 9th, 10th Boards, 11th, 12th Boards with Repeater Batches
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

export default HeroSection;