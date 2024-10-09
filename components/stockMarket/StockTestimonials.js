export default function StockTestimonials() {
    const testimonials = [
        {
            id: 1,
            name: "John Doe",
            role: "Investor",
            content: "This stock market platform has revolutionized my investment strategy. The insights and tools provided are invaluable!",
            avatar: "https://cdn-icons-png.flaticon.com/256/4825/4825051.png"
        },
        {
            id: 2,
            name: "Jane Smith",
            role: "Financial Advisor",
            content: "I've been recommending this platform to all my clients. It's user-friendly and provides real-time data that's crucial for making informed decisions.",
            avatar: "https://cdn-icons-png.flaticon.com/256/4825/4825027.png"
        },
        {
            id: 3,
            name: "Mike Johnson",
            role: "Day Trader",
            content: "The real-time updates and intuitive interface have significantly improved my trading efficiency. It's a game-changer!",
            avatar: "https://cdn-icons-png.flaticon.com/256/4825/4825082.png"
        }
    ]

    return (
        <section className="bg-gradient-to-b from-gray-100 to-white py-24">
            <div className="container mx-auto px-6">
                <h2 className="text-5xl font-extrabold text-center mb-20 text-gray-800 relative">
                    What Our Users Say
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#1d77bc] mt-4"></span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-gradient-to-br from-[#1d77bc]/10 to-white rounded-3xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#1d77bc]/20">
                            <div className="flex flex-col items-center mb-6">
                                <img src={testimonial.avatar} alt={testimonial.name} className="w-24 h-24 rounded-full mb-4 border-4 border-[#1d77bc]/60 shadow-md" />
                                <div className="text-center">
                                    <h3 className="font-bold text-2xl text-gray-800 mb-1">{testimonial.name}</h3>
                                    <p className="text-[#1d77bc] font-medium text-sm">{testimonial.role}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-lg leading-relaxed mb-6 text-center">"{testimonial.content}"</p>
                            <div className="flex justify-center">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}