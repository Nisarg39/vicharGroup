const TermsAndConditions = () => {
    return (
        <div className="container mx-auto px-4 py-12 sm:py-20 mt-12 sm:mt-24 max-w-5xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-10 sm:mb-14 text-center text-gray-800">Terms and Conditions</h1>
            <div className="space-y-8 sm:space-y-10">
                {[
                    { title: "Acceptance of Terms", content: "By using our services, you agree to these terms and conditions. This includes all features, functionalities, and any future updates or modifications to our services. Your continued use of our platform after any changes to these terms constitutes your acceptance of the new terms. We encourage you to review these terms regularly to stay informed about your rights and responsibilities." },
                    { title: "Use of Service", content: "You must use our service responsibly and in accordance with all applicable laws. This includes refraining from any illegal, harmful, or fraudulent activities while using our platform. You agree not to use our service to distribute spam, malware, or any content that infringes on the rights of others. We reserve the right to suspend or terminate accounts that violate these guidelines." },
                    { title: "Privacy", content: "We respect your privacy and handle your data as described in our Privacy Policy. This includes how we collect, use, store, and protect your personal information, as well as your rights regarding your data. We implement industry-standard security measures to safeguard your information, but please be aware that no method of transmission over the internet is 100% secure. You have the right to request access to, correction of, or deletion of your personal data at any time." },
                    { title: "Intellectual Property", content: "All content on this site is our property and protected by copyright laws. This includes but is not limited to text, graphics, logos, images, audio clips, digital downloads, and software. You may not reproduce, distribute, modify, or create derivative works from any content on our site without our express written permission. Any unauthorized use of our intellectual property may result in legal action." },
                    { title: "Limitation of Liability", content: "We are not liable for any damages arising from your use of our service. This includes direct, indirect, incidental, consequential, and punitive damages, as well as lost profits or data loss. We do not guarantee the accuracy, completeness, or timeliness of the information provided on our platform. You acknowledge that you use our service at your own risk and that we are not responsible for any decisions you make based on the information provided." },
                    { title: "Modifications", content: "We reserve the right to modify these terms at any time without prior notice. It is your responsibility to review these terms periodically for any changes. We may also modify, suspend, or discontinue any part of our service at any time. We will make reasonable efforts to notify users of significant changes, but we are not obligated to do so. Your continued use of our service after any modifications indicates your acceptance of the updated terms." },
                    { title: "Termination", content: "We may terminate your access to our service at our sole discretion, with or without cause, and with or without notice. This includes the right to remove or disable access to any content or materials at any time. Upon termination, you must cease all use of our service and destroy any copies of our content in your possession. Any provisions of these terms that by their nature should survive termination shall remain in effect after termination." },
                    { title: "Governing Law", content: "These terms are governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these terms will be subject to the exclusive jurisdiction of the courts in [Your Jurisdiction]. You agree to submit to the personal jurisdiction of these courts for the purpose of litigating all such claims. This agreement does not affect any rights you may have as a consumer under local law that cannot be waived or changed by contract." }
                ].map((item, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 sm:pb-8 last:border-b-0 last:pb-0 hover:bg-gray-50 transition-colors duration-300 rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-blue-700">{index + 1}. {item.title}</h2>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TermsAndConditions