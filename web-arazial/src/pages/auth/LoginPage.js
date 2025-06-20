import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

// Debug flag - set to true to enable login page logs
const DEBUG = process.env.NODE_ENV === 'development' && true;

// Simple debug logger that only logs when DEBUG is true
const debug = (message, ...args) => {
  if (DEBUG) {
    console.log(message, ...args);
  }
};

const AuthContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
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
  gap: 1rem;
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
  
  a {
    color: var(--color-primary);
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PhoneInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`;

const CountryCode = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 1rem;
  border: 1.2px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.875rem;
  color: var(--color-text);
  background-color: var(--color-bg-secondary);
  margin-top: 0;
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
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--color-text-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '24px',
      width: '24px',
      padding: 0,
      zIndex: 5,
      pointerEvents: 'auto'
    }}
  >
    {isVisible ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )}
  </button>
);

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  
  const { signIn, error, user, loading, authState, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Direct debug for component state
  console.log('[LoginPage] Render state:', { 
    user: user?.email, 
    isAdmin: user?.role === 'admin',
    loading,
    authState,
    isAuthenticated,
    loginAttempted,
    hasError: !!error
  });

  // Watch for successful login and navigate accordingly
  useEffect(() => {
    // Check if we should navigate - user is authenticated and login was attempted
    if (loginAttempted && isAuthenticated) {
      console.log('[LoginPage] Auth conditions met, navigating to home:', {
        loginAttempted,
        authState,
        user: user?.email,
      });
      
      // Force navigation directly
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loginAttempted, authState, user, navigate]);
  
  // Handle phone number input validation
  const handlePhoneNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    if (input.length <= 10) {
      setPhoneNumber(input);
      
      // Clear errors when input changes
      if (errors.phoneNumber || errors.general) {
        setErrors(prev => ({
          ...prev,
          phoneNumber: undefined,
          general: undefined
        }));
      }
    }
  };
  
  // Handle password change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    
    // Clear errors when input changes
    if (errors.password || errors.general) {
      setErrors(prev => ({
        ...prev,
        password: undefined,
        general: undefined
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Telefon numaranızı giriniz';
    } else if (phoneNumber.length !== 10 || !phoneNumber.startsWith('5')) {
      newErrors.phoneNumber = 'Geçerli bir telefon numarası giriniz (5XX XXX XX XX)';
    }
    
    if (!password) {
      newErrors.password = 'Şifrenizi giriniz';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
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
      
      console.log('[LoginPage] Attempting to sign in with phone:', phoneBasedEmail);
      localStorage.setItem('phone_login_attempt', phoneBasedEmail);
      
      let loginSuccess = false;
      
      try {
        // Try to sign in using the phone-email format
        console.log('[LoginPage] Trying primary sign in method');
        const data = await signIn(phoneBasedEmail, password);
        
        // Update login timestamp
        localStorage.setItem('auth_last_login', Date.now().toString());
        localStorage.setItem('phone_login_success', Date.now().toString());
        
        if (data?.session?.user) {
          console.log('[LoginPage] Phone sign in successful with user ID:', data.session.user.id);
          loginSuccess = true;
          setLoginAttempted(true);
        }
      } catch (primaryError) {
        console.error('[LoginPage] Primary phone sign in error:', primaryError);
        // Handle error consistently with Turkish message
        if (primaryError.message === 'Invalid login credentials') {
          setErrors({ general: 'Geçersiz giriş bilgileri' });
          return;
        }
      }
      
      // If first attempt failed, try direct login
      if (!loginSuccess) {
        try {
          console.log('[LoginPage] Trying direct Supabase sign in');
          const { data: directSignIn, error: directSignInError } = await supabase.auth.signInWithPassword({
            email: phoneBasedEmail,
            password
          });
          
          if (directSignInError) {
            console.error('[LoginPage] Direct phone sign in error:', directSignInError);
            
            // Check for specific errors and provide helpful Turkish feedback
            if (directSignInError.message.includes('email/password')) {
              setErrors({
                general: 'Bu telefon numarası ile kayıtlı bir hesap bulunamadı veya şifre hatalı'
              });
            } else if (directSignInError.message === 'Invalid login credentials') {
              setErrors({
                general: 'Geçersiz giriş bilgileri'
              });
            } else {
              // Never show the raw error message
              setErrors({
                general: 'Giriş yapılırken bir hata oluştu'
              });
            }
          } else if (directSignIn?.session) {
            console.log('[LoginPage] Direct phone sign in successful:', directSignIn.session.user.id);
            loginSuccess = true;
            setLoginAttempted(true);
          }
        } catch (directError) {
          console.error('[LoginPage] Direct sign in exception:', directError);
          setErrors({ general: 'Giriş yapılırken bir hata oluştu' });
        }
      }
      
      // Try with + prefix if all else failed
      if (!loginSuccess) {
        try {
          // Try with + prefix
          const alternateEmail = `+${formattedPhone}@phone.arazial.com`;
          console.log('[LoginPage] Trying with alternate email format:', alternateEmail);
          
          const { data: altSignIn, error: altSignInError } = await supabase.auth.signInWithPassword({
            email: alternateEmail,
            password,
          });
          
          if (!altSignInError && altSignIn?.session) {
            loginSuccess = true;
            console.log('[LoginPage] Alternate email sign-in successful');
            setLoginAttempted(true);
          } else if (altSignInError) {
            console.error('[LoginPage] Alternative sign-in error:', altSignInError);
          }
        } catch (altError) {
          console.error('[LoginPage] Alternative sign-in exception:', altError);
        }
      }
      
      if (!loginSuccess) {
        // If we get here, all login attempts failed
        setErrors({
          general: 'Giriş işlemi başarısız oldu. Lütfen telefon numaranızı ve şifrenizi kontrol edin.'
        });
      }
    } catch (error) {
      console.error('[LoginPage] Phone login error:', error);
      setErrors({
        general: 'Giriş sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
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
      <BackLink to="/">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Anasayfaya Dön
      </BackLink>
      
      <AuthHeader>
        <Logo>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
          </svg>
        </Logo>
        <Title>Giriş Yap</Title>
        <Subtitle>Arazi ihale platformuna giriş yapın</Subtitle>
      </AuthHeader>
      
      {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
      
      <AuthForm onSubmit={handleSubmit}>
              <div>
                <label htmlFor="phoneNumber" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Telefon Numarası
                </label>
                <PhoneInputContainer>
                  <CountryCode>+90</CountryCode>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="5XX XXX XX XX"
                    error={errors.phoneNumber}
                    hideLabel
                    autoFocus
                    style={{ flexGrow: 1, marginBottom: 0 }}
                  />
                </PhoneInputContainer>
                {errors.phoneNumber && (
                  <div style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.phoneNumber}
                  </div>
                )}
              </div>
        
            <PasswordInputWrapper>
              <Input
                id="password"
                label="Şifre"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                error={errors.password}
              />
              <EyeButton isVisible={showPassword} onClick={togglePasswordVisibility} />
            </PasswordInputWrapper>
            
            <div style={{ textAlign: 'right' }}>
              <Link 
            to={`/forgot-password?phone=${encodeURIComponent(phoneNumber)}`}
                style={{ fontSize: '0.875rem' }}
              >
                Şifrenizi mi unuttunuz?
              </Link>
            </div>
            
            <Button type="submit" fullWidth loading={isLoading}>
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </AuthForm>
          
      <FormFooter>
        Hesabınız yok mu? <Link to="/signup">Yeni hesap oluşturun</Link>
      </FormFooter>
    </AuthContainer>
  );
};

export default LoginPage;