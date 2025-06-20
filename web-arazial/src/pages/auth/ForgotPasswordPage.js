import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';

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

const SuccessMessage = styled.div`
  background-color: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: var(--border-radius-md);
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #15803d;
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

const LoginTabs = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
`;

const LoginTab = styled.button`
  flex: 1;
  background: none;
  border: none;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  border-bottom: 2px solid ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: var(--color-primary);
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

const OtpContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 1.5rem;
`;

const OtpInput = styled.input`
  width: 40px;
  height: 48px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
  padding: 0;
  box-sizing: border-box;
  line-height: 48px;
  vertical-align: middle;
  
  &:focus {
    border-color: var(--color-primary);
    outline: none;
    box-shadow: 0 0 0 1px var(--color-primary);
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
      marginTop: '10px'
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

const ConfirmationBox = styled.div`
  padding: 1.5rem;
  border-radius: var(--border-radius-md);
  background-color: var(--color-bg-secondary);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const PhoneDisplay = styled.div`
  font-weight: 600;
  color: var(--color-text);
  margin: 1rem 0;
  font-size: 1.125rem;
`;

const CountdownTimer = styled.div`
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const ForgotPasswordPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialPhone = queryParams.get('phone') || '';
  const initialEmail = queryParams.get('email') || '';
  const initialMode = initialPhone ? 'phone' : (initialEmail ? 'email' : 'phone');
  
  const [resetMethod, setResetMethod] = useState(initialMode);
  const [resetStep, setResetStep] = useState(initialPhone || initialEmail ? 'confirm' : 'identifier'); // 'identifier', 'confirm', 'otp', 'new_password'
  
  const [email, setEmail] = useState(initialEmail);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const otpRefs = useRef([]);
  
  const { resetPassword } = useAuth();
  const [cooldownTime, setCooldownTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const countdownTimerRef = useRef(null);

  // Handle method tab change
  const handleTabChange = (method) => {
    setResetMethod(method);
    setErrors({});
    setErrorMessage('');
  };

  // Handle phone number input
  const handlePhoneNumberChange = (e) => {
    const input = e.target.value;
    // Only allow numeric input
    const numericValue = input.replace(/\D/g, '');
    // Limit to 10 digits
    if (numericValue.length <= 10) {
      setPhoneNumber(numericValue);
    }
    
    // Clear any previous errors
    if (errors.phoneNumber) {
      setErrors({...errors, phoneNumber: null});
    }
  };

  // Validate email form
  const validateEmailForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'E-posta adresinizi giriniz';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate phone form
  const validatePhoneForm = () => {
    const newErrors = {};
    
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Telefon numaranızı giriniz';
    } else if (phoneNumber.length !== 10) {
      newErrors.phoneNumber = 'Telefon numarası 10 haneli olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
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

  // Handle initial identifier submit
  const handleIdentifierSubmit = (e) => {
    e.preventDefault();
    
    if (resetMethod === 'phone') {
      if (!validatePhoneForm()) return;
      setResetStep('confirm');
    } else {
      if (!validateEmailForm()) return;
      setResetStep('confirm');
    }
  };

  // Handle email submit for password reset
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    // If still in cooldown period, don't allow submission
    if (countdown > 0) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await resetPassword(email);
      setSuccess(true);
      setSuccessMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! Lütfen e-postanızı kontrol ediniz.');
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Check if this is a rate limit error (429 Too Many Requests)
      if (error.message && 
          (error.message.includes('security purposes') || 
           error.message.includes('seconds'))) {
        
        // Extract the wait time from the error message
        const timeMatch = error.message.match(/(\d+) second/);
        const waitSeconds = timeMatch ? parseInt(timeMatch[1], 10) : 60;
        
        console.log(`Rate limit detected, need to wait ${waitSeconds} seconds`);
        
        // Set the countdown
        setCountdown(waitSeconds);
        
        // Show Turkish message
        setErrorMessage(`Güvenlik nedeniyle, ${waitSeconds} saniye sonra tekrar deneyebilirsiniz.`);
      } else {
        setErrorMessage('Şifre sıfırlama işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle phone submit to request OTP
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Format phone number with country code
      const formattedPhone = `+90${phoneNumber}`;
      const phoneWithoutPlus = formattedPhone.replace('+', '');
      
      // Call the send-otp function with phoneNumber parameter
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          phoneNumber: phoneWithoutPlus
        }
      });
      
      if (error) {
        throw new Error(error.message || 'OTP gönderilirken bir hata oluştu');
      }
      
      console.log('OTP sent response:', data);
      
      if (data?.success) {
        setResetStep('otp');
        setSuccessMessage(`${formattedPhone} numarasına doğrulama kodu gönderildi.`);
      } else {
        throw new Error(data?.message || 'OTP gönderilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setErrorMessage(error.message || 'OTP gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    const newOtpInputs = [...otpInputs];
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '');
    newOtpInputs[index] = numericValue.slice(0, 1); // Ensure only one character
    setOtpInputs(newOtpInputs);
    
    // Auto focus next input
    if (numericValue && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };
  
  // Handle OTP keydown for backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpInputs[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        otpRefs.current[index - 1].focus();
      } else if (otpInputs[index] && e.target.selectionStart === 0 && e.target.selectionEnd === 0) {
        // If cursor is at beginning of filled input, focus previous input
        if (index > 0) {
          otpRefs.current[index - 1].focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpRefs.current[index + 1].focus();
    }
  };

  // Handle OTP input focus
  const handleOtpFocus = (e) => {
    // Select all text in the input when focused
    e.target.select();
  };
  
  // Verify OTP and move to password reset
  const verifyOTP = async (e) => {
    e.preventDefault();
    
    // Check if all OTP fields are filled
    if (otpInputs.some(input => !input)) {
      setErrorMessage('Lütfen tüm doğrulama kodu hanelerini doldurun');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(''); // Clear any previous errors
    
    try {
      const otp = otpInputs.join('');
      const formattedPhone = `+90${phoneNumber}`;
      const phoneWithoutPlus = formattedPhone.replace('+', '');
      
      console.log('Verifying OTP:', {phoneNumber: phoneWithoutPlus, otp});
      
      // Use the admin-verify-otp function for verification without user creation
      const { data, error } = await supabase.functions.invoke('admin-verify-otp', {
        body: {
          phoneNumber: phoneWithoutPlus,
          otp
        }
      });
      
      console.log('Verify OTP response:', { data, error });
      
      if (error) {
        console.error('Verify OTP error:', error);
        throw new Error(error.message || 'OTP doğrulanırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'OTP doğrulanırken bir hata oluştu.');
      }
      
      // Store the verification result for later use
      setVerificationResult({
        user: {
          id: data.user_id
        }
      });
      
      // OTP is valid - proceed to password reset
      setResetStep('new_password');
      setSuccessMessage('Doğrulama başarılı. Şimdi yeni şifrenizi belirleyebilirsiniz.');
    } catch (error) {
      console.error('Verify OTP error:', error);
      setErrorMessage(error.message || 'OTP doğrulanırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set new password
  const setNewPassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    setErrorMessage(''); // Clear any previous errors
    
    try {
      // If we have a verification result with user ID, use admin-reset-password
      if (verificationResult?.user?.id) {
        console.log('Resetting password for user:', verificationResult.user.id);
        
        const { data, error: resetError } = await supabase.functions.invoke('admin-reset-password', {
          body: {
            user_id: verificationResult.user.id,
            password: password
          }
        });
        
        console.log('Password reset response:', { data, error: resetError });
        
        if (resetError) {
          console.error('Admin reset password error:', resetError);
          throw new Error(resetError.message || 'Şifre değiştirilirken bir hata oluştu');
        }
        
        if (!data || !data.success) {
          throw new Error(data?.error || 'Şifre değiştirilirken bir hata oluştu');
        }
      } else {
        throw new Error('Kullanıcı bilgisi bulunamadı. Lütfen tekrar doğrulama yapın.');
      }
      
      setSuccess(true);
      setSuccessMessage('Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.');
    } catch (error) {
      console.error('Set new password error:', error);
      setErrorMessage(error.message || 'Şifre değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Reset form after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        // Reset all state to initial values
        setResetStep('identifier');
        setOtpInputs(['', '', '', '', '', '']);
        setPassword('');
        setConfirmPassword('');
        setVerificationResult(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0) {
      console.log(`Starting countdown timer from ${countdown} seconds`);
      
      // Clear any existing timer
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      
      // Start a new countdown timer
      countdownTimerRef.current = setInterval(() => {
        setCountdown(prevCount => {
          const newCount = prevCount - 1;
          console.log(`Countdown: ${newCount} seconds`);
          
          if (newCount <= 0) {
            console.log('Countdown finished');
            clearInterval(countdownTimerRef.current);
            return 0;
          }
          
          return newCount;
        });
      }, 1000);
    }
    
    // Cleanup on unmount
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [countdown]);

  // Render different forms based on reset method and step
  const renderForm = () => {
    if (success) {
      return (
        <SuccessMessage>
          {successMessage}
        </SuccessMessage>
      );
    }
    
    // Initial identifier form (for when no phone/email is provided)
    if (resetStep === 'identifier') {
      return (
        <AuthForm onSubmit={handleIdentifierSubmit}>
          {resetMethod === 'email' ? (
            <Input
              id="email"
              label="E-posta"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              error={errors.email}
            />
          ) : (
            <PhoneInputContainer>
              <CountryCode>+90</CountryCode>
              <Input
                id="phoneNumber"
                label="Telefon Numarası"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="5XX XXX XXXX"
                error={errors.phoneNumber}
                style={{ flex: 1 }}
              />
            </PhoneInputContainer>
          )}
          
          <Button type="submit" fullWidth loading={isLoading}>
            Devam Et
          </Button>
          
          <p style={{ textAlign: 'center', margin: '1rem 0 0', fontSize: '0.875rem' }}>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setResetMethod(resetMethod === 'phone' ? 'email' : 'phone');
              }}
              style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              {resetMethod === 'phone' 
                ? 'E-posta ile sıfırlamak istiyorum' 
                : 'Telefon numarası ile sıfırlamak istiyorum'}
            </a>
          </p>
        </AuthForm>
      );
    }
    
    // Confirmation step
    if (resetStep === 'confirm') {
      if (resetMethod === 'email') {
        return (
          <>
            <ConfirmationBox>
              <p>Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderilecektir.</p>
              
              {countdown > 0 && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '0.75rem', 
                  backgroundColor: 'rgba(255, 247, 237, 0.6)', 
                  borderRadius: '8px',
                  border: '1px solid var(--color-warning-light, #FFEDD5)',
                  fontSize: '0.9rem' 
                }}>
                  <p style={{ marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-warning-dark, #9A3412)' }}>
                    Lütfen bekleyin
                  </p>
                  <p style={{ color: 'var(--color-warning, #C2410C)' }}>
                    Güvenlik nedeniyle, {countdown} saniye sonra tekrar deneyebilirsiniz.
                  </p>
                </div>
              )}
            </ConfirmationBox>
            <AuthForm onSubmit={handleEmailSubmit}>
              <Button 
                type="submit" 
                fullWidth 
                loading={isLoading} 
                disabled={countdown > 0}
                variant={countdown > 0 ? "secondary" : "primary"}
              >
                {isLoading ? 'Gönderiliyor...' : countdown > 0 
                  ? `Lütfen Bekleyin (${countdown}s)` 
                  : 'Şifre Sıfırlama Bağlantısı Gönder'}
              </Button>
            </AuthForm>
          </>
        );
      } else {
        return (
          <>
            <ConfirmationBox>
              <p>Şifreyi sıfırlamak için <PhoneDisplay>+90 {phoneNumber}</PhoneDisplay> numarasına doğrulama kodu gönderilecektir.</p>
            </ConfirmationBox>
            <AuthForm onSubmit={handlePhoneSubmit}>
              <Button type="submit" fullWidth loading={isLoading}>
                {isLoading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
              </Button>
            </AuthForm>
          </>
        );
      }
    }
    
    // Phone reset - OTP verification step
    if (resetMethod === 'phone' && resetStep === 'otp') {
      return (
        <AuthForm onSubmit={verifyOTP}>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            +90{phoneNumber} numarasına gönderilen 6 haneli doğrulama kodunu giriniz.
          </p>
          
          <OtpContainer>
            {otpInputs.map((digit, index) => (
              <OtpInput
                key={index}
                type="text"
                inputMode="numeric"
                value={digit}
                maxLength={1}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onFocus={handleOtpFocus}
                ref={(el) => (otpRefs.current[index] = el)}
                autoFocus={index === 0}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </OtpContainer>
          
          <Button type="submit" fullWidth loading={isLoading}>
            {isLoading ? 'Doğrulanıyor...' : 'Doğrulama Kodunu Doğrula'}
          </Button>
        </AuthForm>
      );
    }
    
    // Phone reset - New password step
    if (resetMethod === 'phone' && resetStep === 'new_password') {
      return (
        <AuthForm onSubmit={setNewPassword}>
          <div style={{ position: 'relative' }}>
            <Input
              id="password"
              label="Yeni Şifre"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <EyeButton isVisible={showPassword} onClick={togglePasswordVisibility} />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Input
              id="confirmPassword"
              label="Yeni Şifre Tekrar"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />
            <EyeButton isVisible={showConfirmPassword} onClick={toggleConfirmPasswordVisibility} />
          </div>
          
          <Button type="submit" fullWidth loading={isLoading}>
            {isLoading ? 'Şifre Değiştiriliyor...' : 'Şifremi Değiştir'}
          </Button>
        </AuthForm>
      );
    }
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
        <Title>Şifremi Unuttum</Title>
        <Subtitle>
          {resetStep === 'identifier' && 'Şifre sıfırlama için bilgilerinizi girin'}
          {resetStep === 'confirm' && resetMethod === 'email' && 'Şifre sıfırlama bağlantısı için onaylayın'}
          {resetStep === 'confirm' && resetMethod === 'phone' && 'Şifre sıfırlama için onaylayın'}
          {resetStep === 'otp' && 'Telefon numaranızı doğrulayın'}
          {resetStep === 'new_password' && 'Yeni şifrenizi belirleyin'}
        </Subtitle>
      </AuthHeader>
      
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {successMessage && resetStep !== 'identifier' && resetStep !== 'confirm' && !success && <SuccessMessage>{successMessage}</SuccessMessage>}
      
      {renderForm()}
      
      <FormFooter>
        <Link to="/login">Giriş sayfasına dön</Link>
      </FormFooter>
    </AuthContainer>
  );
};

export default ForgotPasswordPage;