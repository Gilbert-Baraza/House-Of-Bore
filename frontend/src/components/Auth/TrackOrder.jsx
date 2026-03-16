import React, { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { AuthContext } from "../../context/AuthContext";
import { trackOrder } from "../../api/customerAuth";
import authStyles from "./AuthPage.module.css";

const formatTimelineDate = (value) => {
  if (!value) {
    return "Just now";
  }

  return new Date(value).toLocaleString();
};

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

const formatDeliveryDate = (value) => {
  if (!value) {
    return "Pending estimate";
  }

  return new Date(value).toLocaleDateString();
};

const TrackOrder = () => {
  const { customer } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({
    orderNumber: searchParams.get("orderNumber") || "",
    email: searchParams.get("email") || customer?.email || ""
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer?.email && !searchParams.get("email")) {
      setForm((previous) => ({ ...previous, email: customer.email }));
    }
  }, [customer?.email, searchParams]);

  const lookupOrder = async (values) => {
    setLoading(true);
    setError("");

    try {
      const payload = await trackOrder(values);
      setResult(payload.data);
      setSearchParams({
        orderNumber: values.orderNumber,
        email: values.email
      });
    } catch (requestError) {
      setResult(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const orderNumber = searchParams.get("orderNumber");
    const email = searchParams.get("email");

    if (!orderNumber || !email) {
      return;
    }

    const runLookup = async () => {
      setLoading(true);
      setError("");

      try {
        const payload = await trackOrder({ orderNumber, email });
        setResult(payload.data);
      } catch (requestError) {
        setResult(null);
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    runLookup().catch(console.error);
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await lookupOrder(form);
  };

  return (
    <section className={authStyles.authWrapper}>
      <div className={`${authStyles.authCard} ${authStyles.trackCard}`}>
        <span className={authStyles.eyebrow}>Track your order</span>
        <h1 className={authStyles.authTitle}>Order tracking</h1>
        <p className={authStyles.authText}>Enter your order number and email to see the latest fulfillment progress, tracking details, and timeline updates.</p>

        <form className={authStyles.authForm} onSubmit={handleSubmit}>
          <Form.Control
            type="text"
            placeholder="Order number"
            value={form.orderNumber}
            onChange={(event) => setForm((previous) => ({ ...previous, orderNumber: event.target.value }))}
          />
          <Form.Control
            type="email"
            placeholder="Email used at checkout"
            value={form.email}
            onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
          />
          {error ? <div className={authStyles.errorBox}>{error}</div> : null}
          <button type="submit" className={authStyles.submitBtn} disabled={loading}>
            {loading ? "Checking order..." : "Track order"}
          </button>
        </form>

        {result ? (
          <div className={authStyles.trackPanel}>
            <div className={authStyles.trackHeader}>
              <div>
                <strong>{result.orderNumber}</strong>
                <div className={authStyles.helperText}>{result.customerName}</div>
              </div>
              <div className={authStyles.statusPills}>
                <span className={getStatusBadgeClassName(result.status)}>{formatStatusLabel(result.status)}</span>
                <span className={getStatusBadgeClassName(result.paymentStatus)}>{formatStatusLabel(result.paymentStatus)}</span>
              </div>
            </div>

            <div className={authStyles.trackMeta}>
              <div>
                <span>Delivery</span>
                <strong>{formatStatusLabel(result.deliveryMethod)}</strong>
              </div>
              <div>
                <span>Courier</span>
                <strong>{result.courierName || "Pending assignment"}</strong>
              </div>
              <div>
                <span>Tracking</span>
                <strong>{result.trackingNumber || "Pending assignment"}</strong>
              </div>
              <div>
                <span>Estimated delivery</span>
                <strong>{formatDeliveryDate(result.estimatedDeliveryDate)}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>${result.totalAmount}</strong>
              </div>
            </div>

            {result.courierTrackingUrl ? (
              <div className={authStyles.trackNote}>
                <strong>Courier tracking link</strong>
                <p>
                  <a
                    href={result.courierTrackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={authStyles.secondaryLink}
                  >
                    Open live courier tracking
                  </a>
                </p>
              </div>
            ) : null}

            {result.fulfillmentNotes ? (
              <div className={authStyles.trackNote}>
                <strong>Fulfillment note</strong>
                <p>{result.fulfillmentNotes}</p>
              </div>
            ) : null}

            <div className={authStyles.timelineBlock}>
              <h3>Tracking timeline</h3>
              <div className={authStyles.timelineList}>
                {(result.statusTimeline || []).map((item, index) => (
                  <div key={`${item.status}-${index}`} className={authStyles.timelineItem}>
                    <div>
                      <strong>
                        <span className={getStatusBadgeClassName(item.status)}>{formatStatusLabel(item.status)}</span>
                      </strong>
                      <span>{item.note || "Status updated"}</span>
                    </div>
                    <span>{formatTimelineDate(item.changedAt)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={authStyles.timelineBlock}>
              <h3>Items in this order</h3>
              <div className={authStyles.orderItems}>
                {(result.items || []).map((item, index) => (
                  <div key={`${item.title}-${index}`} className={authStyles.orderItem}>
                    <div>
                      <strong>{item.title}</strong>
                      <div className={authStyles.helperText}>
                        Qty {item.quantity}
                        {item.selectedColor ? ` / ${item.selectedColor}` : ""}
                        {item.selectedSize ? ` / ${item.selectedSize}` : ""}
                      </div>
                    </div>
                    <span>${item.unitPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={authStyles.helperText}>
              Signed in? <Link to="/account" className={authStyles.secondaryLink}>Go to your account</Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default TrackOrder;
