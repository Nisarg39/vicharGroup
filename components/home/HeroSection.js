import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="bg-white min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between">
          <div className="w-full flex justify-center mb-8">
            <div className="relative w-64 h-64 md:w-full md:h-80">
              <Image
                src="/vicharlogo.png"
                alt="Education Group Logo"
                fill
                style={{objectFit: 'contain'}}
                priority
              />
            </div>
          </div>
          <div className="w-full text-center">
            <button
              className="bg-[#106FB7] text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md"
              style={{
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;