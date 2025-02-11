export default function Activities() {
  const activities = [
    {
      image: "/vichar-events/scienceQuizCompetition.jpeg",
      title: "Science Quiz Competition",
      alt: "Gallery 1"
    },
    {
      image: "/vichar-events/boostingConcentration.jpeg",
      title: "Boosting Concentration",
      alt: "Gallery 2"
    },
    {
      image: "/vichar-events/debateActivity.jpeg",
      title: "Debate Activity",
      alt: "Gallery 3"
    },
    {
      image: "/vichar-events/publicSpeakingActivity.jpeg",
      title: "Public Speaking Activity",
      alt: "Gallery 4"
    }
  ];

  return (
    <section className="pt-8 sm:pt-16 bg-black">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 sm:mb-12 md:mb-16 text-center text-white tracking-tight">Daily Activities</h2>
      <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4">
        {activities.map((activity, index) => (
          <div key={index} className="relative overflow-hidden bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-blue-300 flex-shrink-0 w-[280px] sm:w-auto group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <img
              src={activity.image}
              alt={activity.alt}
              className="h-full w-full object-cover aspect-square transform transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="font-bold">{activity.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}