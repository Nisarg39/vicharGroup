"use client";
import CoursePayoutHero from "../../../../../../components/vicharEducation/vicharEducationPayout/CoursePayoutHero";
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
    console.log(details);
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
        router.push("/vichar-education");
      }, 5000);
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchDetails();
  }, []);

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

          {/* Jee Course */}
          {params.course === "jeecourse" && params.class === "11" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )}  

          {params.course === "jeecourse" && params.class === "12" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )}

          {params.course === "jeecourse" && params.class === "11+12" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )}    

          {/* Neet Course */}
          {params.course === "neetcourse" && params.class === "11" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Biology"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )}
          
          {params.course === "neetcourse" && params.class === "12" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )}  

          {params.course === "neetcourse" && params.class === "11+12" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )}  

          {/* MHT CET Course */}

          {params.course === "cet-pcm" && params.class === "11" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )}  

          {params.course === "cet-pcm" && params.class === "12" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )}   

          {params.course === "cet-pcm" && params.class === "11+12" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )} 

          {params.course === "cet-pcb" && params.class === "11" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )} 
          {params.course === "cet-pcb" && params.class === "12" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )} 

          {params.course === "cet-pcb" && params.class === "11+12" && (
            <>
              <CoursePayoutHero
                productId={product._id}
                title={product.name}
                class={product.class}
                duration={`${product.duration} Months`}
                language="English"
                subjects="Physics, Chemistry, Maths"
                // testStartDate="11th March, 2025"
                price={`${product.price}`}
                discountPrice={`${product.discountPrice}`}
                course={`${params.course}`}
                params={`${params.class}`}
                examMode="Online Course"
                subjectsArray={product.subjects}
              />
            </>
          )} 
        </>
      )}
    </section>
  );
};

export default Home;
