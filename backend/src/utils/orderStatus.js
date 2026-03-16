const ORDER_STATUSES = [
  "unpaid",
  "to_be_shipped",
  "shipped",
  "out_for_delivery",
  "completed",
  "cancelled",
  "returned"
];

const LEGACY_STATUS_MAP = {
  pending: "unpaid",
  paid: "to_be_shipped",
  processing: "to_be_shipped",
  packed: "to_be_shipped",
  delivered: "completed",
  shipped: "shipped",
  cancelled: "cancelled"
};

const normalizeOrderStatus = (status, paymentStatus = "") => {
  if (!status) {
    return paymentStatus === "paid" ? "to_be_shipped" : "unpaid";
  }

  if (ORDER_STATUSES.includes(status)) {
    return status;
  }

  if (status === "pending" && paymentStatus === "paid") {
    return "to_be_shipped";
  }

  return LEGACY_STATUS_MAP[status] || status;
};

const normalizeTimelineStatus = (status) => {
  if (!status) {
    return "unpaid";
  }

  if (ORDER_STATUSES.includes(status)) {
    return status;
  }

  return LEGACY_STATUS_MAP[status] || status;
};

module.exports = {
  ORDER_STATUSES,
  normalizeOrderStatus,
  normalizeTimelineStatus
};
