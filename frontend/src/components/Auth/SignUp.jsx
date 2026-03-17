import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    isSubscribed: true
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
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
      await signUp(form);
      navigate("/account", { replace: true });
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
        <h1 className={authStyles.authTitle}>Create account</h1>
        <p className={authStyles.authText}>Create a customer profile so your orders, addresses, and future purchases stay connected to you.</p>
        <form className={authStyles.authForm} onSubmit={handleSubmit}>
          <Form.Control
            data-field="name"
            className={fieldErrors.name ? authStyles.invalidInput : ""}
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, name: event.target.value }));
              setFieldErrors((previous) => ({ ...previous, name: "" }));
            }}
          />
          {fieldErrors.name ? <div className={authStyles.fieldError}>{fieldErrors.name}</div> : null}
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
            data-field="phone"
            className={fieldErrors.phone ? authStyles.invalidInput : ""}
            type="text"
            placeholder="Phone number"
            value={form.phone}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, phone: event.target.value }));
              setFieldErrors((previous) => ({ ...previous, phone: "" }));
            }}
          />
          {fieldErrors.phone ? <div className={authStyles.fieldError}>{fieldErrors.phone}</div> : null}
          <Form.Control
            data-field="password"
            className={fieldErrors.password ? authStyles.invalidInput : ""}
            type="password"
            placeholder="Create password"
            value={form.password}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, password: event.target.value }));
              setFieldErrors((previous) => ({ ...previous, password: "" }));
            }}
          />
          {fieldErrors.password ? <div className={authStyles.fieldError}>{fieldErrors.password}</div> : null}
          <Form.Check
            type="checkbox"
            id="signupSubscribe"
            checked={form.isSubscribed}
            onChange={(event) => setForm((previous) => ({ ...previous, isSubscribed: event.target.checked }))}
            label="Send me offers and order updates"
          />
          {error ? <div className={authStyles.errorBox}>{error}</div> : null}
          <div className={authStyles.authActions}>
            <button type="submit" className={authStyles.submitBtn} disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
            <div className={authStyles.helperText}>
              Already have an account? <Link to="/signin" className={authStyles.secondaryLink}>Sign in</Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;
