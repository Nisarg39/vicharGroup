import JeeTest from "../../../components/testSeries/JeeTest"
import MhtCetTest from "../../../components/testSeries/MhtCetTest"
import NeetTest from "../../../components/testSeries/NeetTest"
import FoundationTest from "../../../components/testSeries/FoundationTest"
import StudentEnquiryForm from "../../../components/home/StudentEnquiryForm"
import FullScreenBanner from "../../../components/common/FullScreenBanner"
const Home = () => {
    return (
        <section>
            <FullScreenBanner url="/jee-students/jeeTestSeries.png" />
            <JeeTest title="JEE Test Series"/>
            <FullScreenBanner url="/cet-students/cetTestSeries.png" />
            <MhtCetTest title="MHT-CET Test Series"/>
            <FullScreenBanner url="/neet-students/neetTestSeries.png" />
            <NeetTest title="NEET Test Series"/>
            <FullScreenBanner url="/foundation-students/foundationTestSeries.png" />
            <FoundationTest title="Boards Test Series"/>
            <StudentEnquiryForm />
        </section>
    )
}

export default Home