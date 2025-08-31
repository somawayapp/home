import React from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Login = () => {
  const { setShowLogin, axios, setToken, navigate } = useAppContext();

  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // ✅ Simple validation
  const validateForm = () => {
    if (state === "register" && name.trim().length < 3) {
      toast.error("Name must be at least 3 characters long.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await axios.post(`/api/user/${state}`, {
        name,
        email,
        password,
      });

      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(
          state === "login" ? "Logged in successfully!" : "Account created successfully!"
        );
        navigate("/");
        setShowLogin(false);
      } else {
        toast.error(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 p-8 w-80 sm:w-[352px] rounded-xl shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-semibold text-center mb-2">
          <span className="text-primary">User</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <label className="block text-sm mb-1">Name</label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Your full name"
              className="border border-gray-300 rounded w-full p-2 outline-primary"
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full">
          <label className="block text-sm mb-1">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="you@example.com"
            className="border border-gray-300 rounded w-full p-2 outline-primary"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <label className="block text-sm mb-1">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="••••••"
            className="border border-gray-300 rounded w-full p-2 outline-primary"
            type="password"
            required
          />
        </div>

        <p className="text-sm text-gray-600">
          {state === "register" ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setState("login")}
                className="text-primary font-medium cursor-pointer hover:underline"
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                onClick={() => setState("register")}
                className="text-primary font-medium cursor-pointer hover:underline"
              >
                Sign up
              </span>
            </>
          )}
        </p>

        <button
          disabled={loading}
          className={`bg-primary hover:bg-blue-800 transition-all text-white w-full py-2 rounded-md cursor-pointer ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading
            ? state === "register"
              ? "Creating Account..."
              : "Logging In..."
            : state === "register"
            ? "Create Account"
            : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
