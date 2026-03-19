import React, { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { AuthContext } from "../../context/AuthContext";
import { trackOrder } from "../../api/customerAuth";
import authStyles from "./AuthPage.module.css";

const trackingStages = [
  "unpaid",
  "to_be_shipped",
  "shipped",
  "out_for_delivery",
  "completed"
];

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

const formatDeliveryDate = (value) => {
  if (!value) {
    return "Pending estimate";
  }

  return new Date(value).toLocaleDateString();
};

const getLatestTrackingEvent = (timeline = []) => {
  if (!timeline.length) {
    return null;
  }

  return timeline[timeline.length - 1];
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

  const activeTrackingStageIndex = getTrackingStageIndex(result?.status);
  const hasExceptionState = result?.status === "cancelled" || result?.status === "returned";
  const latestTrackingEvent = getLatestTrackingEvent(result?.statusTimeline || []);

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
                <span className={getStatusBadgeClassName(result.status)}>
                  <span className={authStyles.orderBadgeIcon} aria-hidden="true">{getStatusIcon(result.status)}</span>
                  {formatStatusLabel(result.status)}
                </span>
                <span className={getStatusBadgeClassName(result.paymentStatus)}>
                  <span className={authStyles.orderBadgeIcon} aria-hidden="true">{getStatusIcon(result.paymentStatus)}</span>
                  {formatStatusLabel(result.paymentStatus)}
                </span>
              </div>
            </div>

            <div className={authStyles.timelineBlock}>
              <h3>Delivery progress</h3>
              {hasExceptionState ? (
                <div className={authStyles.stepperException}>
                  <span className={getStatusBadgeClassName(result.status)}>
                    <span className={authStyles.orderBadgeIcon} aria-hidden="true">{getStatusIcon(result.status)}</span>
                    {formatStatusLabel(result.status)}
                  </span>
                  <p>This order is no longer moving through the standard delivery stages.</p>
                </div>
              ) : null}
              <div className={authStyles.trackingStepper} aria-label="Order tracking progress">
                {trackingStages.map((stage, index) => {
                  const isComplete = activeTrackingStageIndex > index;
                  const isCurrent = activeTrackingStageIndex === index;

                  return (
                    <div
                      key={stage}
                      className={[
                        authStyles.stepperItem,
                        isComplete ? authStyles.stepperItemComplete : "",
                        isCurrent ? authStyles.stepperItemCurrent : ""
                      ].filter(Boolean).join(" ")}
                    >
                      <div className={authStyles.stepperMarker}>
                        {isComplete ? "\u2713" : index + 1}
                      </div>
                      <div className={authStyles.stepperLabel}>{formatStatusLabel(stage)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={authStyles.trackMeta}>
              <div>
                <span>Payment method</span>
                <strong>{formatStatusLabel(result.paymentMethod)}</strong>
              </div>
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
              <div>
                <span>Last update</span>
                <strong>{latestTrackingEvent ? formatTimelineDate(latestTrackingEvent.changedAt) : "Pending update"}</strong>
              </div>
            </div>

            {latestTrackingEvent ? (
              <div className={authStyles.trackNote}>
                <strong>Latest shipping update</strong>
                <p>{latestTrackingEvent.note || "Status updated"}</p>
                {latestTrackingEvent.location ? (
                  <p>
                    <strong>Current location:</strong> {latestTrackingEvent.location}
                  </p>
                ) : null}
              </div>
            ) : null}

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
                        <span className={getStatusBadgeClassName(item.status)}>
                          <span className={authStyles.orderBadgeIcon} aria-hidden="true">{getStatusIcon(item.status)}</span>
                          {formatStatusLabel(item.status)}
                        </span>
                      </strong>
                      <span>{item.note || "Status updated"}</span>
                      {item.location ? <span>Location: {item.location}</span> : null}
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
