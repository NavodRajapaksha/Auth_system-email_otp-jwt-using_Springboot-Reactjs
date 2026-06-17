import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";

const COOLDOWN_SECONDS = 120;

/* ─── Inline styles ─────────────────────────────────────────────────────── */
const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #4f3ff0 0%, #7c3aed 50%, #a855f7 100%)",
        fontFamily: "'Poppins', sans-serif",
    },
    /* floating blobs */
    blob1: {
        position: "absolute",
        width: 420,
        height: 420,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        top: -100,
        left: -120,
        filter: "blur(40px)",
        pointerEvents: "none",
    },
    blob2: {
        position: "absolute",
        width: 320,
        height: 320,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        bottom: -80,
        right: -80,
        filter: "blur(30px)",
        pointerEvents: "none",
    },
    /* logo */
    logoLink: {
        position: "absolute",
        top: 24,
        left: 32,
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        zIndex: 10,
    },
    logoText: {
        fontSize: 22,
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "-0.3px",
    },
    /* card */
    card: {
        background: "rgba(255,255,255,0.97)",
        borderRadius: 24,
        padding: "44px 40px 36px",
        width: "100%",
        maxWidth: 440,
        boxShadow: "0 24px 60px rgba(79,63,240,0.22), 0 4px 16px rgba(0,0,0,0.08)",
        position: "relative",
        zIndex: 5,
    },
    /* icon badge */
    iconBadge: {
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #4f3ff0, #a855f7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        boxShadow: "0 8px 20px rgba(79,63,240,0.35)",
    },
    title: {
        textAlign: "center",
        fontWeight: 700,
        fontSize: 22,
        color: "#1a1a2e",
        marginBottom: 6,
    },
    subtitle: {
        textAlign: "center",
        color: "#6b7280",
        fontSize: 14,
        marginBottom: 32,
        lineHeight: 1.6,
    },
    /* OTP input */
    otpWrapper: {
        display: "flex",
        gap: 10,
        justifyContent: "center",
        marginBottom: 28,
    },
    /* Verify button */
    verifyBtn: {
        width: "100%",
        padding: "13px 0",
        border: "none",
        borderRadius: 12,
        background: "linear-gradient(135deg, #4f3ff0, #7c3aed)",
        color: "#fff",
        fontWeight: 600,
        fontSize: 15,
        cursor: "pointer",
        boxShadow: "0 6px 20px rgba(79,63,240,0.35)",
        transition: "opacity 0.2s, transform 0.15s",
        marginBottom: 20,
        letterSpacing: "0.3px",
    },
    verifyBtnDisabled: {
        opacity: 0.65,
        cursor: "not-allowed",
        transform: "none",
    },
    /* Divider */
    divider: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 18,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        background: "#e5e7eb",
    },
    dividerText: {
        fontSize: 12,
        color: "#9ca3af",
        whiteSpace: "nowrap",
    },
    /* cooldown section */
    cooldownBox: {
        textAlign: "center",
    },
    countdownBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "linear-gradient(135deg, #ede9fe, #f3e8ff)",
        border: "1px solid #c4b5fd",
        borderRadius: 50,
        padding: "7px 18px",
        fontSize: 14,
        fontWeight: 600,
        color: "#5b21b6",
        marginBottom: 12,
    },
    resendBtnActive: {
        background: "transparent",
        border: "2px solid #4f3ff0",
        borderRadius: 12,
        color: "#4f3ff0",
        fontWeight: 600,
        fontSize: 14,
        padding: "9px 28px",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    resendBtnDisabled: {
        background: "transparent",
        border: "2px solid #d1d5db",
        borderRadius: 12,
        color: "#9ca3af",
        fontWeight: 600,
        fontSize: 14,
        padding: "9px 28px",
        cursor: "not-allowed",
    },
    /* warning */
    warning: {
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
        color: "#92400e",
        textAlign: "center",
        marginBottom: 14,
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
    },
};

/* ─── OTP single-digit input ────────────────────────────────────────────── */
const OtpBox = ({ index, refFn, onChange, onKeyDown, onPaste }) => {
    const [filled, setFilled] = useState(false);

    return (
        <input
            id={`otp-input-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            ref={refFn}
            onChange={(e) => {
                setFilled(!!e.target.value);
                onChange(e, index);
            }}
            onKeyDown={(e) => {
                if (e.key === "Backspace") setFilled(false);
                onKeyDown(e, index);
            }}
            onPaste={onPaste}
            style={{
                width: 52,
                height: 58,
                textAlign: "center",
                fontSize: 24,
                fontWeight: 700,
                border: filled ? "2px solid #4f3ff0" : "2px solid #e5e7eb",
                borderRadius: 12,
                outline: "none",
                background: filled ? "#f5f3ff" : "#fafafa",
                color: "#1a1a2e",
                transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                boxShadow: filled ? "0 0 0 4px rgba(79,63,240,0.12)" : "none",
                caretColor: "#4f3ff0",
            }}
            onFocus={(e) => {
                e.target.style.borderColor = "#4f3ff0";
                e.target.style.boxShadow = "0 0 0 4px rgba(79,63,240,0.12)";
            }}
            onBlur={(e) => {
                if (!e.target.value) {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                }
            }}
        />
    );
};

/* ─── Main component ─────────────────────────────────────────────────────── */
const EmailVerify = () => {
    const inputRef = useRef([]);
    const timerRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [cooldownWarning, setCooldownWarning] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [btnHover, setBtnHover] = useState(false);
    const [resendHover, setResendHover] = useState(false);

    const { getUserData, isLoggedIn, userData, backendURL } = useContext(AppContext);
    const navigate = useNavigate();

    /* countdown */
    const startCountdown = useCallback((seconds = COOLDOWN_SECONDS) => {
        setCooldown(seconds);
        setCooldownWarning(false);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) { clearInterval(timerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => () => clearInterval(timerRef.current), []);

    /* start cooldown UI immediately; actual OTP was sent on page load by backend */
    useEffect(() => {
        setOtpSent(true);
        startCountdown();
    }, []);

    /* redirect if already verified */
    useEffect(() => {
        if (isLoggedIn && userData && userData.isAccountVerified) navigate("/");
    }, [isLoggedIn, userData]);

    /* send / resend */
    const sendOtp = async (isInitial = false) => {
        if (!isInitial && cooldown > 0) { setCooldownWarning(true); return; }
        const setLoadingFn = isInitial ? setLoading : setResendLoading;
        setLoadingFn(true);
        try {
            const response = await axios.post(backendURL + "/send-otp");
            if (response.status === 200) {
                setOtpSent(true);
                startCountdown();
                toast.success(isInitial ? "OTP sent to your email." : "New OTP sent to your email!");
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "";
            if (msg.startsWith("COOLDOWN:")) {
                const remaining = parseInt(msg.split(":")[1], 10) || COOLDOWN_SECONDS;
                startCountdown(remaining);
                setOtpSent(true);
                if (!isInitial) setCooldownWarning(true);
            } else {
                toast.error("Failed to send OTP. Please try again.");
            }
        } finally {
            setLoadingFn(false);
        }
    };

    /* input helpers */
    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/, "");
        e.target.value = value;
        if (value && index < 5) inputRef.current[index + 1].focus();
    };
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) inputRef.current[index - 1].focus();
    };
    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").slice(0, 6).split("");
        paste.forEach((digit, i) => { if (inputRef.current[i]) inputRef.current[i].value = digit; });
        inputRef.current[Math.min(paste.length, 5)].focus();
    };

    /* verify */
    const handleVerify = async () => {
        const otp = inputRef.current.map((el) => el.value).join("");
        if (otp.length !== 6) { toast.error("Please enter all 6 digits."); return; }
        setLoading(true);
        try {
            const response = await axios.post(backendURL + "/verify-otp", { otp });
            if (response.status === 200) {
                toast.success("Email verified successfully! 🎉");
                await getUserData();
                navigate("/");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (secs) =>
        `${Math.floor(secs / 60).toString().padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;

    const resendDisabled = cooldown > 0 || resendLoading;
    const progress = ((COOLDOWN_SECONDS - cooldown) / COOLDOWN_SECONDS) * 100;

    return (
        <div style={styles.page}>
            {/* decorative blobs */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />

            {/* logo */}
            <Link to="/" style={styles.logoLink}>
                <img src={assets.logo} alt="logo" height={32} width={32} />
                <span style={styles.logoText}>Authify</span>
            </Link>

            {/* card */}
            <div style={styles.card}>

                {/* envelope icon badge */}
                <div style={styles.iconBadge}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                            stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="22,6 12,13 2,6"
                            stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <h2 style={styles.title}>Verify Your Email</h2>
                <p style={styles.subtitle}>
                    We sent a 6-digit code to your registered email.<br />
                    Enter it below to confirm your account.
                </p>

                {/* OTP boxes */}
                <div style={styles.otpWrapper}>
                    {[...Array(6).keys()].map((_, i) => (
                        <OtpBox
                            key={i}
                            index={i}
                            refFn={(el) => (inputRef.current[i] = el)}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                        />
                    ))}
                </div>

                {/* Verify button */}
                <button
                    id="verify-email-btn"
                    style={{
                        ...styles.verifyBtn,
                        ...(loading ? styles.verifyBtnDisabled : {}),
                        ...(btnHover && !loading ? {
                            transform: "scale(1.02)",
                            boxShadow: "0 0 0 4px rgba(255,255,255,0.35), 0 8px 24px rgba(79,63,240,0.45)",
                        } : {}),
                    }}
                    disabled={loading}
                    onClick={handleVerify}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                >
                    {loading ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <span
                                style={{
                                    width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
                                    borderTopColor: "#fff", borderRadius: "50%",
                                    display: "inline-block", animation: "spin 0.7s linear infinite",
                                }}
                            />
                            Verifying…
                        </span>
                    ) : "Verify Email"}
                </button>

                {/* divider */}
                <div style={styles.divider}>
                    <div style={styles.dividerLine} />
                    <span style={styles.dividerText}>Resend Code</span>
                    <div style={styles.dividerLine} />
                </div>

                {/* cooldown warning */}
                {cooldownWarning && cooldown > 0 && (
                    <div style={styles.warning}>
                        <span>⏳</span>
                        <span>Please wait until the cooldown period ends before requesting a new OTP.</span>
                    </div>
                )}

                {/* countdown / resend */}
                <div style={styles.cooldownBox}>
                    {cooldown > 0 ? (
                        <>
                            {/* progress bar */}
                            <div style={{
                                height: 4, background: "#e5e7eb", borderRadius: 99,
                                marginBottom: 12, overflow: "hidden",
                            }}>
                                <div style={{
                                    height: "100%", borderRadius: 99,
                                    background: "linear-gradient(90deg, #4f3ff0, #a855f7)",
                                    width: `${progress}%`,
                                    transition: "width 1s linear",
                                }} />
                            </div>
                            <div style={styles.countdownBadge}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#7c3aed" strokeWidth="2" />
                                    <polyline points="12,6 12,12 16,14" stroke="#7c3aed" strokeWidth="2"
                                        strokeLinecap="round" />
                                </svg>
                                Resend available in &nbsp;
                                <span id="otp-countdown">{formatTime(cooldown)}</span>
                            </div>
                        </>
                    ) : (
                        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
                            Didn't receive the code?
                        </p>
                    )}

                    <button
                        id="resend-otp-btn"
                        style={resendDisabled ? styles.resendBtnDisabled : {
                            ...styles.resendBtnActive,
                            ...(resendHover ? {
                                background: "#4f3ff0", color: "#fff",
                                boxShadow: "0 4px 14px rgba(79,63,240,0.3)",
                            } : {}),
                        }}
                        disabled={resendDisabled}
                        onClick={() => cooldown > 0 ? setCooldownWarning(true) : sendOtp(false)}
                        onMouseEnter={() => setResendHover(true)}
                        onMouseLeave={() => setResendHover(false)}
                    >
                        {resendLoading ? "Sending…" : "Resend OTP"}
                    </button>
                </div>
            </div>

            {/* keyframe for spinner */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default EmailVerify;