import { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { ComplaintsContext } from "../ComplaintsContext";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ setshowLogin }) => {
  const { apiUrl, setToken, getUserData } = useContext(ComplaintsContext);
  const navigate = useNavigate();
  const [page, setPage] = useState("Sign up");
  const [data, setData] = useState({ name: "", email: "", password: "" });

  // ✅ Restore session if token exists
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      getUserData(savedToken);
      setshowLogin(false); // auto-close login modal
    }
  }, [setToken, getUserData, setshowLogin]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = page === "Login" ? "/user/login" : "/user/signup";

    if (page === "Sign up" && !data.email.endsWith("@gmail.com")) {
      toast.error("Only Gmail addresses are allowed for signup", { autoClose: 1500 });
      return;
    }

    try {
      const res = await axios.post(apiUrl + endpoint, data);
      if (res.data.success) {
        const token = res.data.token;
        setToken(token);
        localStorage.setItem("token", token);
        await getUserData(token);
        setshowLogin(false);
        toast.success("Logged in successfully", { autoClose: 1500 });
      } else {
        toast.error(res.data.message || "Signup/Login failed", { autoClose: 1500 });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred", { autoClose: 1500 });
    }
  };

  const googleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${apiUrl}/user/google-login`, {
        token: credentialResponse.credential,
      });

      if (res.data.success) {
        const token = res.data.token;
        setToken(token);
        localStorage.setItem("token", token);
        await getUserData(token);
        setshowLogin(false);
        toast.success("Logged in with Google!", { autoClose: 1500 });
      } else {
        toast.error("Google login failed.", { autoClose: 1500 });
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong with Google login.", { autoClose: 1500 });
    }
  };

  const googleFailure = () => {
    toast.error("Google login failed. Please try again.", { autoClose: 1500 });
  };

  return (
    <GoogleOAuthProvider clientId="189976483636-fegkboe4qc5vu81flba0458h2pei5ltf.apps.googleusercontent.com">
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
        <div className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8">
          {/* Close Button */}
          <button
            onClick={() => setshowLogin(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            {page}
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {page === "Sign up" && (
              <input
                onChange={handleOnChange}
                type="text"
                name="name"
                value={data.name}
                placeholder="Username"
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            )}
            <input
              onChange={handleOnChange}
              type="email"
              name="email"
              value={data.email}
              placeholder="Email address"
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              autoComplete="email"
            />
            <input
              onChange={handleOnChange}
              type="password"
              name="password"
              value={data.password}
              placeholder="Password"
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              autoComplete="current-password"
            />

            <button
              type="submit"
              className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
            >
              {page === "Sign up" ? "Create Account" : "Login now"}
            </button>

            {/* Google Login */}
            <div className="flex justify-center mt-4">
              <GoogleLogin onSuccess={googleSuccess} onError={googleFailure} />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center space-x-2 text-sm text-gray-300 mt-4">
              <input type="checkbox" required className="w-4 h-4" />
              <p>
                Agree to the{" "}
                <span
                  className="text-yellow-400 hover:underline cursor-pointer"
                  onClick={() => {
                    setshowLogin(false);
                    navigate("/terms-of-use");
                  }}
                >
                  terms of use & privacy policy
                </span>
                .
              </p>
            </div>

            {/* Toggle SignUp/Login */}
            <p className="text-center text-gray-400 mt-6">
              {page === "Sign up" ? (
                <>
                  Already have an account?{" "}
                  <span
                    className="text-yellow-400 hover:underline cursor-pointer"
                    onClick={() => setPage("Login")}
                  >
                    Login here
                  </span>
                </>
              ) : (
                <>
                  Create an Account?{" "}
                  <span
                    className="text-yellow-400 hover:underline cursor-pointer"
                    onClick={() => setPage("Sign up")}
                  >
                    Click here
                  </span>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
