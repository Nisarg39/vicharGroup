export default function MhtCetAnswerMarking() {
    return (
        <section className="min-w-full bg-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Understanding MHT-CET Answer Marking</h1>
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">For Multiple Choice Questions:</h2>
                <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-gray-800 rounded-full mr-3 mt-2"></span>
                        <span>To answer a question, select the single option that corresponds to the correct or most appropriate answer.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-gray-800 rounded-full mr-3 mt-2"></span>
                        <span>Correct answer: (+2) marks for Maths and (+1) mark for Physics, Chemistry and Biology.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-gray-800 rounded-full mr-3 mt-2"></span>
                        <span>Incorrect option selected: No negative marking (0).</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-gray-800 rounded-full mr-3 mt-2"></span>
                        <span>Unanswered: No marks awarded (0).</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-gray-800 rounded-full mr-3 mt-2"></span>
                        <span>If a question is found to be incorrect or is dropped: Proportionate marks will be awarded to all candidates.</span>
                    </li>
                </ul>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Important Notes:</h2>
                <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-gray-800 rounded-full mr-3 mt-2"></span>
                        <span>There is no negative marking in MHT-CET.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-gray-800 rounded-full mr-3 mt-2"></span>
                        <span>Correct answer: (+2) marks for Maths and (+1) mark for Physics, Chemistry and Biology.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-gray-800 rounded-full mr-3 mt-2"></span>
                        <span>The exam consists of multiple-choice questions only.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-gray-800 rounded-full mr-3 mt-2"></span>
                        <span>Candidates are advised to attempt all questions as there is no penalty for wrong answers.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-gray-800 rounded-full mr-3 mt-2"></span>
                        <span>In case of any discrepancy or confusion in a question, it will be reviewed by the examination authority, and appropriate action will be taken.</span>
                    </li>
                </ul>
            </div>
        </div>
        </section>
    )
}