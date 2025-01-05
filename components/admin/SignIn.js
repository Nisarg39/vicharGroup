"use client"
import { adminLogin } from '../../server_actions/actions/adminActions';
import { useState } from 'react';
export default function SignIn(props) {
  
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    try {
      const response = await adminLogin({ username, password });
      // console.log(response);
      if (response.success) {
        localStorage.setItem("isAdmin", response.token);
        props.adminStatus(true);
        props.successHandler(true, response.message);
      } else {
        props.successHandler(false, response.message);
      }
    } catch (error) {
      props.successHandler(false, "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };
    
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center text-gray-900">Admin Sign In</h1>
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1d77bc] focus:border-[#1d77bc]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1d77bc] focus:border-[#1d77bc]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1d77bc] hover:bg-[#1d77bc]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1d77bc]"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}