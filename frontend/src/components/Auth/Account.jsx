import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
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

const trackingStages = [
  "unpaid",
  "to_be_shipped",
  "shipped",
  "out_for_delivery",
  "completed"
];

const formatStatusLabel = (value) => {
  if (!value) {
    return "--";
  }

  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getStatusBadgeClassName = (value) => {
  switch (value) {
    case "unpaid":
    case "pending":
      return `${authStyles.orderBadge} ${authStyles.orderBadgeWarning}`;
    case "to_be_shipped":
      return `${authStyles.orderBadge} ${authStyles.orderBadgeAccent}`;
    case "shipped":
    case "out_for_delivery":
      return `${authStyles.orderBadge} ${authStyles.orderBadgeInfo}`;
    case "completed":
    case "paid":
      return `${authStyles.orderBadge} ${authStyles.orderBadgeSuccess}`;
    case "cancelled":
    case "failed":
      return `${authStyles.orderBadge} ${authStyles.orderBadgeDanger}`;
    case "returned":
    case "refunded":
      return `${authStyles.orderBadge} ${authStyles.orderBadgeMuted}`;
    default:
      return authStyles.orderBadge;
  }
};

const getStatusIcon = (value) => {
  switch (value) {
    case "unpaid":
    case "pending":
      return "!";
    case "to_be_shipped":
      return "\u25A1";
    case "shipped":
      return "\u2192";
    case "out_for_delivery":
      return "\u21E2";
    case "completed":
    case "paid":
      return "\u2713";
    case "cancelled":
    case "failed":
      return "\u00D7";
    case "returned":
    case "refunded":
      return "\u21A9";
    default:
      return "\u2022";
  }
};

const getTrackingStageIndex = (status) => {
  const currentIndex = trackingStages.indexOf(status);

  if (currentIndex >= 0) {
    return currentIndex;
  }

  if (status === "cancelled" || status === "returned") {
    return 0;
  }

  return -1;
};

const Account = () => {
  const { customer, orders, isAuthenticated, saveProfile, refreshOrders, signOut } = useContext(AuthContext);
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    isSubscribed: false,
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: ""
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!customer) {
      return;
    }

    setDraft({
      name: customer.name || "",
      phone: customer.phone || "",
      isSubscribed: Boolean(customer.isSubscribed),
      fullName: customer.defaultAddress?.fullName || "",
      line1: customer.defaultAddress?.line1 || "",
      line2: customer.defaultAddress?.line2 || "",
      city: customer.defaultAddress?.city || "",
      region: customer.defaultAddress?.region || "",
      postalCode: customer.defaultAddress?.postalCode || "",
      country: customer.defaultAddress?.country || ""
    });
  }, [customer]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders().catch(console.error);
    }
  }, [isAuthenticated, refreshOrders]);

  useEffect(() => {
    if (!justSaved) {
      return;
    }

    const timer = window.setTimeout(() => {
      setJustSaved(false);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [justSaved]);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveMessage("");
    setSaveError("");
    setJustSaved(false);
    const nextErrors = {};

    if (!draft.name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!draft.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    if (!draft.fullName.trim()) {
      nextErrors.fullName = "Shipping recipient is required.";
    }

    if (!draft.line1.trim()) {
      nextErrors.line1 = "Address line 1 is required.";
    }

    if (!draft.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!draft.region.trim()) {
      nextErrors.region = "Region / County is required.";
    }

    if (!draft.country.trim()) {
      nextErrors.country = "Country is required.";
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setSaveError("Please fill in all required fields.");
      setSaving(false);
      focusField(Object.keys(nextErrors)[0]);
      return;
    }

    setFieldErrors({});

    try {
      await saveProfile({
        name: draft.name,
        phone: draft.phone,
        isSubscribed: draft.isSubscribed,
        defaultAddress: {
          fullName: draft.fullName,
          line1: draft.line1,
          line2: draft.line2,
          city: draft.city,
          region: draft.region,
          postalCode: draft.postalCode,
          country: draft.country
        }
      });
      setSaveMessage("Your account details were saved successfully.");
      setJustSaved(true);
    } catch (error) {
      setSaveError(error.message || "We couldn't save your account right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={authStyles.authWrapper}>
      <Container>
        <Row className="g-4">
          <Col lg={7}>
            <Card className={authStyles.authCard}>
              <span className={authStyles.eyebrow}>My account</span>
              <h1 className={authStyles.authTitle}>Welcome back, {customer?.name}</h1>
              <p className={authStyles.authText}>Keep your profile and delivery details up to date so every new order stays linked to your account.</p>
              {saveMessage ? <div className={authStyles.successBox}>{saveMessage}</div> : null}
              {saveError ? <div className={authStyles.errorBox}>{saveError}</div> : null}
              <form className={authStyles.authForm} onSubmit={handleSubmit}>
                <Form.Control data-field="name" className={fieldErrors.name ? authStyles.invalidInput : ""} type="text" placeholder="Full name" value={draft.name} onChange={(event) => {
                  setDraft((previous) => ({ ...previous, name: event.target.value }));
                  setFieldErrors((previous) => ({ ...previous, name: "" }));
                }} />
                {fieldErrors.name ? <div className={authStyles.fieldError}>{fieldErrors.name}</div> : null}
                <Form.Control data-field="phone" className={fieldErrors.phone ? authStyles.invalidInput : ""} type="text" placeholder="Phone number" value={draft.phone} onChange={(event) => {
                  setDraft((previous) => ({ ...previous, phone: event.target.value }));
                  setFieldErrors((previous) => ({ ...previous, phone: "" }));
                }} />
                {fieldErrors.phone ? <div className={authStyles.fieldError}>{fieldErrors.phone}</div> : null}
                <Form.Control data-field="fullName" className={fieldErrors.fullName ? authStyles.invalidInput : ""} type="text" placeholder="Shipping recipient" value={draft.fullName} onChange={(event) => {
                  setDraft((previous) => ({ ...previous, fullName: event.target.value }));
                  setFieldErrors((previous) => ({ ...previous, fullName: "" }));
                }} />
                {fieldErrors.fullName ? <div className={authStyles.fieldError}>{fieldErrors.fullName}</div> : null}
                <Form.Control data-field="line1" className={fieldErrors.line1 ? authStyles.invalidInput : ""} type="text" placeholder="Address line 1" value={draft.line1} onChange={(event) => {
                  setDraft((previous) => ({ ...previous, line1: event.target.value }));
                  setFieldErrors((previous) => ({ ...previous, line1: "" }));
                }} />
                {fieldErrors.line1 ? <div className={authStyles.fieldError}>{fieldErrors.line1}</div> : null}
                <Form.Control type="text" placeholder="Address line 2" value={draft.line2} onChange={(event) => setDraft((previous) => ({ ...previous, line2: event.target.value }))} />
                <Form.Control data-field="city" className={fieldErrors.city ? authStyles.invalidInput : ""} type="text" placeholder="City" value={draft.city} onChange={(event) => {
                  setDraft((previous) => ({ ...previous, city: event.target.value }));
                  setFieldErrors((previous) => ({ ...previous, city: "" }));
                }} />
                {fieldErrors.city ? <div className={authStyles.fieldError}>{fieldErrors.city}</div> : null}
                <Form.Control data-field="region" className={fieldErrors.region ? authStyles.invalidInput : ""} type="text" placeholder="Region / County" value={draft.region} onChange={(event) => {
                  setDraft((previous) => ({ ...previous, region: event.target.value }));
                  setFieldErrors((previous) => ({ ...previous, region: "" }));
                }} />
                {fieldErrors.region ? <div className={authStyles.fieldError}>{fieldErrors.region}</div> : null}
                <Form.Control type="text" placeholder="Postal code" value={draft.postalCode} onChange={(event) => setDraft((previous) => ({ ...previous, postalCode: event.target.value }))} />
                <Form.Control data-field="country" className={fieldErrors.country ? authStyles.invalidInput : ""} type="text" placeholder="Country" value={draft.country} onChange={(event) => {
                  setDraft((previous) => ({ ...previous, country: event.target.value }));
                  setFieldErrors((previous) => ({ ...previous, country: "" }));
                }} />
                {fieldErrors.country ? <div className={authStyles.fieldError}>{fieldErrors.country}</div> : null}
                <Form.Check type="checkbox" id="accountSubscribe" checked={draft.isSubscribed} onChange={(event) => setDraft((previous) => ({ ...previous, isSubscribed: event.target.checked }))} label="Receive offers and order updates" />
                <div className={authStyles.authActions}>
                  <button type="submit" className={authStyles.submitBtn} disabled={saving}>
                    {saving ? "Saving..." : justSaved ? "Saved" : "Save account"}
                  </button>
                  <button type="button" className={authStyles.submitBtn} style={{ background: "#1b1c21" }} onClick={signOut}>
                    Sign out
                  </button>
                </div>
              </form>
            </Card>
          </Col>
          <Col lg={5}>
            <Card className={authStyles.authCard}>
              <span className={authStyles.eyebrow}>My orders</span>
              <h2 className={authStyles.authTitle} style={{ fontSize: "2rem" }}>Order history</h2>
              <p className={authStyles.authText}>Every order placed while signed in appears here and stays tied to your customer account.</p>
              <div className={authStyles.authForm}>
                {orders.length === 0 ? (
                  <div className={authStyles.helperText}>No orders yet. Your first signed-in checkout will appear here.</div>
                ) : (
                  orders.map((order) => {
                    const activeTrackingStageIndex = getTrackingStageIndex(order.status);

                    return (
                      <div key={order._id} className={authStyles.orderCard}>
                        <strong>{order.orderNumber}</strong>
                        <div className={authStyles.orderBadgeRow}>
                          <span className={getStatusBadgeClassName(order.status)}>
                            <span className={authStyles.orderBadgeIcon} aria-hidden="true">{getStatusIcon(order.status)}</span>
                            {formatStatusLabel(order.status)}
                          </span>
                          <span className={getStatusBadgeClassName(order.paymentStatus)}>
                            <span className={authStyles.orderBadgeIcon} aria-hidden="true">{getStatusIcon(order.paymentStatus)}</span>
                            {formatStatusLabel(order.paymentStatus)}
                          </span>
                        </div>
                        <div className={authStyles.accountStepper} aria-label={`Progress for ${order.orderNumber}`}>
                          {trackingStages.map((stage, index) => {
                            const isComplete = activeTrackingStageIndex > index;
                            const isCurrent = activeTrackingStageIndex === index;

                            return (
                              <div
                                key={`${order._id}-${stage}`}
                                className={[
                                  authStyles.accountStepperItem,
                                  isComplete ? authStyles.accountStepperItemComplete : "",
                                  isCurrent ? authStyles.accountStepperItemCurrent : ""
                                ].filter(Boolean).join(" ")}
                              >
                                <div className={authStyles.accountStepperMarker}>
                                  {isComplete ? "\u2713" : index + 1}
                                </div>
                                <div className={authStyles.accountStepperLabel}>{formatStatusLabel(stage)}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div className={authStyles.helperText}>${order.totalAmount}</div>
                        <div style={{ marginTop: "10px" }}>
                          <Link
                            to={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.customerEmail)}`}
                            className={authStyles.secondaryLink}
                          >
                            Track this order
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Account;
