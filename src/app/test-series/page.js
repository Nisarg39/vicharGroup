import JeeTest from "../../../components/testSeries/JeeTest"
import MhtCetTest from "../../../components/testSeries/MhtCetTest"
import NeetTest from "../../../components/testSeries/NeetTest"
import StudentEnquiryForm from "../../../components/home/StudentEnquiryForm"
import TestSeriesHero from "../../../components/testSeries/TestSeriesHero"

const Home = () => {
    return (
        <section>
            <TestSeriesHero />
            <JeeTest title="JEE Test Series"/>
            <MhtCetTest title="MHT-CET Test Series"/>
            <NeetTest title="NEET Test Series"/>
            <StudentEnquiryForm />
        </section>
    )
}

export default Home