import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { AuthContext } from "../../context/AuthContext";
import authStyles from "./AuthPage.module.css";

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

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
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
          />
          <Form.Control
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
          />
          <Form.Control
            type="text"
            placeholder="Phone number"
            value={form.phone}
            onChange={(event) => setForm((previous) => ({ ...previous, phone: event.target.value }))}
          />
          <Form.Control
            type="password"
            placeholder="Create password"
            value={form.password}
            onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
          />
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
