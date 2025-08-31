import React from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, X } from "lucide-react"; // ✅ nice icons

const Login = () => {
  const { setShowLogin, axios, setToken, navigate } = useAppContext();

  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

// ✅ at least 8 chars, one uppercase, one lowercase, one number, one symbol
const validateForm = () => {
  let newErrors = {};

  if (state === "register" && name.trim().length < 3) {
    newErrors.name = "Name must be at least 3 characters.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    newErrors.email = "Enter a valid email address.";
  }

  // Strong password validation regex:
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~|:;.,]).{8,}$/;

  if (!passwordRegex.test(password)) {
    newErrors.password =
      "Password must be at least 8 characters, include uppercase, lowercase, number, and symbol.";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
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
          state === "login" ? "Welcome back! 🎉" : "Account created successfully! 🎉"
        );
        navigate("/");
        setShowLogin(false);
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
React.useEffect(() => {
  const preventScroll = (e) => e.preventDefault();

  document.body.style.overflow = "hidden";
  document.addEventListener("touchmove", preventScroll, { passive: false });

  return () => {
    document.body.style.overflow = "auto";
    document.removeEventListener("touchmove", preventScroll);
  };
}, []);

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 z-60 flex px-6 items-center justify-center bg-black/50 animate-fadeIn"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col gap-4 p-8  max-w-[360px]  rounded-2xl shadow-2xl border border-gray-200 bg-white animate-scaleIn"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setShowLogin(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <p className="text-2xl font-semibold text-center mb-2">
          {state === "login" ? "Welcome Back 👋" : "Create Your Account"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <label className="block text-sm mb-1">Name</label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="John Doe"
              className={`border ${
                errors.name ? "border-red-400" : "border-gray-300"
              } rounded w-full p-2 outline-primary`}
              type="text"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
        )}

        <div className="w-full">
          <label className="block text-sm mb-1">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="you@example.com"
            className={`border ${
              errors.email ? "border-red-400" : "border-gray-300"
            } rounded w-full p-2 outline-primary`}
            type="email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div className="w-full relative">
          <label className="block text-sm mb-1">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="••••••"
            className={`border ${
              errors.password ? "border-red-400" : "border-gray-300"
            } rounded w-full p-2 pr-10 outline-primary`}
            type={showPassword ? "text" : "password"}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute hover-cursor right-3 top-8 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <p className="text-sm text-gray-600">
          {state === "register" ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setState("login")}
                className="text-primary font-medium cursor-pointer hover:underline"
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <span
                onClick={() => setState("register")}
                className="text-primary font-medium cursor-pointer hover:underline"
              >
                Sign Up
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
