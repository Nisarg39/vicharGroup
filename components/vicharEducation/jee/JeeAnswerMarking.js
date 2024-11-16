export default function JeeAnswerMarking() {
    return (
        <section className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Understanding JEE Main Answer Marking - MCQs and NVQs</h1>
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">For Multiple Choice Questions:</h2>
                <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>To answer a question, select the single option that corresponds to the correct or most appropriate answer.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>Correct answer or most appropriate answer: Award four marks (+4).</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>Incorrect option selected: Deduct one mark (-1).</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>Unanswered or marked for review: No marks awarded (0).</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>If more than one option is correct: Award four marks (+4) only to those who selected any of the correct options.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>If all options are correct: Award four marks (+4) to all who attempted the question.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>If none of the options are correct, the question is found to be incorrect, or the question is dropped: Award full marks to all candidates who appeared, regardless of whether they attempted the question.</span>
                    </li>
                </ul>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">For Numerical Value Questions:</h2>
                <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>Correct answer: Award four marks (+4).</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>Incorrect answer: Deduct one mark (-1).</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>Unanswered or marked for review: No marks awarded (0).</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>If the question is found to be incorrect or is dropped: Award four marks (+4) to all who attempted the question. This may be due to human or technical error.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>Candidates are advised to use the constants provided (if any) in the questions for their calculations.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-3 mt-2"></span>
                        <span>Round off the answer to the nearest integer.</span>
                    </li>
                </ul>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Few Guidelines and Important Facts for the Exam Day</h2>
                <ol className="space-y-3 text-gray-600 list-decimal list-inside">
                    <li>All must carry their JEE Main exam admit cards, along with a recent passport-size photograph and a valid photo ID proof. Anyone without an admit card won't be granted entry into the examination hall.</li>
                    <li>Candidates appearing for Paper II of JEE Main must carry their own geometry set, pencils, erasers, colors, and crayons.</li>
                    <li>A personal transparent hand sanitizer is also required.</li>
                    <li>The examination hall entry will be allowed 1 hour to 30 minutes prior to the examination.</li>
                    <li>PWD candidates are required to bring their own certificates in the format prescribed by NTA.</li>
                    <li>All electronic gadgets are barred from the examination hall.</li>
                    <li>Other items like log tables, notebooks, books, and calculators are also not allowed.</li>
                    <li>Diabetic students will have the provision to carry food items like sugar tablets, fruits, and transparent water bottles. However, packaged food items like chocolates and sandwiches are forbidden.</li>
                    <li>Candidates are required to maintain social distancing and take their seats as soon as the entry is permitted.</li>
                    <li>Rough sheets will be provided for calculations.</li>
                    <li>A student must return those sheets to the invigilator before exiting the examination hall.</li>
                </ol>
            </div>
        </section>
    )
}