import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import GlobalStyles from "./styles/GlobalStyles";
import { useState, useEffect } from "react";
import { supabase } from "./services/supabase";
// Import auth utils for backward compatibility
import { forceAuthRefresh, resetAllAuthStorage } from "./services/authUtils";

// Layout Components
import Layout from "./components/layout/Layout";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import AuctionDetail from "./pages/AuctionDetail";
import Auctions from "./pages/Auctions";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import UserSettings from "./pages/UserSettings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import SartlarVeKosullarPage from "./pages/SartlarVeKosullarPage";
import PaymentCallback from "./pages/PaymentCallback";
import FAQ from "./pages/FAQ";
import CookiePolicy from "./pages/CookiePolicy";
import LegalNotices from "./pages/LegalNotices";
import Security from "./pages/Security";
import KvkkAydinlatmaMetniPage from "./pages/KvkkAydinlatmaMetniPage";
import HowToUse from "./pages/HowToUse";
import Account from "./pages/Account";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";

// Re-export for backward compatibility
export { forceAuthRefresh, resetAllAuthStorage };

// Loading spinner component
const LoadingSpinner = ({ message, loadingTime, retryAction }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      gap: "12px",
      background: "var(--color-background)",
    }}
  >
    <div
      style={{
        width: "36px",
        height: "36px",
        border: "4px solid var(--color-background)",
        borderTop: "4px solid var(--color-primary)",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>

    <p
      style={{
        fontSize: "0.875rem",
        color: "var(--color-text-secondary)",
        margin: 0,
      }}
    >
      {message}
      {loadingTime > 2 && <span> ({loadingTime}s)</span>}
    </p>

    {loadingTime > 5 && (
      <button
        onClick={retryAction}
        style={{
          padding: "6px 12px",
          background: "var(--color-primary)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "8px",
          fontSize: "0.8125rem",
        }}
      >
        Yeniden Dene
      </button>
    )}

    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading, reloadUserProfile, isAuthenticated, authState } =
    useAuth();
  const [loadingTime, setLoadingTime] = useState(0);
  const [maxLoadingTime, setMaxLoadingTime] = useState(15); // Auto-retry after 15 seconds
  const [showLoading, setShowLoading] = useState(false);

  // Debug authentication state - remove this after fixing the issue
  useEffect(() => {
    console.log("[ProtectedRoute] Auth state:", {
      user: user?.email,
      authState,
      isAuthenticated,
      loading,
    });
  }, [user, authState, isAuthenticated, loading]);

  useEffect(() => {
    let timer;
    let loadingDelayTimer;

    if (loading) {
      // Only show loading spinner if loading takes more than 300ms
      loadingDelayTimer = setTimeout(() => {
        setShowLoading(true);
      }, 500);

      timer = setInterval(() => {
        setLoadingTime((prev) => {
          // Auto-retry after maxLoadingTime seconds
          if (prev + 1 >= maxLoadingTime) {
            console.log("Auto-retrying profile load after timeout");
            reloadUserProfile();
            return 0; // Reset timer after auto-retry
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setLoadingTime(0);
      setShowLoading(false);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(loadingDelayTimer);
    };
  }, [loading, reloadUserProfile, maxLoadingTime]);

  const handleRetry = () => {
    console.log("Manual retry of profile loading");
    setLoadingTime(0);
    reloadUserProfile();
    // Increase timeout for next retry
    setMaxLoadingTime((prev) => Math.min(prev + 5, 30));
  };

  if (loading && showLoading) {
    return (
      <LoadingSpinner
        message="Oturum bilgileri yükleniyor..."
        loadingTime={loadingTime}
        retryAction={handleRetry}
      />
    );
  }

  // Check if user is not authenticated and not loading
  if (!isAuthenticated && !loading) {
    console.log(
      "[ProtectedRoute] User not authenticated, redirecting to login"
    );
    return <Navigate to="/login" />;
  }

  // If still loading but not showing spinner yet, render nothing to avoid flicker
  if (loading) {
    return null;
  }

  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading, isAuthenticated } = useAuth();

  // Debug admin authentication
  useEffect(() => {
    console.log("[AdminRoute] Auth state:", {
      user: user?.email,
      isAuthenticated,
      isAdmin,
      loading,
    });
  }, [user, isAuthenticated, isAdmin, loading]);

  // If not authenticated and not loading, redirect to login
  if (!isAuthenticated && !loading) {
    console.log("[AdminRoute] User not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Show spinner while loading authentication
  if (loading) {
    return (
      <LoadingSpinner message="Yetki kontrolü yapılıyor..." loadingTime={0} />
    );
  }

  // If authenticated but not admin, redirect
  if (isAuthenticated && !isAdmin) {
    console.log("[AdminRoute] User is not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" />;
  }

  // Otherwise render the admin UI
  return children;
};

// Auth Layout (without navbar/footer for auth pages)
const AuthLayout = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--color-background)",
        padding: "1rem",
      }}
    >
      {children}
    </div>
  );
};

const App = () => {
  // Handle the Supabase email confirmation auth state
  const [handlingRedirect, setHandlingRedirect] = useState(true);
  const [paymentForAuctionDetails, setPaymentForAuctionDetails] = useState({
    isSuccessful: false,
    auctionId: "",
  });

  useEffect(() => {
    // Failsafe: Set a maximum timeout for handling redirects
    const failSafeTimer = setTimeout(() => {
      console.log("[App] Failsafe triggered - force ending redirect handling");
      setHandlingRedirect(false);
    }, 10000); // 10 seconds max

    // Check for access_token in the URL to detect returning from email confirmation
    if (window.location.hash && window.location.hash.includes("access_token")) {
      console.log("[App] Detected auth redirect, handling session");
      console.log("[App] FULL HASH:", window.location.hash); // Log the full hash to inspect

      // Check if this redirect has already been handled by our reset password flow
      if (localStorage.getItem("redirected_to_reset") === "true") {
        const redirectTime = parseInt(
          localStorage.getItem("redirect_time") || "0",
          10
        );
        const timeElapsed = Date.now() - redirectTime;

        // If redirected within the last 10 seconds, skip normal auth processing
        if (timeElapsed < 10000) {
          console.log(
            "[App] This redirect was already handled by reset password flow, skipping normal auth processing"
          );
          clearTimeout(failSafeTimer);
          setHandlingRedirect(false);
          return;
        } else {
          // Clear old redirect info
          localStorage.removeItem("redirected_to_reset");
          localStorage.removeItem("redirect_time");
        }
      }

      // Check if this is a password reset link even without type=recovery
      const isLikelyPasswordReset =
        window.location.hash.includes("type=") &&
        (window.location.hash.includes("recovery") ||
          window.location.hash.includes("passwordReset"));

      if (isLikelyPasswordReset) {
        console.log("[App] This appears to be a password reset link");

        // If we're not already on the reset-password page, redirect there
        if (window.location.pathname !== "/reset-password") {
          console.log("[App] Redirecting to reset-password page with hash");
          window.location.href = `/reset-password${window.location.hash}`;
          clearTimeout(failSafeTimer);
          return; // Stop processing
        }
      }

      // Store timestamp of email confirmation redirect
      localStorage.setItem("auth_redirect_detected", Date.now().toString());

      // Handle the session from the URL
      supabase.auth
        .getSession()
        .then(({ data }) => {
          clearTimeout(failSafeTimer); // Clear the failsafe timer on success

          if (data?.session) {
            console.log("[App] Successfully retrieved session from URL");

            // Store user ID for debugging
            if (data.session.user) {
              localStorage.setItem(
                "auth_redirect_user_id",
                data.session.user.id
              );
            }

            // Ensure all auth systems are updated
            forceAuthRefresh()
              .then(() => {
                console.log("[App] Auth refresh completed after redirect");
                localStorage.setItem(
                  "auth_redirect_success",
                  Date.now().toString()
                );
              })
              .catch((refreshError) => {
                console.error(
                  "[App] Error refreshing auth state:",
                  refreshError
                );
                localStorage.setItem(
                  "auth_redirect_error",
                  JSON.stringify({
                    time: Date.now(),
                    message: refreshError.message,
                  })
                );
              })
              .finally(() => {
                // Always clean up the URL and finish redirect handling
                window.history.replaceState(
                  null,
                  document.title,
                  window.location.pathname
                );
                setHandlingRedirect(false);
              });
          } else {
            console.log("[App] No session found in URL");
            localStorage.setItem(
              "auth_redirect_no_session",
              Date.now().toString()
            );
            setHandlingRedirect(false);
          }
        })
        .catch((error) => {
          clearTimeout(failSafeTimer); // Clear the failsafe timer on error
          console.error("[App] Error handling auth redirect:", error);
          localStorage.setItem(
            "auth_redirect_critical_error",
            JSON.stringify({
              time: Date.now(),
              message: error.message,
            })
          );
          setHandlingRedirect(false);
        });
    } else {
      // No redirect detected, continue normally
      clearTimeout(failSafeTimer); // Clear the failsafe timer
      setHandlingRedirect(false);
    }

    return () => {
      clearTimeout(failSafeTimer); // Cleanup on unmount
    };
  }, []);

  // Initialize auction service
  useEffect(() => {
    // Dynamic import to prevent circular dependencies
    import("./services/auctionService")
      .then(({ setupBackgroundRefresh }) => {
        if (typeof setupBackgroundRefresh === "function") {
          console.log("[App] Setting up auction background refresh");
          setupBackgroundRefresh();
        }
      })
      .catch((error) => {
        console.error("[App] Failed to initialize auction service:", error);
      });
  }, []);

  // Add a special effect to handle auth tokens directly
  useEffect(() => {
    // Check for any auth tokens in URL that might be password reset links
    if (window.location.hash && window.location.hash.includes("access_token")) {
      console.log("[App] AUTH TOKEN DETECTED in hash:", window.location.hash);

      // Store for debugging
      localStorage.setItem("last_auth_hash", window.location.hash);

      // Parse the hash to extract the token type
      try {
        let tokenType = null;
        window.location.hash
          .substring(1)
          .split("&")
          .forEach((item) => {
            const [key, value] = item.split("=");
            if (key === "type") {
              tokenType = decodeURIComponent(value);
            }
          });

        console.log("[App] Token type:", tokenType);

        // Only redirect to reset-password if it's a recovery/passwordReset token
        const isPasswordReset =
          tokenType === "recovery" || tokenType === "passwordReset";

        if (isPasswordReset && window.location.pathname !== "/reset-password") {
          console.log(
            "[App] Password reset token detected, redirecting to reset-password page"
          );

          // Store redirect info
          localStorage.setItem("redirected_to_reset", "true");
          localStorage.setItem("redirect_time", Date.now().toString());

          // Redirect to reset password page with the hash
          const fullResetUrl = `/reset-password${window.location.hash}`;
          console.log("[App] Redirecting to:", fullResetUrl);
          window.location.replace(fullResetUrl);
        } else if (
          tokenType === "signup" ||
          tokenType === "email_confirmation" ||
          tokenType === "magiclink"
        ) {
          console.log(
            "[App] Email confirmation token detected, redirecting to homepage"
          );

          // Allow the component to finish processing the token first
          setTimeout(() => {
            // Redirect to home page after token processing
            if (window.location.pathname !== "/") {
              window.location.href = "/";
            }
          }, 1000);
        } else {
          console.log(
            "[App] Already on appropriate page or unknown token type"
          );
        }
      } catch (e) {
        console.error("[App] Error parsing hash parameters:", e);
      }
    }
  }, []);

  // Show a loading spinner if we're handling an email confirmation redirect
  if (handlingRedirect) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
          background: "var(--color-background)",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid var(--color-background)",
            borderTop: "5px solid var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p>E-posta doğrulaması işleniyor...</p>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <AuthProvider>
      <GlobalStyles />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthLayout>
                <SignupPage />
              </AuthLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthLayout>
                <ResetPasswordPage />
              </AuthLayout>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserSettings />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminRoute>
            }
          />

          {/* Public Routes */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />
          <Route
            path="/account"
            element={
              <Layout>
                <Account />
              </Layout>
            }
          />
          <Route
            path="/search"
            element={
              <Layout>
                <Search />
              </Layout>
            }
          />
          <Route
            path="/favorites"
            element={
              <Layout>
                <Favorites />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout>
                <Contact />
              </Layout>
            }
          />
          <Route
            path="/auctions"
            element={
              <Layout>
                <Auctions />
              </Layout>
            }
          />
          <Route
            path="/auctions/:id"
            element={
              <Layout>
                <AuctionDetail
                  paymentForAuctionDetails={paymentForAuctionDetails}
                  setPaymentForAuctionDetails={setPaymentForAuctionDetails}
                />
              </Layout>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <Layout>
                <PrivacyPolicy />
              </Layout>
            }
          />
          <Route
            path="/terms-of-use"
            element={
              <Layout>
                <TermsOfUse />
              </Layout>
            }
          />
          <Route
            path="/sartlar-ve-kosullar"
            element={
              <Layout>
                <SartlarVeKosullarPage />
              </Layout>
            }
          />
          <Route
            path="/payment-callback"
            element={
              <Layout>
                <PaymentCallback
                  setPaymentForAuctionDetails={setPaymentForAuctionDetails}
                />
              </Layout>
            }
          />
          <Route
            path="/sss"
            element={
              <Layout>
                <FAQ />
              </Layout>
            }
          />
          <Route
            path="/how-to-use"
            element={
              <Layout>
                <HowToUse />
              </Layout>
            }
          />
          <Route
            path="/cookie-policy"
            element={
              <Layout>
                <CookiePolicy />
              </Layout>
            }
          />
          <Route
            path="/legal"
            element={
              <Layout>
                <LegalNotices />
              </Layout>
            }
          />
          <Route
            path="/security"
            element={
              <Layout>
                <Security />
              </Layout>
            }
          />
          <Route
            path="/kvkk-aydinlatma-metni"
            element={
              <Layout>
                <KvkkAydinlatmaMetniPage />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
