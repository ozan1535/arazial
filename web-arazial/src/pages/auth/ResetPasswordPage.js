import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

// Reusing styles from ForgotPasswordPage
const AuthContainer = styled.div`
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

const AuthHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Logo = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: var(--color-primary);
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--color-text-secondary);
`;

const AuthForm = styled.form`
  margin-bottom: 1.5rem;
`;

const FormFooter = styled.div`
  text-align: center;
  margin-top: 2rem;
  font-size: 0.875rem;
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%;
`;

// Add this wrapper for password inputs
const PasswordInputWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  
  /* Make the input component take full width */
  & > div {
    width: 100%;
  }
  
  /* Style the input to account for the button space */
  & input {
    padding-right: 45px;
  }
  
  /* Position the eye button relative to the input field specifically */
  & > button {
    /* This positions relative to the input field, not the wrapper */
    top: 38px !important;
    transform: none !important;
  }
`;

const Input = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
  }
  
  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid ${props => props.error ? 'var(--color-error)' : '#cbd5e1'};
    border-radius: var(--border-radius-md);
    font-size: 1rem;
    background-color: white;
    color: var(--color-text);
    
    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 1px var(--color-primary-light);
    }
    
    &::placeholder {
      color: var(--color-text-placeholder);
    }
  }
  
  .error-message {
    margin-top: 0.5rem;
    color: var(--color-error);
    font-size: 0.75rem;
  }
`;

const Button = styled.button`
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    background-color: var(--color-primary-dark);
  }
  
  &:disabled {
    background-color: var(--color-disabled);
    cursor: not-allowed;
  }
  
  .loading-spinner {
    margin-right: 0.5rem;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background-color: var(--color-error-bg);
  color: var(--color-error);
  padding: 1rem;
  border-radius: var(--border-radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  background-color: var(--color-success-bg);
  color: var(--color-success);
  padding: 1rem;
  border-radius: var(--border-radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
`;

// Update EyeButton to use inline styles for better positioning
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

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  margin-bottom: 2rem;
  
  &:hover {
    color: var(--color-primary);
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.5rem;
  }
`;

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { updatePassword, isAuthenticated, authState } = useAuth();
  const navigate = useNavigate();
  
  // Check auth state and recovery token
  useEffect(() => {
    console.log('[ResetPasswordPage] Auth state:', authState, 'isAuthenticated:', isAuthenticated);
    
    const hash = window.location.hash;
    console.log('[ResetPasswordPage] Current URL:', window.location.href);
    console.log('[ResetPasswordPage] Current URL hash:', hash);
    
    // Hide error message initially during loading
    setErrorMessage('');
    
    // Only show error messages after we've had time to check the session
    const checkSession = async () => {
      try {
        if (hash && hash.includes('access_token')) {
          console.log('[ResetPasswordPage] Auth token detected in URL');
          
          // Check the current session directly
          const { data } = await supabase.auth.getSession();
          console.log('[ResetPasswordPage] Current session data:', data);
          
          if (data?.session?.user) {
            console.log('[ResetPasswordPage] User authenticated via token:', data.session.user.id);
            // We can proceed with password reset - keep errorMessage empty
          } else {
            console.warn('[ResetPasswordPage] No active session with the auth token');
            setErrorMessage('Oturum doğrulanamadı. Lütfen yeni bir şifre sıfırlama bağlantısı talep ediniz.');
          }
        } else if (!hash) {
          // Only show this error if there's definitely no hash AND we're not already authenticated
          if (!isAuthenticated) {
            console.log('[ResetPasswordPage] No hash found in URL and not authenticated');
            setErrorMessage('Doğrulama kodu bulunamadı. Lütfen e-postanızdaki bağlantıya tıkladığınızdan emin olun.');
          }
        } else {
          console.log('[ResetPasswordPage] Invalid hash format:', hash);
          setErrorMessage('Geçersiz sıfırlama bağlantısı. Lütfen yeni bir şifre sıfırlama bağlantısı talep ediniz.');
        }
      } catch (error) {
        console.error('[ResetPasswordPage] Error checking session:', error);
        setErrorMessage('Oturum doğrulanırken hata oluştu. Lütfen yeni bir şifre sıfırlama bağlantısı talep ediniz.');
      }
    };
    
    // Give auth state a moment to be determined before showing errors
    const timer = setTimeout(() => {
      checkSession();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [authState, isAuthenticated]);
  
  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Şifrenizi giriniz';
    } else if (password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Şifrenizi tekrar giriniz';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle submit for password reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      console.log('[ResetPasswordPage] Attempting to update password');
      
      // Make direct call to Supabase to update password
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });
      
      console.log('[ResetPasswordPage] Direct password update result:', data, error);
      
      if (error) {
        // Handle specific error cases in Turkish
        if (error.message.includes('different from the old password')) {
          throw new Error('Yeni şifreniz eski şifrenizle aynı olamaz. Lütfen farklı bir şifre belirleyin.');
        } else if (error.message.includes('Password should be')) {
          throw new Error('Şifreniz en az 8 karakter uzunluğunda olmalıdır.');
        } else if (error.message.includes('token is invalid')) {
          throw new Error('Şifre sıfırlama bağlantısı geçersiz olmuş veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebinde bulunun.');
        } else if (error.message.includes('rate limit')) {
          throw new Error('Çok fazla deneme yapıldı. Lütfen bir süre bekleyip tekrar deneyin.');
        } else {
          throw error;
        }
      }
      
      // Success!
      setSuccess(true);
      setSuccessMessage('Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('[ResetPasswordPage] Update password error:', error);
      setErrorMessage(error.message || 'Şifre değiştirme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update toggle functions to use the new EyeButton component
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        </Logo>
        <Title>Şifre Yenileme</Title>
        <Subtitle>Yeni şifrenizi belirleyin</Subtitle>
      </AuthHeader>
      
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {success && <SuccessMessage>{successMessage}</SuccessMessage>}
      
      {!success && (
        <AuthForm onSubmit={handleSubmit}>
          {errorMessage && errorMessage.includes('eski şifrenizle aynı olamaz') && (
            <div style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 247, 237, 0.8)',
              border: '1px solid #FFEDD5',
              color: '#9A3412'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span style={{ fontWeight: 'bold' }}>Şifre değiştirilemedi</span>
              </div>
              <p>{errorMessage}</p>
            </div>
          )}
          
          <PasswordInputWrapper>
            <Input error={errors.password || (errorMessage && errorMessage.includes('eski şifrenizle aynı olamaz'))}>
              <label htmlFor="password">Yeni Şifre</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
              <div style={{
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.4'
              }}>
                Şifreniz: <br />
                • En az 8 karakter uzunluğunda olmalı<br />
                • Eski şifrenizden farklı olmalı
              </div>
            </Input>
            <EyeButton isVisible={showPassword} onClick={togglePasswordVisibility} />
          </PasswordInputWrapper>
          
          <PasswordInputWrapper>
            <Input error={errors.confirmPassword}>
              <label htmlFor="confirmPassword">Yeni Şifre Tekrar</label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=""
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </Input>
            <EyeButton isVisible={showConfirmPassword} onClick={toggleConfirmPasswordVisibility} />
          </PasswordInputWrapper>
          
          <Button type="submit" fullWidth loading={isLoading}>
            {isLoading ? (
              <>
                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                Şifre Değiştiriliyor...
              </>
            ) : (
              'Şifremi Değiştir'
            )}
          </Button>
        </AuthForm>
      )}
      
      <FormFooter>
        <Link to="/login">Giriş sayfasına dön</Link>
        {errorMessage && (
          <div style={{ marginTop: '0.5rem' }}>
            <Link to="/forgot-password">Yeni şifre sıfırlama bağlantısı talep et</Link>
          </div>
        )}
      </FormFooter>
    </AuthContainer>
  );
};

export default ResetPasswordPage; 