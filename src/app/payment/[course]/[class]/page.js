"use client";
import Payment from "../../../../../components/payment/Payment";
import { useParams, useRouter } from "next/navigation";
import { getProductDetail } from "../../../../../server_actions/actions/userActions";
import Modal from "../../../../../components/common/Modal";
import { useEffect, useState } from "react";

const Home = () => {
  
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchDetails() {
    const page = params.course + "" + params.class;
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
  }
  useEffect(() => {
    const page = params.course + "" + params.class;
    fetchDetails();
  }, []);

  const testScheduleJee = [
    {
      id: 1,
      date: "3-Mar-25",
      day: "Monday",
      testType: "Complete Syllabus - Test 1",
    },
    {
      id: 2,
      date: "5-Mar-25",
      day: "Wednesday",
      testType: "Complete Syllabus - Test 2",
    },
    {
      id: 3,
      date: "8-Mar-25",
      day: "Saturday",
      testType: "Complete Syllabus - Test 3",
    },
    {
      id: 4,
      date: "12-Mar-25",
      day: "Wednesday",
      testType: "Complete Syllabus - Test 4",
    },
    {
      id: 5,
      date: "18-Mar-25",
      day: "Tuesday",
      testType: "Complete Syllabus - Test 5",
    },
    {
      id: 6,
      date: "22-Mar-25",
      day: "Saturday",
      testType: "Complete Syllabus - Test 6",
    },
    {
      id: 7,
      date: "26-Mar-25",
      day: "Wednesday",
      testType: "Complete Syllabus - Test 7",
    },
    {
      id: 8,
      date: "31-Mar-25",
      day: "Monday",
      testType: "Complete Syllabus - Test 8",
    },
    {
      id: 9,
      date: "4-Apr-25",
      day: "Friday",
      testType: "Complete Syllabus - Test 9",
    },
    {
      id: 10,
      date: "7-Apr-25",
      day: "Monday",
      testType: "Complete Syllabus - Test 10",
    },
  ];

  const testScheduleNeet = [
    { id: 1, date: "5-Mar-25", day: "Wednesday", testType: "Part Test 1" },
    { id: 2, date: "11-Mar-25", day: "Tuesday", testType: "Part Test 2" },
    { id: 3, date: "14-Mar-25", day: "Friday", testType: "Part Test 3" },
    { id: 4, date: "17-Mar-25", day: "Monday", testType: "Part Test 4" },
    { id: 5, date: "20-Mar-25", day: "Thursday", testType: "Part Test 5" },
    {
      id: 6,
      date: "24-Mar-25",
      day: "Monday",
      testType: "Complete Syllabus - Test 1",
    },
    {
      id: 7,
      date: "27-Mar-25",
      day: "Thursday",
      testType: "Complete Syllabus - Test 2",
    },
    {
      id: 8,
      date: "29-Mar-25",
      day: "Saturday",
      testType: "Complete Syllabus - Test 3",
    },
    {
      id: 9,
      date: "1-Apr-25",
      day: "Tuesday",
      testType: "Complete Syllabus - Test 4",
    },
    {
      id: 10,
      date: "4-Apr-25",
      day: "Friday",
      testType: "Complete Syllabus - Test 5",
    },
    {
      id: 11,
      date: "7-Apr-25",
      day: "Monday",
      testType: "Complete Syllabus - Test 6",
    },
    {
      id: 12,
      date: "10-Apr-25",
      day: "Thursday",
      testType: "Complete Syllabus - Test 7",
    },
    {
      id: 13,
      date: "12-Apr-25",
      day: "Saturday",
      testType: "Complete Syllabus - Test 8",
    },
    {
      id: 14,
      date: "15-Apr-25",
      day: "Tuesday",
      testType: "Complete Syllabus - Test 9",
    },
    {
      id: 15,
      date: "18-Apr-25",
      day: "Friday",
      testType: "Complete Syllabus - Test 10",
    },
    {
      id: 16,
      date: "21-Apr-25",
      day: "Monday",
      testType: "Complete Syllabus - Test 11",
    },
    {
      id: 17,
      date: "23-Apr-25",
      day: "Wednesday",
      testType: "Complete Syllabus - Test 12",
    },
    {
      id: 18,
      date: "26-Apr-25",
      day: "Saturday",
      testType: "Complete Syllabus - Test 13",
    },
    {
      id: 19,
      date: "28-Apr-25",
      day: "Monday",
      testType: "Complete Syllabus - Test 14",
    },
    {
      id: 20,
      date: "1-May-25",
      day: "Thursday",
      testType: "Complete Syllabus - Test 15",
    },
  ];

  const testScheduleCet = [
    {
      id: 1,
      date: "1-Mar-25",
      day: "Saturday",
      testType: "Complete Syllabus - Test 1",
    },
    {
      id: 2,
      date: "4-Mar-25",
      day: "Tuesday",
      testType: "Complete Syllabus - Test 2",
    },
    {
      id: 3,
      date: "7-Mar-25",
      day: "Friday",
      testType: "Complete Syllabus - Test 3",
    },
    {
      id: 4,
      date: "10-Mar-25",
      day: "Monday",
      testType: "Complete Syllabus - Test 4",
    },
    {
      id: 5,
      date: "14-Mar-25",
      day: "Friday",
      testType: "Complete Syllabus - Test 5",
    },
    {
      id: 6,
      date: "17-Mar-25",
      day: "Monday",
      testType: "Complete Syllabus - Test 6",
    },
    {
      id: 7,
      date: "21-Mar-25",
      day: "Friday",
      testType: "Complete Syllabus - Test 7",
    },
    {
      id: 8,
      date: "24-Mar-25",
      day: "Monday",
      testType: "Complete Syllabus - Test 8",
    },
    {
      id: 9,
      date: "27-Mar-25",
      day: "Thursday",
      testType: "Complete Syllabus - Test 9",
    },
    {
      id: 10,
      date: "29-Mar-25",
      day: "Saturday",
      testType: "Complete Syllabus - Test 10",
    },
    {
      id: 11,
      date: "1-Apr-25",
      day: "Tuesday",
      testType: "Complete Syllabus - Test 11",
    },
    {
      id: 12,
      date: "3-Apr-25",
      day: "Thursday",
      testType: "Complete Syllabus - Test 12",
    },
    {
      id: 13,
      date: "5-Apr-25",
      day: "Saturday",
      testType: "Complete Syllabus - Test 13",
    },
    {
      id: 14,
      date: "8-Apr-25",
      day: "Tuesday",
      testType: "Complete Syllabus - Test 14",
    },
    {
      id: 15,
      date: "11-Apr-25",
      day: "Friday",
      testType: "Complete Syllabus - Test 15",
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
      
      {params.course === "jee" && params.class === "12" && (
        <>
          <Payment
            title={product.name}
            class={product.class}
            duration={`${product.duration} Months`}
            language="English"
            subjects="Physics, Chemistry, Maths"
            testStartDate="3rd March, 2025"
            price={`${product.price}`}
            discountPrice={`${product.discountPrice}`}
          />
        </>
      )}

      {params.course === "neet" && params.class === "12" && (
        <>
          <Payment
            title={product.name}
            class={product.class}
            duration={`${product.duration} Months`}
            language="English"
            subjects="Physics, Chemistry, Biology"
            testStartDate="5th March, 2025"
            price={`${product.price}`}
            discountPrice={`${product.discountPrice}`}
          />
        </>
      )}

      {params.course === "cet-pcm" && params.class === "12" && (
        <>
          <Payment
            title={product.name}
            class={product.class}
            duration={`${product.duration} Months`}
            language="English"
            subjects="Physics, Chemistry, Maths"
            testStartDate="1st March, 2025"
            price={`${product.price}`}
            discountPrice={`${product.discountPrice}`}
          />
        </>
      )}

{params.course === "cet-pcb" && params.class === "12" && (
        <>
          <Payment
            title={product.name}
            class={product.class}
            duration={`${product.duration} Months`}
            language="English"
            subjects="Physics, Chemistry, Biology"
            testStartDate="1st March, 2025"
            price={`${product.price}`}
            discountPrice={`${product.discountPrice}`}
          />
        </>
      )}
    </section>
  );
};

export default Home;
