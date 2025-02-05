const PrivacyPolicy = () => {
    return (
        <div className="container mx-auto px-4 py-12 sm:py-20 mt-6 sm:mt-24 max-w-5xl bg-black">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-10 sm:mb-14 text-center text-white">Privacy Policy</h1>
            <div className="space-y-8 sm:space-y-10">
                {[
                    { title: "Information Collection", content: "We collect personal information that you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, and other contact details. We also automatically collect certain information about your device and how you interact with our services, including IP address, browser type, and usage data." },
                    { title: "Use of Information", content: "We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience. This includes processing transactions, sending notifications, and analyzing usage patterns to enhance our platform. We may also use your information to comply with legal obligations and enforce our policies." },
                    { title: "Information Sharing", content: "We do not sell your personal information to third parties. We may share your information with service providers who assist us in operating our business, with your consent, or as required by law. We may also share aggregated or de-identified information that cannot reasonably be used to identify you." },
                    { title: "Data Security", content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security." },
                    { title: "Your Rights", content: "You have the right to access, correct, update, or request deletion of your personal information. You can also object to processing of your personal information, ask us to restrict processing of your personal information or request portability of your personal information. To exercise these rights, please contact us using the information provided at the end of this policy." },
                    { title: "Cookies and Tracking Technologies", content: "We use cookies and similar tracking technologies to collect and use personal information about you, including to serve interest-based advertising. You can control cookies through your browser settings and other tools. However, if you block certain cookies, you may not be able to register, login, or access certain parts or make full use of the service." },
                    { title: "Children's Privacy", content: "Our services are not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13 without parental consent, we will take steps to remove that information from our servers." },
                    { title: "Changes to This Policy", content: "We may update this privacy policy from time to time in response to changing legal, technical or business developments. When we update our privacy policy, we will take appropriate measures to inform you, consistent with the significance of the changes we make. We will obtain your consent to any material privacy policy changes if and where this is required by applicable data protection laws." }
                ].map((item, index) => (
                    <div key={index} className="border-b border-gray-700 pb-6 sm:pb-8 last:border-b-0 last:pb-0 hover:bg-gray-800 transition-colors duration-300 rounded-lg p-4 sm:p-6 bg-black">
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-blue-700">{index + 1}. {item.title}</h2>
                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PrivacyPolicy