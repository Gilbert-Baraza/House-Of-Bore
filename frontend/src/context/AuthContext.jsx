import React, { createContext, useEffect, useState } from "react";
import {
  fetchCustomerProfile,
  fetchMyOrders,
  loginCustomer,
  signupCustomer,
  updateCustomerProfile
} from "../api/customerAuth";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  const persistSession = (payload) => {
    localStorage.setItem("customer_token", payload.token);
    localStorage.setItem("customer_profile", JSON.stringify(payload.data));
    setCustomer(payload.data);
  };

  const clearSession = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_profile");
    setCustomer(null);
    setOrders([]);
  };

  const refreshProfile = async () => {
    const profile = await fetchCustomerProfile();
    setCustomer(profile.data);
    localStorage.setItem("customer_profile", JSON.stringify(profile.data));
    return profile.data;
  };

  const refreshOrders = async () => {
    const payload = await fetchMyOrders();
    setOrders(payload.data || []);
    return payload.data || [];
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem("customer_token");
      const storedProfile = localStorage.getItem("customer_profile");

      if (storedProfile) {
        try {
          setCustomer(JSON.parse(storedProfile));
        } catch {
          localStorage.removeItem("customer_profile");
        }
      }

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        await Promise.all([refreshProfile(), refreshOrders()]);
      } catch (error) {
        clearSession();
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const signUp = async (values) => {
    const payload = await signupCustomer(values);
    persistSession(payload);
    await refreshOrders();
    return payload.data;
  };

  const signIn = async (values) => {
    const payload = await loginCustomer(values);
    persistSession(payload);
    await refreshOrders();
    return payload.data;
  };

  const signOut = () => {
    clearSession();
  };

  const saveProfile = async (values) => {
    const payload = await updateCustomerProfile(values);
    setCustomer(payload.data);
    localStorage.setItem("customer_profile", JSON.stringify(payload.data));
    return payload.data;
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        orders,
        authLoading,
        isAuthenticated: Boolean(customer),
        signUp,
        signIn,
        signOut,
        refreshProfile,
        refreshOrders,
        saveProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
