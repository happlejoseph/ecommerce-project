

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const VerifyLoginOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-login-otp", {
        email,
        otp,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const loggedInUser = response.data.user;
      const redirectTo = location.state?.from?.pathname;

      setSuccess("Login successful!");

      setTimeout(() => {
        if (loggedInUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate(redirectTo || "/");
        }

        window.location.reload();
      }, 500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await api.post("/auth/resend-login-otp", {
        email,
      });

      setOtp("");
      setSuccess(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Verify Login</h1>

          <p className="mt-2 text-sm text-gray-500">
            Enter the six-digit OTP sent to your email.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              readOnly
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium"
            >
              Login OTP
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter 6-digit OTP"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resending || loading || !email}
            className="mt-4 w-full rounded-lg border border-gray-300 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending ? "Sending OTP..." : "Resend OTP"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Return to{" "}
            <Link
              to="/login"
              className="font-semibold text-black underline underline-offset-4"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyLoginOTP;