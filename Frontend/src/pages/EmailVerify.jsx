import {Link, useNavigate} from "react-router-dom";
import {assets} from "../assets/assets.js";
import {useContext, useEffect, useRef, useState, useCallback} from "react";
import {AppContext} from "../context/AppContext.jsx";
import {toast} from "react-toastify";
import axios from "axios";

const COOLDOWN_SECONDS = 120; // 2 minutes

const EmailVerify = () => {
    const inputRef = useRef([]);
    const timerRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);          // seconds remaining
    const [cooldownWarning, setCooldownWarning] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const {getUserData, isLoggedIn, userData, backendURL} = useContext(AppContext);
    const navigate = useNavigate();

    // ── Countdown ticker ──────────────────────────────────────────────────────
    const startCountdown = useCallback((seconds = COOLDOWN_SECONDS) => {
        setCooldown(seconds);
        setCooldownWarning(false);

        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => () => clearInterval(timerRef.current), []);

    // ── Send OTP once on mount ────────────────────────────────────────────────
    useEffect(() => {
        if (!otpSent) {
            sendOtp(true);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Redirect if already verified ─────────────────────────────────────────
    useEffect(() => {
        if (isLoggedIn && userData && userData.isAccountVerified) {
            navigate("/");
        }
    }, [isLoggedIn, userData]);

    // ── Core OTP send / resend ────────────────────────────────────────────────
    const sendOtp = async (isInitial = false) => {
        if (!isInitial && cooldown > 0) {
            setCooldownWarning(true);
            return;
        }

        const setLoadingFn = isInitial ? setLoading : setResendLoading;
        setLoadingFn(true);
        try {
            const response = await axios.post(backendURL + "/send-otp");
            if (response.status === 200) {
                setOtpSent(true);
                startCountdown();
                if (!isInitial) {
                    toast.success("A new OTP has been sent to your email.");
                } else {
                    toast.info("OTP sent to your registered email address.");
                }
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "";

            // Server tells us how many seconds are left in the cooldown
            if (msg.startsWith("COOLDOWN:")) {
                const remaining = parseInt(msg.split(":")[1], 10) || COOLDOWN_SECONDS;
                startCountdown(remaining);
                setOtpSent(true);
                if (!isInitial) {
                    setCooldownWarning(true);
                }
            } else {
                toast.error("Failed to send OTP. Please try again.");
            }
        } finally {
            setLoadingFn(false);
        }
    };

    // ── OTP input helpers ─────────────────────────────────────────────────────
    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/, "");
        e.target.value = value;
        if (value && index < 5) {
            inputRef.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
            inputRef.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").slice(0, 6).split("");
        paste.forEach((digit, i) => {
            if (inputRef.current[i]) inputRef.current[i].value = digit;
        });
        const next = paste.length < 6 ? paste.length : 5;
        inputRef.current[next].focus();
    };

    // ── Verify submitted OTP ──────────────────────────────────────────────────
    const handleVerify = async () => {
        const otp = inputRef.current.map(input => input.value).join("");
        if (otp.length !== 6) {
            toast.error("Please enter all 6 digits of the OTP");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(backendURL + "/verify-otp", {otp});
            if (response.status === 200) {
                toast.success("Email verified successfully!");
                getUserData();
                navigate("/");
            } else {
                toast.error("Invalid OTP, verification failed!");
            }
        } catch (error) {
            toast.error("Verification failed: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const resendDisabled = cooldown > 0 || resendLoading;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div>
            <div
                className="email-verify-container d-flex align-items-center justify-content-center vh-100 position-relative"
                style={{background: "linear-gradient(90deg, #6a5af9, #8268f9)", borderRadius: "none"}}
            >
                <Link
                    to="/"
                    className="position-absolute top-0 start-0 p-4 d-flex align-items-center gap-2 text-decoration-none"
                >
                    <img src={assets.logo} alt="logo" height={32} width={32}/>
                    <span className="fs-4 fw-semibold text-light">Authify</span>
                </Link>

                <div className="p-5 rounded-4 shadow bg-white" style={{width: "420px"}}>
                    <h4 className="text-center fw-bold mb-2">Verify Your Email</h4>
                    <p className="text-center text-black-50 mb-4">
                        Enter the 6-digit code sent to your email address.
                    </p>

                    {/* OTP inputs */}
                    <div className="d-flex justify-content-between gap-2 mb-4">
                        {[...Array(6).keys()].map((_, i) => (
                            <input
                                key={i}
                                type="text"
                                maxLength={1}
                                className="form-control text-center fs-4 otp-input"
                                ref={(el) => (inputRef.current[i] = el)}
                                onChange={(e) => handleChange(e, i)}
                                onKeyDown={(e) => handleKeyDown(e, i)}
                                onPaste={handlePaste}
                                id={`otp-input-${i}`}
                            />
                        ))}
                    </div>

                    {/* Verify button */}
                    <button
                        id="verify-email-btn"
                        className="btn btn-primary w-100 fw-semibold mb-3"
                        disabled={loading}
                        onClick={handleVerify}
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>

                    {/* Cooldown warning */}
                    {cooldownWarning && cooldown > 0 && (
                        <div
                            id="cooldown-warning"
                            className="alert alert-warning py-2 text-center small mb-3"
                            role="alert"
                        >
                            Please wait until the cooldown period ends before requesting a new OTP.
                        </div>
                    )}

                    {/* Resend section */}
                    <div className="text-center">
                        {cooldown > 0 ? (
                            <p className="text-muted small mb-2">
                                Resend available in&nbsp;
                                <span
                                    id="otp-countdown"
                                    className="fw-bold"
                                    style={{color: "#6a5af9"}}
                                >
                                    {formatTime(cooldown)}
                                </span>
                            </p>
                        ) : (
                            <p className="text-muted small mb-2">
                                Didn&apos;t receive the code?
                            </p>
                        )}

                        <button
                            id="resend-otp-btn"
                            className="btn btn-outline-secondary btn-sm"
                            disabled={resendDisabled}
                            onClick={() => {
                                if (cooldown > 0) {
                                    setCooldownWarning(true);
                                } else {
                                    sendOtp(false);
                                }
                            }}
                            title={
                                cooldown > 0
                                    ? `Please wait ${formatTime(cooldown)} before resending`
                                    : "Resend OTP"
                            }
                        >
                            {resendLoading
                                ? "Sending..."
                                : cooldown > 0
                                    ? `Resend OTP (${formatTime(cooldown)})`
                                    : "Resend OTP"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerify;