export default function TestSchedule(props){
    const testSchedule = props.testSchedule

    return(
        <div className="max-w-4xl mx-auto p-2 sm:p-6">
            <h2 className="font-bold text-center mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl text-gray-800 leading-tight">{props.title}</h2>
            <div className="shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full border-collapse bg-white whitespace-nowrap">
                    <thead>
                        <tr className="bg-[#1d77bc] text-white">
                            <th className="border border-gray-200 p-3 text-left">S.N</th>
                            <th className="border border-gray-200 p-3 text-left">Date</th>
                            <th className="border border-gray-200 p-3 text-left">Day</th>
                            <th className="border border-gray-200 p-3 text-left">Test Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testSchedule.map((test) => (
                            <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                                <td className="border border-gray-200 p-3">{test.id}</td>
                                <td className="border border-gray-200 p-3">{test.date}</td>
                                <td className="border border-gray-200 p-3">{test.day}</td>
                                <td className="border border-gray-200 p-3">{test.testType}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}