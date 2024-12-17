"use client"
import { adminLogin } from '../../server_actions/actions/adminActions';

export default function SignIn(props) {
  const handleSignIn = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    try {
      const response = await adminLogin({ username, password });
      console.log(response);
      if (response.success) {
        localStorage.setItem("isAdmin", response.token);
        props.adminStatus(true);
        props.successHandler(true, response.message);
      } else {
        props.successHandler(false, response.message);
      }
    } catch (error) {
      props.successHandler(false, "An error occurred during sign in");
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1d77bc] hover:bg-[#1d77bc]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1d77bc]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}