import JeeTest from "../../../components/testSeries/JeeTest"
import MhtCetTest from "../../../components/testSeries/MhtCetTest"
import NeetTest from "../../../components/testSeries/NeetTest"
import FoundationTest from "../../../components/testSeries/FoundationTest"
import StudentEnquiryForm from "../../../components/home/StudentEnquiryForm"
const Home = () => {
    return (
        <section>
            <JeeTest title="JEE Test Series"/>
            <MhtCetTest title="MHT-CET Test Series"/>
            <NeetTest title="NEET Test Series"/>
            <FoundationTest title="Boards Test Series"/>
            <StudentEnquiryForm />
        </section>
    )
}

export default Home