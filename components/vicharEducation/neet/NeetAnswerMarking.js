export default function NeetAnswerMarking() {
    return (
        <section className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Understanding NEET Answer Marking - Section A and Section B</h1>
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">For Multiple Choice Questions (Section A):</h2>
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
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">For Section B:</h2>
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
                </ul>
            </div>
        </section>
    )
}