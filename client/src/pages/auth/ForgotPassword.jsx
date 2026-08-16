import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const STEPS = {
  EMAIL: "email",
  OTP: "otp",
  RESET: "reset",
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const response = await api.post("/user/forgot-password", { email });

      // Backend currently returns the OTP directly in the response
      // (no email service wired up yet), so we surface it for testing.
      setInfo(
        `An OTP has been generated. ${
          response.data.otp ? `Your OTP: ${response.data.otp}` : "Check your email."
        }`
      );

      setStep(STEPS.OTP);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/user/verify-reset-otp", { email, otp });
      setStep(STEPS.RESET);
    } catch (error) {
      setError(error.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/user/reset-password", { email, otp, newPassword });
      setInfo("Password reset successfully. You can now login.");

      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-500">
            {step === STEPS.EMAIL && "Enter your email to receive an OTP."}
            {step === STEPS.OTP && "Enter the OTP sent to your email."}
            {step === STEPS.RESET && "Set your new password."}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          {step === STEPS.EMAIL && (
            <form onSubmit={handleSendOtp}>
              <div className="mb-6">
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {error && (
                <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOtp}>
              {info && (
                <div className="mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-600">
                  {info}
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="otp" className="mb-2 block text-sm font-medium">
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  required
                  placeholder="Enter the OTP"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {error && (
                <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === STEPS.RESET && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-6">
                <label htmlFor="newPassword" className="mb-2 block text-sm font-medium">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {error && (
                <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {info && (
                <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
                  {info}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Remembered your password?{" "}
            <Link to="/login" className="font-semibold text-black underline underline-offset-4">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
