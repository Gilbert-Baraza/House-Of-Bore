import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { AuthContext } from "../../context/AuthContext";
import authStyles from "./AuthPage.module.css";

const focusField = (fieldName) => {
  if (!fieldName || typeof document === "undefined") {
    return;
  }

  const element = document.querySelector(`[data-field="${fieldName}"]`);

  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.focus?.();
};

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/account";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required.";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setError("Please fill in all required fields.");
      focusField(Object.keys(nextErrors)[0]);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await signIn(form);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={authStyles.authWrapper}>
      <div className={authStyles.authCard}>
        <span className={authStyles.eyebrow}>House of bore account</span>
        <h1 className={authStyles.authTitle}>Sign in</h1>
        <p className={authStyles.authText}>Access your profile, manage your details, and keep every order tied to your account.</p>
        <form className={authStyles.authForm} onSubmit={handleSubmit}>
          <Form.Control
            data-field="email"
            className={fieldErrors.email ? authStyles.invalidInput : ""}
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, email: event.target.value }));
              setFieldErrors((previous) => ({ ...previous, email: "" }));
            }}
          />
          {fieldErrors.email ? <div className={authStyles.fieldError}>{fieldErrors.email}</div> : null}
          <Form.Control
            data-field="password"
            className={fieldErrors.password ? authStyles.invalidInput : ""}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, password: event.target.value }));
              setFieldErrors((previous) => ({ ...previous, password: "" }));
            }}
          />
          {fieldErrors.password ? <div className={authStyles.fieldError}>{fieldErrors.password}</div> : null}
          {error ? <div className={authStyles.errorBox}>{error}</div> : null}
          <div className={authStyles.authActions}>
            <button type="submit" className={authStyles.submitBtn} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <div className={authStyles.helperText}>
              No account yet? <Link to="/signup" className={authStyles.secondaryLink}>Create one</Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignIn;
