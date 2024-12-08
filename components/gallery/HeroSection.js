export default function HeroSection() {
  return (
    <section className="py-16 h-[100vh] bg-cover bg-center relative flex items-center justify-center" style={{ backgroundImage: "url('/course-photo/gallery-bg.jpeg')" }}>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="font-bold text-white mb-6 drop-shadow-[0_4px_3px_rgba(0,0,0,0.4)] text-6xl sm:text-7xl md:text-7xl font-extraboldtracking-tight transform hover:scale-105 transition-transform duration-300">Our Precious Moments</h1>
        <p className="text-xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] transform hover:translate-y-[-2px] transition-transform duration-300">
          Explore our gallery of events and activities.
        </p>
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
    </section>
  );
}