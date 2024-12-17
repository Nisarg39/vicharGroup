
export const MessagePopup = ({ message, studentName, onClose }) => {
    if (!message) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Message from {studentName}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 whitespace-pre-wrap">{message}</p>
        </div>
      </div>
    );
  };