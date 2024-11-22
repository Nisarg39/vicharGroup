export default function StockTestimonials() {
    const testimonials = [
        {
            id: 1,
            name: "Prasanna Joshi",
            content: "Rupesh Paliwal Sir has always tried to cover the doubts of the students who need more attention to understand concepts because of which I would highly prefer to join the classes"
        },
        {
            id: 2,
            name: "Abhinav Shinde",
            content: "Sir taught me to apply all the techniques that layed my foundation for my stock market career, especially how to manage risk because of which I'm profitable Today"
        }
    ]

    return (
        <section className="bg-gradient-to-b from-gray-100 to-white py-24">
            <div className="container mx-auto px-6">
                <h2 className="text-5xl font-extrabold text-center mb-20 text-gray-800 relative">
                    What Our Students Say
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#1d77bc] mt-4"></span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-gradient-to-br from-[#1d77bc]/10 to-white rounded-3xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#1d77bc]/20">
                            <div className="flex flex-col items-center mb-6">
                                <div className="text-center">
                                    <h3 className="font-bold text-2xl text-gray-800 mb-1">{testimonial.name}</h3>
                                </div>
                            </div>
                            <p className="text-gray-700 text-lg leading-relaxed mb-6 text-center italic">"{testimonial.content}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}