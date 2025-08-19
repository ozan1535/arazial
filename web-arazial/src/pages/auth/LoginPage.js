import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";

// Debug flag - set to true to enable login page logs
const DEBUG = process.env.NODE_ENV === "development" && true;

// Simple debug logger that only logs when DEBUG is true
const debug = (message, ...args) => {
  if (DEBUG) {
    console.log(message, ...args);
  }
};

const AuthContainer = styled.div`
  max-width: 450px;
  width: 100%;
  align-self: flex-start;
`;

const AuthHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;

  svg {
    height: 3rem;
    width: 3rem;
    color: var(--color-primary);
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: var(--color-primary);
  font-size: 0.875rem;
  text-decoration: none;
  margin-bottom: 1.5rem;
  font-weight: 500;

  svg {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const ErrorMessage = styled.div`
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: var(--border-radius-md);
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #b91c1c;
  font-size: 0.875rem;
`;

const FormFooter = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  background-color: lightblue;
  padding: 0.5rem 1rem;
  border-radius: 5px;

  a {
    color: var(--color-primary);
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;
const PhoneInputItem = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid
    ${(props) => (props.error ? "var(--color-error)" : "var(--color-border)")};
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color 0.2s;
  background-color: var(--color-surface);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

const PhoneInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const CountryCode = styled.div`
  padding: 0.5rem;
  background-color: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-right: none;
  border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
  font-size: 1rem;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PhoneInput = styled(PhoneInputItem)`
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
`;

const Header = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PasswordInputWrapper = styled.div`
  position: relative;

  /* Make the input component take full width */
  & > div {
    width: 100%;
  }

  /* Style the input to account for the button space */
  & input {
    padding-right: 45px;
  }

  /* Position the eye button relative to the input field */
  & > button {
    /* This positions relative to the input field, not the wrapper */
    top: 38px !important;
    transform: none !important;
  }
`;

const EyeButton = ({ isVisible, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--color-text-secondary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "24px",
      width: "24px",
      padding: 0,
      zIndex: 5,
      pointerEvents: "auto",
    }}
  >
    {isVisible ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )}
  </button>
);

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  const { signIn, error, user, loading, authState, isAuthenticated } =
    useAuth();
  const navigate = useNavigate();

  // Direct debug for component state
  console.log("[LoginPage] Render state:", {
    user: user?.email,
    isAdmin: user?.role === "admin",
    loading,
    authState,
    isAuthenticated,
    loginAttempted,
    hasError: !!error,
  });

  // Watch for successful login and navigate accordingly
  useEffect(() => {
    // Check if we should navigate - user is authenticated and login was attempted
    if (loginAttempted && isAuthenticated) {
      console.log("[LoginPage] Auth conditions met, navigating to home:", {
        loginAttempted,
        authState,
        user: user?.email,
      });

      // Force navigation directly
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loginAttempted, authState, user, navigate]);

  // Handle phone number input validation
  const handlePhoneNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
    if (input.length <= 10) {
      setPhoneNumber(input);

      // Clear errors when input changes
      if (errors.phoneNumber || errors.general) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: undefined,
          general: undefined,
        }));
      }
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);

    // Clear errors when input changes
    if (errors.password || errors.general) {
      setErrors((prev) => ({
        ...prev,
        password: undefined,
        general: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!phoneNumber) {
      newErrors.phoneNumber = "Telefon numaranızı giriniz";
    } else if (phoneNumber.length !== 10 || !phoneNumber.startsWith("5")) {
      newErrors.phoneNumber =
        "Geçerli bir telefon numarası giriniz (5XX XXX XX XX)";
    }

    if (!password) {
      newErrors.password = "Şifrenizi giriniz";
    } else if (password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setLoginAttempted(false);

    try {
      // Format phone number for authentication
      const formattedPhone = `90${phoneNumber}`;
      const phoneBasedEmail = `${formattedPhone}@phone.arazial.com`;

      console.log(
        "[LoginPage] Attempting to sign in with phone:",
        phoneBasedEmail
      );
      localStorage.setItem("phone_login_attempt", phoneBasedEmail);

      let loginSuccess = false;

      try {
        // Try to sign in using the phone-email format
        console.log("[LoginPage] Trying primary sign in method");
        const data = await signIn(phoneBasedEmail, password);

        // Update login timestamp
        localStorage.setItem("auth_last_login", Date.now().toString());
        localStorage.setItem("phone_login_success", Date.now().toString());

        if (data?.session?.user) {
          console.log(
            "[LoginPage] Phone sign in successful with user ID:",
            data.session.user.id
          );
          loginSuccess = true;
          setLoginAttempted(true);
        }
      } catch (primaryError) {
        console.error("[LoginPage] Primary phone sign in error:", primaryError);
        // Handle error consistently with Turkish message
        if (primaryError.message === "Invalid login credentials") {
          setErrors({ general: "Geçersiz giriş bilgileri" });
          return;
        }
      }

      // If first attempt failed, try direct login
      if (!loginSuccess) {
        try {
          console.log("[LoginPage] Trying direct Supabase sign in");
          const { data: directSignIn, error: directSignInError } =
            await supabase.auth.signInWithPassword({
              email: phoneBasedEmail,
              password,
            });

          if (directSignInError) {
            console.error(
              "[LoginPage] Direct phone sign in error:",
              directSignInError
            );

            // Check for specific errors and provide helpful Turkish feedback
            if (directSignInError.message.includes("email/password")) {
              setErrors({
                general:
                  "Bu telefon numarası ile kayıtlı bir hesap bulunamadı veya şifre hatalı",
              });
            } else if (
              directSignInError.message === "Invalid login credentials"
            ) {
              setErrors({
                general: "Geçersiz giriş bilgileri",
              });
            } else {
              // Never show the raw error message
              setErrors({
                general: "Giriş yapılırken bir hata oluştu",
              });
            }
          } else if (directSignIn?.session) {
            console.log(
              "[LoginPage] Direct phone sign in successful:",
              directSignIn.session.user.id
            );
            loginSuccess = true;
            setLoginAttempted(true);
          }
        } catch (directError) {
          console.error("[LoginPage] Direct sign in exception:", directError);
          setErrors({ general: "Giriş yapılırken bir hata oluştu" });
        }
      }

      // Try with + prefix if all else failed
      if (!loginSuccess) {
        try {
          // Try with + prefix
          const alternateEmail = `+${formattedPhone}@phone.arazial.com`;
          console.log(
            "[LoginPage] Trying with alternate email format:",
            alternateEmail
          );

          const { data: altSignIn, error: altSignInError } =
            await supabase.auth.signInWithPassword({
              email: alternateEmail,
              password,
            });

          if (!altSignInError && altSignIn?.session) {
            loginSuccess = true;
            console.log("[LoginPage] Alternate email sign-in successful");
            setLoginAttempted(true);
          } else if (altSignInError) {
            console.error(
              "[LoginPage] Alternative sign-in error:",
              altSignInError
            );
          }
        } catch (altError) {
          console.error("[LoginPage] Alternative sign-in exception:", altError);
        }
      }

      if (!loginSuccess) {
        // If we get here, all login attempts failed
        setErrors({
          general:
            "Giriş işlemi başarısız oldu. Lütfen telefon numaranızı ve şifrenizi kontrol edin.",
        });
      }
    } catch (error) {
      console.error("[LoginPage] Phone login error:", error);
      setErrors({
        general:
          "Giriş sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthContainer>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Link to="/">
          <span>Geç</span>
        </Link>
      </div>

      {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}

      <AuthForm onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <PhoneInputContainer>
          <CountryCode>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="18"
              viewBox="0 0 900 600"
            >
              <path d="M0 0h900v600H0z" fill="#e30a17" />
              <path
                d="m417.504 300 135.68-44.078-83.86 115.41V228.668l83.86 115.41Zm9.25 80.21c-35.7 56.415-104.387 82.446-168.508 63.86C194.125 425.488 150 366.762 150 300s44.125-125.488 108.246-144.07c64.121-18.586 132.809 7.445 168.508 63.86-33.223-36.97-85.797-49.63-132.203-31.84C248.14 205.737 217.5 250.296 217.5 300s30.64 94.262 77.05 112.05c46.407 17.79 98.981 5.13 132.204-31.84"
                fill="#fff"
              />
            </svg>
            +90
          </CountryCode>
          <PhoneInput
            id="phoneNumber"
            type="tel"
            placeholder="Telefon Numaranız"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            error={errors.phoneNumber}
          />
        </PhoneInputContainer>
        {errors.phoneNumber && (
          <div
            style={{
              color: "var(--color-error)",
              fontSize: "0.75rem",
              marginTop: "0.25rem",
            }}
          >
            {errors.phoneNumber}
          </div>
        )}
        <PasswordInputWrapper>
          <Input
            id="password"
            placeholder="Parolanız"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            error={errors.password}
            style={{ marginTop: "1.5rem" }}
          />
          <EyeButton
            isVisible={showPassword}
            onClick={togglePasswordVisibility}
          />
        </PasswordInputWrapper>

        <div style={{ textAlign: "right" }}>
          <Link
            to={`/forgot-password?phone=${encodeURIComponent(phoneNumber)}`}
            style={{ fontSize: "0.875rem" }}
          >
            Şifremi unuttum
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isLoading}>
          {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </Button>
      </AuthForm>

      <FormFooter>
        Hesabın yok mu? <br />
        <Link to="/signup" style={{ fontWeight: "bold" }}>
          Hemen arazialcom'a katıl
        </Link>
      </FormFooter>
    </AuthContainer>
  );
};

export default LoginPage;
