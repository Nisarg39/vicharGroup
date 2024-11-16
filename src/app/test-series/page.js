import JeeHero from "../../../components/vicharEducation/jee/JeeHero"
import MhtCetHero from "../../../components/vicharEducation/mht-cet/MhtCetHero"
import NeetHero from "../../../components/vicharEducation/neet/NeetHero"
import FoundationCourses from "../../../components/vicharEducation/vicharFoundation/FoundationCourses"
import StudentEnquiryForm from "../../../components/home/StudentEnquiryForm"
const Home = () => {
    return (
        <section>
            <JeeHero title="JEE Test Series"/>
            <MhtCetHero title="MHT-CET Test Series"/>
            <NeetHero title="NEET Test Series"/>
            <FoundationCourses title="Boards Test Series"/>
            <StudentEnquiryForm />
        </section>
    )
}

export default Home