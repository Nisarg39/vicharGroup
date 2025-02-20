"use client";
import TestSeriesHero from "../../../../../../components/testSeries/testSeriesPayout/TestSeriesHero";
import TestSchedule from "../../../../../../components/testSeries/testSeriesPayout/TestSchedule";
import { useParams, useRouter } from "next/navigation";
import { getProductDetail } from "../../../../../../server_actions/actions/userActions";
import Modal from "../../../../../../components/common/Modal";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../../../../../components/common/LoadingSpinner";

const Home = () => {
  
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchDetails() {
    const page = params.course + "/" + params.class;
    const details = await getProductDetail(page);

    if (details.success) {
      // add comma after 3 digits of the number
      details.product.price = details.product.price.toLocaleString('en-IN')
      details.product.discountPrice = details.product.discountPrice.toLocaleString('en-IN')
      setProduct(details.product);
    }else{
      // adding 5 seconds delay to show the error modal
      setErrorMessage(details.message || "Error fetching product details");
      setShowErrorModal(true);
      setTimeout(() => {
        setErrorMessage();
        setShowErrorModal(false);
        router.push("/test-series");
      }, 5000);
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchDetails();
  }, []);

  const testScheduleJee = [
    {
      id: 1,
      date: "11-Mar-25",
      day: "Tuesday",
      testType: "Test 3",
    },
    {
      id: 2,
      date: "13-Mar-25",
      day: "Thursday",
      testType: "Test 2",
    },
    {
      id: 3,
      date: "15-Mar-25",
      day: "Saturday",
      testType: "Test 3",
    },
    {
      id: 4,
      date: "17-Mar-25",
      day: "Monday",
      testType: "Test 4",
    },
    {
      id: 5,
      date: "19-Mar-25",
      day: "Wednesday",
      testType: "Test 5",
    },
    {
      id: 6,
      date: "21-Mar-25",
      day: "Friday",
      testType: "Test 6",
    },
    {
      id: 7,
      date: "23-Mar-25",
      day: "Sunday",
      testType: "Test 7",
    },
    {
      id: 8,
      date: "25-Mar-25",
      day: "Tuesday",
      testType: "Test 8",
    },
    {
      id: 9,
      date: "27-Mar-25",
      day: "Thursday",
      testType: "Test 9",
    },
    {
      id: 10,
      date: "29-Mar-25",
      day: "Saturday",
      testType: "Test 10",
    },
  ];
  const testScheduleNeet = [
    { id: 1, date: "27-Mar-25", day: "Thursday", testType: "Test 2" },
    { id: 2, date: "31-Mar-25", day: "Monday", testType: "Test 4" },
    { id: 3, date: "4-Apr-25", day: "Friday", testType: "Test 5" },
    { id: 4, date: "8-Apr-25", day: "Tuesday", testType: "Test 7" },
    { id: 5, date: "12-Apr-25", day: "Saturday", testType: "Test 9" },
    { id: 6, date: "15-Apr-25", day: "Tuesday", testType: "Test 10" },
    { id: 7, date: "19-Apr-25", day: "Saturday", testType: "Test 11" },
    { id: 8, date: "23-Apr-25", day: "Wednesday", testType: "Test 13" },
    { id: 9, date: "27-Apr-25", day: "Sunday", testType: "Test 14" },
    { id: 10, date: "1-May-25", day: "Thursday", testType: "Test 15" },
  ];

  const testScheduleNeetPart2 = [
    {
      id: 1,
      date: "11-Mar-25",
      day: "Tuesday",
      testType: "Test 1"
    },
    {
      id: 2,
      date: "14-Mar-25",
      day: "Friday", 
      testType: "Test 2"
    },
    {
      id: 3,
      date: "17-Mar-25",
      day: "Monday",
      testType: "Test 3"
    },
    {
      id: 4,
      date: "20-Mar-25",
      day: "Thursday",
      testType: "Test 4"
    },
    {
      id: 5,
      date: "23-Mar-25",
      day: "Sunday",
      testType: "Test 5"
    }
  ]  
  
  const testScheduleCet = [
    {
      id: 1,
      date: "11-Mar-25",
      day: "Tuesday",
      testType: "Test 1",
    },
    {
      id: 2,
      date: "17-Mar-25",
      day: "Monday",
      testType: "Test 2",
    },
    {
      id: 3,
      date: "21-Mar-25",
      day: "Friday",
      testType: "Test 3",
    },
    {
      id: 4,
      date: "24-Mar-25",
      day: "Monday",
      testType: "Test 4",
    },
    {
      id: 5,
      date: "27-Mar-25",
      day: "Thursday",
      testType: "Test 5",
    },
    {
      id: 6,
      date: "30-Mar-25",
      day: "Sunday",
      testType: "Test 6",
    },
    {
      id: 7,
      date: "2-Apr-25",
      day: "Wednesday",
      testType: "Test 7",
    },
    {
      id: 8,
      date: "5-Apr-25",
      day: "Saturday",
      testType: "Test 8",
    },
    {
      id: 9,
      date: "8-Apr-25",
      day: "Tuesday",
      testType: "Test 9",
    },
    {
      id: 10,
      date: "11-Apr-25",
      day: "Friday",
      testType: "Test 10",
    },
  ];

  return (
    <section>
      <Modal
        showModal={showErrorModal}
        setShowModal={setShowErrorModal}
        isSuccess={false}
        modalMessage={errorMessage}
      />
      
      {loading ? (
        <div className="min-h-screen flex align-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {params.course === "jee" && params.class === "12" && (
            <>
              <TestSeriesHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                testStartDate="3rd March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
              />
              <TestSchedule testSchedule={testScheduleJee} title="Test Schedule - JEE Mains (2025) [Full Length]" />
            </>
          )}

          {params.course === "neet" && params.class === "12" && (
            <>
              <TestSeriesHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Biology"
                testStartDate="5th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
              />
              <TestSchedule testSchedule={testScheduleNeet} title="Test Schedule – NEET (2025)[Full Length]" />
              <TestSchedule testSchedule={testScheduleNeetPart2} title="Test Schedule – NEET (2025)[Part 2]" />
            </>
          )}

          {params.course === "cet-pcm" && params.class === "12" && (
            <>
              <TestSeriesHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                testStartDate="1st March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
              />
              <TestSchedule testSchedule={testScheduleCet} title="Test Schedule – MHT-CET (2025) [Full Length]" />
            </>
          )}

          {params.course === "cet-pcb" && params.class === "12" && (
            <>
              <TestSeriesHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Biology"
                testStartDate="1st March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
              />
              <TestSchedule testSchedule={testScheduleCet} title="Test Schedule – CET (2025)" />
            </>
          )}
        </>
      )}
    </section>
  );
};

export default Home;
