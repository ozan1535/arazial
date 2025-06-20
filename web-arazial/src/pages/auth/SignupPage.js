import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { supabase } from '../../services/supabase';

const Container = styled.div`
  max-width: 450px;
  width: 100%;
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  
  @media (max-width: 480px) {
    padding: 1.5rem;
    box-shadow: none;
    background-color: transparent;
  }
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

const Header = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Description = styled.p`
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.error ? 'var(--color-error)' : 'var(--color-border)'};
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

const ErrorMessage = styled.div`
  color: var(--color-error);
  font-size: 0.8125rem;
  margin-top: 0.25rem;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  margin-top: 0.5rem;
  user-select: none;
`;

const CheckboxInput = styled.input`
  margin-top: 0.125rem;
  cursor: pointer;
`;

const CheckboxLabel = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
`;

const PhoneInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const CountryCode = styled.div`
  padding: 0.75rem 1rem;
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

const PhoneInput = styled(Input)`
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
`;

const OTPInputContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const OTPInput = styled.input`
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  border: 1px solid ${props => props.error ? 'var(--color-error)' : 'var(--color-border)'};
  border-radius: var(--border-radius-md);
  background-color: var(--color-surface);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-top: 0.5rem;
  
  &:disabled {
    color: var(--color-text-secondary);
    cursor: default;
    text-decoration: none;
  }
`;

const PasswordInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--color-text);
  }
`;

const SignupPage = () => {
  // Form steps: 1 = initial form, 2 = OTP verification
  const [step, setStep] = useState(1);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP fields
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  
  const handlePhoneNumberChange = (e) => {
    // Only allow digits and limit to 10 characters
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleSubmitInitialForm = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form
    if (!firstName.trim()) {
      setErrors(prev => ({ ...prev, firstName: 'Ad alanı zorunludur' }));
      return;
    }
    if (!lastName.trim()) {
      setErrors(prev => ({ ...prev, lastName: 'Soyad alanı zorunludur' }));
      return;
    }
    if (!phoneNumber || phoneNumber.length !== 10) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Geçerli bir telefon numarası giriniz' }));
      return;
    }
    if (!password || password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Şifre en az 6 karakter olmalıdır' }));
      return;
    }
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Şifreler eşleşmiyor' }));
      return;
    }
    if (!acceptTerms) {
      setErrors(prev => ({ ...prev, terms: 'Üyelik sözleşmesini kabul etmelisiniz' }));
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format phone number with country code
      const formattedPhone = `90${phoneNumber}`;
      
      // Check if phone is already registered
      const checkResponse = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/check-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ phoneNumber: formattedPhone })
      });
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        
        if (checkData.exists === true) {
          setErrors({ 
            phoneNumber: 'Bu telefon numarası zaten kayıtlı'
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Send OTP
      const sendOtpResponse = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ phoneNumber: formattedPhone })
      });
      
      const otpData = await sendOtpResponse.json();
      
      if (!sendOtpResponse.ok || !otpData.success) {
        throw new Error(otpData.error || 'OTP gönderilemedi');
      }
      
      // Start resend timer
      setResendDisabled(true);
      let timer = 60;
      setResendTimer(timer);
      
      const interval = setInterval(() => {
        timer -= 1;
        setResendTimer(timer);
        
        if (timer <= 0) {
          clearInterval(interval);
          setResendDisabled(false);
        }
      }, 1000);
      
      // Move to OTP verification step
      setStep(2);
    } catch (error) {
      console.error('Error in initial form submission:', error);
      setErrors({
        general: 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    
    // Auto focus to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };
  
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };
  
  const resendOtp = async () => {
    if (resendDisabled) return;
    
    setIsLoading(true);
    
    try {
      const formattedPhone = `90${phoneNumber}`;
      
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ phoneNumber: formattedPhone })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'OTP gönderilemedi');
      }
      
      // Reset OTP inputs
      setOtpDigits(['', '', '', '', '', '']);
      
      // Start resend timer
      setResendDisabled(true);
      let timer = 60;
      setResendTimer(timer);
      
      const interval = setInterval(() => {
        timer -= 1;
        setResendTimer(timer);
        
        if (timer <= 0) {
          clearInterval(interval);
          setResendDisabled(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Error resending OTP:', error);
      setErrors({
        general: 'OTP gönderilemedi. Lütfen tekrar deneyin.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setErrors({ general: 'Lütfen 6 haneli doğrulama kodunu tam olarak girin.' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formattedPhone = `90${phoneNumber}`;
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Verify the OTP - Include password as required by the endpoint
      const verifyResponse = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          phoneNumber: formattedPhone,
          otp,
          password,
          display_name: fullName
        })
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok || !verifyData.success) {
        setErrors({ general: 'Doğrulama kodu hatalı veya süresi dolmuş. Lütfen tekrar deneyin.' });
        return;
      }
      
      // After OTP verification, proceed with registration
      const phoneBasedEmail = `${formattedPhone}@phone.arazial.com`;
      
      console.log('Registering with phone-based email:', phoneBasedEmail);
      
      // Call Supabase sign up with the phone-based email
      const { data } = await signUp(phoneBasedEmail, password);
      
      if (data?.user) {
        try {
          // After successful registration, store user profile data
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              first_name: firstName,
              last_name: lastName,
              phone_number: formattedPhone,
              marketing_consent: acceptMarketing,
              updated_at: new Date()
            })
            .eq('id', data.user.id);
            
          if (profileError) {
            console.error('Error updating profile:', profileError);
          }
          
          // Now automatically sign in the user
          try {
            console.log('Attempting to auto-login with:', phoneBasedEmail);
            
            // Attempt to sign in immediately after registration
            await signIn(phoneBasedEmail, password);
            
            // Update last auth timestamp in localStorage
            localStorage.setItem('auth_last_login', Date.now().toString());
          
            // Registration and sign-in successful, redirect to home page
            navigate('/', { replace: true });
            return;
          } catch (signInError) {
            console.error('Auto-login after registration failed:', signInError);
            // If auto-login fails, redirect to login page
            navigate('/login');
            return;
          }
        } catch (profileError) {
          console.error('Failed to update profile:', profileError);
        }
      }
      
      // Fallback if registration was successful but something else failed
      navigate('/login');
    } catch (error) {
      console.error('Error during OTP verification or registration:', error);
      
      if (error.message?.includes('already registered')) {
        setErrors({
          general: 'Bu telefon numarası zaten kayıtlı'
        });
      } else {
        setErrors({
          general: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render the initial registration form (Step 1)
  const renderInitialForm = () => (
    <Form onSubmit={handleSubmitInitialForm}>
      <Input 
        type="text" 
        placeholder="Ad" 
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        error={errors.firstName}
      />
      {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
      
      <Input 
        type="text" 
        placeholder="Soyad" 
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        error={errors.lastName}
      />
      {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
      
      <PhoneInputContainer>
        <CountryCode>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1rem', height: '1rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          +90
        </CountryCode>
        <PhoneInput 
          type="tel" 
          placeholder="Telefon Numarası" 
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          error={errors.phoneNumber}
        />
      </PhoneInputContainer>
      {errors.phoneNumber && <ErrorMessage>{errors.phoneNumber}</ErrorMessage>}
      
      <PasswordInputContainer>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <PasswordToggle type="button" onClick={togglePasswordVisibility}>
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          )}
        </PasswordToggle>
      </PasswordInputContainer>
      {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
      
      <PasswordInputContainer>
        <Input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Şifre Tekrarı"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />
        <PasswordToggle type="button" onClick={toggleConfirmPasswordVisibility}>
          {showConfirmPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          )}
        </PasswordToggle>
      </PasswordInputContainer>
      {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
      
      <CheckboxContainer>
        <CheckboxInput 
          type="checkbox" 
          id="marketing" 
          checked={acceptMarketing}
          onChange={(e) => setAcceptMarketing(e.target.checked)}
        />
        <CheckboxLabel>
          Kampanya ve tekliflerden yararlanmak için, E-Posta, SMS vb. iletileri ve aramaları almayı kabul ediyorum.
        </CheckboxLabel>
      </CheckboxContainer>
      
      <CheckboxContainer>
        <CheckboxInput 
          type="checkbox" 
          id="terms" 
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
        />
        <CheckboxLabel>
          <Link to="/terms-of-use" target="_blank" style={{ color: 'var(--color-primary)' }}>Üyelik sözleşmesini</Link> okudum ve kabul ediyorum.
        </CheckboxLabel>
      </CheckboxContainer>
      {errors.terms && <ErrorMessage>{errors.terms}</ErrorMessage>}
      
      {errors.general && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <ErrorMessage>{errors.general}</ErrorMessage>
        </div>
      )}
      
      <Button 
        type="submit" 
        variant="primary" 
        size="large" 
        fullWidth
        style={{ marginTop: '1rem' }}
        loading={isLoading}
      >
        DEVAM ET
      </Button>
    </Form>
  );
  
  // Render the OTP verification form (Step 2)
  const renderOtpForm = () => (
    <Form onSubmit={handleVerifyOtp}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>+90 {phoneNumber}</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Telefon numaranıza gönderilen 6 haneli doğrulama kodunu girin
        </p>
      </div>
      
      <OTPInputContainer>
        {otpDigits.map((digit, index) => (
          <OTPInput
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            autoFocus={index === 0}
            error={errors.otp}
          />
        ))}
      </OTPInputContainer>
      
      <div style={{ textAlign: 'center' }}>
        <ResendButton 
          type="button" 
          onClick={resendOtp} 
          disabled={resendDisabled}
        >
          {resendDisabled ? `Yeniden gönder (${resendTimer}s)` : 'Kodu tekrar gönder'}
        </ResendButton>
      </div>
      
      {errors.general && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <ErrorMessage>{errors.general}</ErrorMessage>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Button 
          type="button" 
          variant="outline" 
          size="large"
          fullWidth
          onClick={() => setStep(1)}
          disabled={isLoading}
        >
          GERİ
        </Button>
        
        <Button 
          type="submit" 
          variant="primary" 
          size="large" 
          fullWidth
          loading={isLoading}
        >
          DOĞRULA VE KAYIT OL
        </Button>
      </div>
    </Form>
  );
  
  return (
    <Container>
      <BackLink to="/">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Anasayfaya Dön
      </BackLink>
      <Header>arazialcom'a Katıl</Header>
      <Description>
        Hoş geldiniz, aşağıdaki formu doldurarak ücretsiz üye olabilirsiniz.
      </Description>
      
      {/* Show the appropriate form based on the current step */}
      {step === 1 ? renderInitialForm() : renderOtpForm()}
    </Container>
  );
};

export default SignupPage;