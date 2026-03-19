const formatTimestamp = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");
};

const normalizeMpesaPhoneNumber = (value = "") => {
  const digits = String(value).replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("254") && digits.length === 12) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }

  if (digits.startsWith("7") && digits.length === 9) {
    return `254${digits}`;
  }

  if (digits.startsWith("1") && digits.length === 9) {
    return `254${digits}`;
  }

  return "";
};

const getMpesaConfig = () => {
  const environment = process.env.MPESA_ENV === "production" ? "production" : "sandbox";
  const baseUrl =
    environment === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  return {
    environment,
    baseUrl,
    consumerKey: process.env.MPESA_CONSUMER_KEY || "",
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
    shortcode: process.env.MPESA_SHORTCODE || "",
    passkey: process.env.MPESA_PASSKEY || "",
    callbackUrl: process.env.MPESA_CALLBACK_URL || "",
    accountReference: process.env.MPESA_ACCOUNT_REFERENCE || "HOUSE-OF-BORE",
    transactionDesc: process.env.MPESA_TRANSACTION_DESC || "House of bore payment"
  };
};

const hasLiveMpesaConfig = (config) =>
  Boolean(
    config.consumerKey &&
      config.consumerSecret &&
      config.shortcode &&
      config.passkey &&
      config.callbackUrl
  );

const getMpesaAccessToken = async (config) => {
  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
  const response = await fetch(`${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${auth}`
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.errorMessage || "Unable to get M-Pesa access token");
  }

  return payload.access_token;
};

const initiateMpesaPayment = async ({ orderNumber, amount, phoneNumber }) => {
  const config = getMpesaConfig();
  const normalizedPhone = normalizeMpesaPhoneNumber(phoneNumber);

  if (!normalizedPhone) {
    throw new Error("Enter a valid Kenyan M-Pesa phone number");
  }

  if (!hasLiveMpesaConfig(config)) {
    return {
      mode: "demo",
      success: true,
      merchantRequestId: `demo-merchant-${orderNumber}`,
      checkoutRequestId: `demo-checkout-${orderNumber}`,
      responseCode: "0",
      responseDescription: "Demo M-Pesa flow enabled because API credentials are not configured",
      customerMessage: `Demo M-Pesa request prepared for ${normalizedPhone}. Add Safaricom credentials to send real STK pushes.`,
      phoneNumber: normalizedPhone
    };
  }

  const timestamp = formatTimestamp();
  const password = Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString("base64");
  const token = await getMpesaAccessToken(config);
  const response = await fetch(`${config.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.max(1, Math.round(amount)),
      PartyA: normalizedPhone,
      PartyB: config.shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: config.callbackUrl,
      AccountReference: `${config.accountReference}-${orderNumber}`.slice(0, 20),
      TransactionDesc: config.transactionDesc
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.ResponseCode !== "0") {
    throw new Error(payload.errorMessage || payload.ResponseDescription || "Unable to initiate M-Pesa payment");
  }

  return {
    mode: "live",
    success: true,
    merchantRequestId: payload.MerchantRequestID || "",
    checkoutRequestId: payload.CheckoutRequestID || "",
    responseCode: payload.ResponseCode,
    responseDescription: payload.ResponseDescription || "",
    customerMessage: payload.CustomerMessage || "M-Pesa prompt sent successfully",
    phoneNumber: normalizedPhone
  };
};

module.exports = {
  getMpesaConfig,
  hasLiveMpesaConfig,
  initiateMpesaPayment,
  normalizeMpesaPhoneNumber
};
