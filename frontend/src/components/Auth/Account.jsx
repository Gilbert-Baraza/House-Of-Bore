import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { AuthContext } from "../../context/AuthContext";
import authStyles from "./AuthPage.module.css";

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

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

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
              <form className={authStyles.authForm} onSubmit={handleSubmit}>
                <Form.Control type="text" placeholder="Full name" value={draft.name} onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))} />
                <Form.Control type="text" placeholder="Phone number" value={draft.phone} onChange={(event) => setDraft((previous) => ({ ...previous, phone: event.target.value }))} />
                <Form.Control type="text" placeholder="Shipping recipient" value={draft.fullName} onChange={(event) => setDraft((previous) => ({ ...previous, fullName: event.target.value }))} />
                <Form.Control type="text" placeholder="Address line 1" value={draft.line1} onChange={(event) => setDraft((previous) => ({ ...previous, line1: event.target.value }))} />
                <Form.Control type="text" placeholder="Address line 2" value={draft.line2} onChange={(event) => setDraft((previous) => ({ ...previous, line2: event.target.value }))} />
                <Form.Control type="text" placeholder="City" value={draft.city} onChange={(event) => setDraft((previous) => ({ ...previous, city: event.target.value }))} />
                <Form.Control type="text" placeholder="Region / County" value={draft.region} onChange={(event) => setDraft((previous) => ({ ...previous, region: event.target.value }))} />
                <Form.Control type="text" placeholder="Postal code" value={draft.postalCode} onChange={(event) => setDraft((previous) => ({ ...previous, postalCode: event.target.value }))} />
                <Form.Control type="text" placeholder="Country" value={draft.country} onChange={(event) => setDraft((previous) => ({ ...previous, country: event.target.value }))} />
                <Form.Check type="checkbox" id="accountSubscribe" checked={draft.isSubscribed} onChange={(event) => setDraft((previous) => ({ ...previous, isSubscribed: event.target.checked }))} label="Receive offers and order updates" />
                <div className={authStyles.authActions}>
                  <button type="submit" className={authStyles.submitBtn} disabled={saving}>
                    {saving ? "Saving..." : "Save account"}
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
                  orders.map((order) => (
                    <div key={order._id} className={authStyles.orderCard}>
                      <strong>{order.orderNumber}</strong>
                      <div className={authStyles.orderBadgeRow}>
                        <span className={getStatusBadgeClassName(order.status)}>{formatStatusLabel(order.status)}</span>
                        <span className={getStatusBadgeClassName(order.paymentStatus)}>{formatStatusLabel(order.paymentStatus)}</span>
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
                  ))
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
