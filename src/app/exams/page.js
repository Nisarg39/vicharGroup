import CreateExam from "../../../components/examPortal/collegeComponents/collegeDashboardComponents/manageExamComponents/CreateExam"

const mockCollegeData = { _id: "mock-id", allocatedSubjects: [] };

const ExamTeacherPortal = () => {
    return (
        <div className="mt-20">
            <CreateExam collegeData={mockCollegeData} />
        </div>
    )
}

export default ExamTeacherPortal;