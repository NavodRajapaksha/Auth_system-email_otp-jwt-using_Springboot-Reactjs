import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useContext, useRef, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

/* ─── Shared design tokens (same palette as EmailVerify) ─────────────────── */
const S = {
    page: {
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #4f3ff0 0%, #7c3aed 50%, #a855f7 100%)",
        fontFamily: "'Poppins', sans-serif",
    },
    blob1: {
        position: "absolute", width: 420, height: 420, borderRadius: "50%",
        background: "rgba(255,255,255,0.08)", top: -100, left: -120,
        filter: "blur(40px)", pointerEvents: "none",
    },
    blob2: {
        position: "absolute", width: 320, height: 320, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)", bottom: -80, right: -80,
        filter: "blur(30px)", pointerEvents: "none",
    },
    logoLink: {
        position: "absolute", top: 24, left: 32, zIndex: 10,
        display: "flex", alignItems: "center", gap: 10, textDecoration: "none",
    },
    logoText: { fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" },
    card: {
        background: "rgba(255,255,255,0.97)", borderRadius: 24,
        padding: "44px 40px 36px", width: "100%", maxWidth: 440,
        boxShadow: "0 24px 60px rgba(79,63,240,0.22), 0 4px 16px rgba(0,0,0,0.08)",
        position: "relative", zIndex: 5,
    },
    iconBadge: (gradient) => ({
        width: 64, height: 64, borderRadius: "50%",
        background: gradient || "linear-gradient(135deg, #4f3ff0, #a855f7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
        boxShadow: "0 8px 20px rgba(79,63,240,0.35)",
    }),
    title: { textAlign: "center", fontWeight: 700, fontSize: 22, color: "#1a1a2e", marginBottom: 6 },
    subtitle: { textAlign: "center", color: "#6b7280", fontSize: 14, marginBottom: 28, lineHeight: 1.6 },
    inputWrap: {
        display: "flex", alignItems: "center", gap: 0,
        background: "#f4f3ff", border: "2px solid #e5e7eb",
        borderRadius: 12, overflow: "hidden", marginBottom: 20,
        transition: "border-color 0.2s, box-shadow 0.2s",
    },
    inputIcon: {
        padding: "0 14px", color: "#7c3aed", fontSize: 18,
        display: "flex", alignItems: "center",
    },
    input: {
        flex: 1, border: "none", outline: "none", background: "transparent",
        height: 50, fontSize: 14, color: "#1a1a2e", paddingRight: 14,
    },
    primaryBtn: (hover, disabled) => ({
        width: "100%", padding: "13px 0", border: "none", borderRadius: 12,
        background: "linear-gradient(135deg, #4f3ff0, #7c3aed)",
        color: "#fff", fontWeight: 600, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: hover && !disabled
            ? "0 0 0 4px rgba(255,255,255,0.35), 0 8px 24px rgba(79,63,240,0.45)"
            : "0 6px 20px rgba(79,63,240,0.35)",
        transform: hover && !disabled ? "scale(1.02)" : "none",
        transition: "box-shadow 0.2s, transform 0.2s",
        opacity: disabled ? 0.65 : 1,
        letterSpacing: "0.3px",
    }),
    /* OTP */
    otpWrapper: { display: "flex", gap: 10, justifyContent: "center", marginBottom: 28 },
    divider: { display: "flex", alignItems: "center", gap: 12, margin: "4px 0 16px" },
    dividerLine: { flex: 1, height: 1, background: "#e5e7eb" },
    dividerText: { fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" },
    countdownBadge: {
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "linear-gradient(135deg, #ede9fe, #f3e8ff)",
        border: "1px solid #c4b5fd", borderRadius: 50, padding: "7px 18px",
        fontSize: 14, fontWeight: 600, color: "#5b21b6", marginBottom: 12,
    },
    resendBtnActive: (hover) => ({
        background: hover ? "#4f3ff0" : "transparent",
        border: "2px solid #4f3ff0", borderRadius: 12,
        color: hover ? "#fff" : "#4f3ff0", fontWeight: 600, fontSize: 14,
        padding: "9px 28px", cursor: "pointer", transition: "all 0.2s",
        boxShadow: hover ? "0 4px 14px rgba(79,63,240,0.3)" : "none",
    }),
    resendBtnDisabled: {
        background: "transparent", border: "2px solid #d1d5db",
        borderRadius: 12, color: "#9ca3af", fontWeight: 600,
        fontSize: 14, padding: "9px 28px", cursor: "not-allowed",
    },
    warning: {
        background: "#fff7ed", border: "1px solid #fed7aa",
        borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#92400e",
        marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 8,
    },
    backLink: {
        display: "inline-flex", alignItems: "center", gap: 6,
        color: "#6b7280", fontSize: 13, textDecoration: "none",
        marginTop: 16, transition: "color 0.2s",
    },
};

/* ─── Styled OTP single-digit box ────────────────────────────────────────── */
const OtpBox = ({ index, refFn, onChange, onKeyDown, onPaste }) => {
    const [filled, setFilled] = useState(false);
    return (
        <input
            id={`reset-otp-input-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            ref={refFn}
            onChange={(e) => { setFilled(!!e.target.value); onChange(e, index); }}
            onKeyDown={(e) => { if (e.key === "Backspace") setFilled(false); onKeyDown(e, index); }}
            onPaste={onPaste}
            style={{
                width: 52, height: 58, textAlign: "center", fontSize: 24, fontWeight: 700,
                border: filled ? "2px solid #4f3ff0" : "2px solid #e5e7eb",
                borderRadius: 12, outline: "none",
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

/* ─── Spinner ────────────────────────────────────────────────────────────── */
const Spinner = () => (
    <span style={{
        width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
        borderTopColor: "#fff", borderRadius: "50%", display: "inline-block",
        animation: "spin 0.7s linear infinite",
    }} />
);

/* ─── Styled text input with icon ────────────────────────────────────────── */
const StyledInput = ({ id, type = "text", placeholder, value, onChange, icon, required }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{
            ...S.inputWrap,
            borderColor: focused ? "#4f3ff0" : "#e5e7eb",
            boxShadow: focused ? "0 0 0 4px rgba(79,63,240,0.12)" : "none",
            background: focused ? "#f5f3ff" : "#f8f8fd",
        }}>
            <span style={S.inputIcon}>{icon}</span>
            <input
                id={id} type={type} placeholder={placeholder}
                value={value} onChange={onChange} required={required}
                style={S.input}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
        </div>
    );
};

/* ─── Main component ─────────────────────────────────────────────────────── */
const ResetPassword = () => {
    const inputRef = useRef([]);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
    const [submitHover, setSubmitHover] = useState(false);
    const [verifyHover, setVerifyHover] = useState(false);
    const [resetHover, setResetHover] = useState(false);

    const { backendURL } = useContext(AppContext);

    /* ── OTP input helpers ── */
    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/, "");
        e.target.value = value;
        if (value && index < 5) inputRef.current[index + 1].focus();
    };
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && index > 0)
            inputRef.current[index - 1].focus();
    };
    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").slice(0, 6).split("");
        paste.forEach((digit, i) => { if (inputRef.current[i]) inputRef.current[i].value = digit; });
        inputRef.current[Math.min(paste.length, 5)].focus();
    };

    /* ── Step 1: send OTP ── */
    const onSubmitEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${backendURL}/send-reset-otp?email=${email}`);
            if (res.status === 200) {
                toast.success("Password reset OTP sent successfully!");
                setIsEmailSent(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    /* ── Step 2: verify OTP ── */
    const handleVerify = () => {
        const collected = inputRef.current.map((el) => el.value).join("");
        if (collected.length !== 6) { toast.error("Please enter all 6 digits."); return; }
        setOtp(collected);
        setIsOtpSubmitted(true);
    };

    /* ── Step 3: reset password ── */
    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${backendURL}/reset-password`, { email, otp, newPassword });
            if (res.status === 200) {
                toast.success("Password reset successfully! 🎉");
                navigate("/login");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    /* ── Progress dots ── */
    const step = !isEmailSent ? 1 : !isOtpSubmitted ? 2 : 3;
    const dotStyle = (active) => ({
        width: active ? 28 : 10, height: 10, borderRadius: 99, transition: "all 0.3s",
        background: active ? "#4f3ff0" : "#c4b5fd",
    });

    return (
        <div style={S.page} className="d-flex align-items-center justify-content-center">
            {/* blobs */}
            <div style={S.blob1} />
            <div style={S.blob2} />

            {/* logo */}
            <Link to="/" style={S.logoLink}>
                <img src={assets.logo} alt="logo" height={32} width={32} />
                <span style={S.logoText}>Authify</span>
            </Link>

            {/* card */}
            <div style={S.card}>

                {/* progress dots */}
                <div className="d-flex justify-content-center align-items-center gap-2 mb-4">
                    <div style={dotStyle(step === 1)} />
                    <div style={dotStyle(step === 2)} />
                    <div style={dotStyle(step === 3)} />
                </div>

                {/* ── STEP 1 · Email entry ─────────────────────────────── */}
                {!isEmailSent && (
                    <>
                        <div style={S.iconBadge("linear-gradient(135deg, #4f3ff0, #7c3aed)")}>
                            {/* mail icon */}
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="22,6 12,13 2,6"
                                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <h2 style={S.title}>Reset Password</h2>
                        <p style={S.subtitle}>
                            Enter your registered email address<br />and we'll send you a reset code.
                        </p>

                        <form onSubmit={onSubmitEmail}>
                            <StyledInput
                                id="reset-email"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                                            stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <polyline points="22,6 12,13 2,6"
                                            stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                }
                            />
                            <button
                                id="send-otp-btn"
                                type="submit"
                                style={S.primaryBtn(submitHover, loading)}
                                disabled={loading}
                                onMouseEnter={() => setSubmitHover(true)}
                                onMouseLeave={() => setSubmitHover(false)}
                            >
                                {loading
                                    ? <span className="d-flex align-items-center justify-content-center gap-2"><Spinner />Sending…</span>
                                    : "Send Reset Code"}
                            </button>
                        </form>

                        <div className="text-center mt-3">
                            <Link to="/login" style={S.backLink}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <polyline points="15,18 9,12 15,6" stroke="#6b7280" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Back to Login
                            </Link>
                        </div>
                    </>
                )}

                {/* ── STEP 2 · OTP entry ───────────────────────────────── */}
                {isEmailSent && !isOtpSubmitted && (
                    <>
                        <div style={S.iconBadge("linear-gradient(135deg, #7c3aed, #a855f7)")}>
                            {/* shield icon */}
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="9,12 11,14 15,10"
                                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <h2 style={S.title}>Enter Reset Code</h2>
                        <p style={S.subtitle}>
                            A 6-digit code was sent to<br />
                            <strong style={{ color: "#4f3ff0" }}>{email}</strong>
                        </p>

                        {/* OTP boxes */}
                        <div style={S.otpWrapper}>
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

                        <button
                            id="verify-reset-otp-btn"
                            style={S.primaryBtn(verifyHover, loading)}
                            disabled={loading}
                            onClick={handleVerify}
                            onMouseEnter={() => setVerifyHover(true)}
                            onMouseLeave={() => setVerifyHover(false)}
                        >
                            {loading
                                ? <span className="d-flex align-items-center justify-content-center gap-2"><Spinner />Verifying…</span>
                                : "Verify Code"}
                        </button>

                        {/* divider */}
                        <div style={S.divider}>
                            <div style={S.dividerLine} />
                            <span style={S.dividerText}>wrong email?</span>
                            <div style={S.dividerLine} />
                        </div>

                        <div className="text-center">
                            <button
                                className="btn btn-link p-0"
                                style={{ color: "#4f3ff0", fontSize: 13, textDecoration: "none" }}
                                onClick={() => setIsEmailSent(false)}
                            >
                                ← Change email address
                            </button>
                        </div>
                    </>
                )}

                {/* ── STEP 3 · New password ────────────────────────────── */}
                {isOtpSubmitted && isEmailSent && (
                    <>
                        <div style={S.iconBadge("linear-gradient(135deg, #10b981, #059669)")}>
                            {/* lock icon */}
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"
                                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"
                                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <h2 style={S.title}>New Password</h2>
                        <p style={S.subtitle}>
                            Choose a strong new password<br />for your account.
                        </p>

                        <form onSubmit={onSubmitNewPassword}>
                            <div style={{
                                ...S.inputWrap,
                                marginBottom: 20,
                            }}>
                                <span style={S.inputIcon}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="11" width="18" height="11" rx="2"
                                            stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"
                                            stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <input
                                    id="new-password"
                                    type={showPass ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    style={S.input}
                                />
                                {/* show/hide toggle */}
                                <button
                                    type="button"
                                    className="btn btn-link p-0 me-3"
                                    style={{ color: "#9ca3af", fontSize: 13 }}
                                    onClick={() => setShowPass((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showPass ? "Hide" : "Show"}
                                </button>
                            </div>

                            <button
                                id="reset-password-btn"
                                type="submit"
                                style={S.primaryBtn(resetHover, loading)}
                                disabled={loading}
                                onMouseEnter={() => setResetHover(true)}
                                onMouseLeave={() => setResetHover(false)}
                            >
                                {loading
                                    ? <span className="d-flex align-items-center justify-content-center gap-2"><Spinner />Resetting…</span>
                                    : "Reset Password"}
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ResetPassword;