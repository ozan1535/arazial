import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { forceAuthRefresh } from '../../services/authUtils';
import { supabase } from '../../services/supabase';

// Define default colors to avoid undefined theme issues
const defaultColors = {
  border: '#E5E7EB',
  text: '#374151',
  background: '#F9FAFB',
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  placeholderText: '#9CA3AF',
  buttonText: '#FFFFFF',
  disabledButton: '#D1D5DB',
  disabledText: '#9CA3AF',
  secondaryText: '#6B7280',
  error: '#EF4444',
  success: '#10B981'
};

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
`;

const PhoneInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CountryCode = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme?.colors?.border || defaultColors.border};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: ${props => props.theme?.colors?.text || defaultColors.text};
  background-color: ${props => props.theme?.colors?.background || defaultColors.background};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme?.colors?.border || defaultColors.border};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: ${props => props.theme?.colors?.text || defaultColors.text};
  background-color: ${props => props.theme?.colors?.background || defaultColors.background};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.primary || defaultColors.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme?.colors?.placeholderText || defaultColors.placeholderText};
  }
`;

const OTPInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const OTPInput = styled.input`
  width: 3rem;
  height: 3rem;
  text-align: center;
  font-size: 1.25rem;
  border: 1px solid ${props => props.theme?.colors?.border || defaultColors.border};
  border-radius: 0.375rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.primary || defaultColors.primary};
  }
`;

const Button = styled.button`
  padding: 0.75rem 1rem;
  background-color: ${props => 
    props.disabled 
      ? (props.theme?.colors?.disabledButton || defaultColors.disabledButton) 
      : (props.theme?.colors?.primary || defaultColors.primary)
  };
  color: ${props => props.theme?.colors?.buttonText || defaultColors.buttonText};
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme?.colors?.primaryHover || defaultColors.primaryHover};
  }
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: ${props => 
    props.disabled 
      ? (props.theme?.colors?.disabledText || defaultColors.disabledText) 
      : (props.theme?.colors?.primary || defaultColors.primary)
  };
  font-size: 0.875rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  align-self: center;
  
  &:hover:not(:disabled) {
    text-decoration: underline;
  }
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme?.colors?.secondaryText || defaultColors.secondaryText};
  text-align: center;
`;

const ErrorText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme?.colors?.error || defaultColors.error};
  text-align: center;
`;

const SuccessText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme?.colors?.success || defaultColors.success};
  text-align: center;
`;

const Timer = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme?.colors?.secondaryText || defaultColors.secondaryText};
  text-align: center;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const Checkbox = styled.input`
  margin-top: 0.25rem;
  margin-right: 0.75rem;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: ${props => props.theme?.colors?.secondaryText || defaultColors.secondaryText};
  line-height: 1.5;
  
  a {
    color: ${props => props.theme?.colors?.primary || defaultColors.primary};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PhoneSignup = () => {
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'password'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  // Handle phone number input validation
  const handlePhoneNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    if (input.length <= 10) {
      setPhoneNumber(input);
    }
  };
  
  // Format phone number for API call (add 90 prefix)
  const formatPhoneNumber = () => {
    if (phoneNumber.length === 10 && phoneNumber.startsWith('5')) {
      return `90${phoneNumber}`;
    }
    return null;
  };
  
  // Handle sending OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    const formatted = formatPhoneNumber();
    if (!formatted) {
      setError('Lütfen geçerli bir telefon numarası girin (5XX XXX XX XX)');
      return;
    }
    
    setLoading(true);
    
    try {
      // Add debug logging
      console.log('Sending OTP to phone number:', formatted);
      
      // Make sure the phoneNumber is set explicitly in the request body
      const requestBody = { phoneNumber: formatted };
      console.log('Request payload:', JSON.stringify(requestBody));
      
      // Call the Supabase Edge Function
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      console.log('OTP response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Doğrulama kodu gönderilirken bir hata oluştu');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Doğrulama kodu gönderilirken bir hata oluştu');
      }
      
      setFormattedPhoneNumber(formatted);
      setSuccess('Doğrulama kodu gönderildi');
      setStep('otp');
      
      // Start countdown timer for resend (2 minutes)
      setTimer(120);
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error.message || 'Doğrulama kodu gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle OTP input
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = value;
    setOtpInputs(newOtpInputs);
    
    // Auto focus to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };
  
  // Handle OTP keydown (for backspace)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };
  
  // Handle OTP verification when in OTP step - just move to password step
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    
    // Check if OTP is complete
    if (otpInputs.join('').length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu tam olarak girin.');
      return;
    }
    
    // Move to password step
    setStep('password');
  };
  
  // Handle full verification and signup when in password step
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    try {
      setVerifyLoading(true);
      setVerificationError('');

      // Check password match
      if (password !== confirmPassword) {
        setVerificationError('Şifreler eşleşmiyor');
        setVerifyLoading(false);
        return;
      }

      // Check password length
      if (password.length < 6) {
        setVerificationError('Şifre en az 6 karakter olmalıdır');
        setVerifyLoading(false);
        return;
      }
      
      // Check terms and privacy acceptance
      if (!termsAccepted) {
        setVerificationError('Kullanım Koşullarını kabul etmelisiniz');
        setVerifyLoading(false);
        return;
      }

      // IMPORTANT: Use the EXACT same format as when sending OTP
      // Don't add the "+" here - the database stores it without the +
      const formattedPhone = formattedPhoneNumber;
      console.log('Verifying with phone number:', formattedPhone);
      
      // Save a timestamp so we can debug timing issues
      localStorage.setItem('otp_verify_started', Date.now().toString());
      
      // Create the email from phone number for consistent login
      const phoneBasedEmail = `${formattedPhone}@phone.arazial.com`;
      console.log('Will sign in with email:', phoneBasedEmail);

      // Try to check for the OTP existence first using a direct database query
      // This will help debug the phone number format issue
      try {
        console.log('Checking if OTP exists for phone number:', formattedPhone);
        
        // Add specific debugging for the OTP verification
        const { data: otpData, error: otpCheckError } = await supabase
          .from('phone_auth_codes')
          .select('id, code, verified')
          .eq('phone_number', formattedPhone)
          .limit(1);
          
        if (otpCheckError) {
          console.error('Error checking OTP:', otpCheckError);
        } else if (!otpData || otpData.length === 0) {
          console.warn('No OTP found for this phone number in database. Double-check format.');
          // Try different format variations
          console.log('Trying with phone format variations');
          
          // Try with + prefix (some systems might store it with +)
          const { data: otpDataWithPlus } = await supabase
            .from('phone_auth_codes')
            .select('id, phone_number, code')
            .eq('phone_number', `+${formattedPhone}`)
            .limit(1);
            
          if (otpDataWithPlus && otpDataWithPlus.length > 0) {
            console.log('Found OTP with + prefix:', otpDataWithPlus[0]);
            // Use this format for verification
            formattedPhone = `+${formattedPhone}`;
          }
        } else {
          console.log('Found OTP in database:', otpData[0]);
        }
      } catch (otpCheckError) {
        console.error('Error checking OTP existence:', otpCheckError);
      }

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          phoneNumber: formattedPhone,
          otp: otpInputs.join(''),
          password: password,
        },
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        setVerificationError('Doğrulama başarısız: ' + error.message);
        setVerifyLoading(false);
        return;
      }
      
      // Log success for debugging
      console.log('OTP verification successful:', data);
      localStorage.setItem('otp_verify_success', Date.now().toString());
      
      // Set success state and prepare for redirect even before login attempts
      setVerifyLoading(false);
      setIsSuccess(true);
      
      // Schedule redirect to happen regardless of login attempts
      const redirectTimer = setTimeout(() => {
        console.log('Executing forced redirect after successful OTP verification');
        window.location.href = '/';
      }, 2000);
      
      // Try to sign in directly with the phone-derived email and password
      try {
        console.log('Attempting to sign in with:', { email: phoneBasedEmail });
        // Save the phone-based email for debugging
        localStorage.setItem('phone_signup_email', phoneBasedEmail);
        
        // Capture success value to track if any login method worked
        let loginSuccess = false;
        
        try {
          // First try the context signIn method with correct parameters
          console.log('Trying context signIn with:', phoneBasedEmail);
          const signInResult = await signIn(phoneBasedEmail, password);
          console.log('Context signIn result:', signInResult);
          
          if (signInResult?.session?.user) {
            loginSuccess = true;
            console.log('Context signIn successful');
          }
        } catch (contextSignInError) {
          console.error('Context signIn error:', contextSignInError);
        }
        
        // If the first method failed, try direct Supabase signin
        if (!loginSuccess) {
          try {
            console.log('Trying direct Supabase signIn with:', phoneBasedEmail);
            const { data: directSignIn, error: directSignInError } = await supabase.auth.signInWithPassword({
              email: phoneBasedEmail,
              password,
            });
            
            if (directSignInError) {
              console.error('Direct sign-in error:', directSignInError);
            } else if (directSignIn?.session) {
              loginSuccess = true;
              console.log('Direct sign-in successful:', directSignIn);
            }
          } catch (directSignInError) {
            console.error('Direct sign-in exception:', directSignInError);
          }
        }
        
        // If both methods failed, try with a different email format
        if (!loginSuccess) {
          // Try with + prefix
          const alternateEmail = `+${formattedPhone}@phone.arazial.com`;
          try {
            console.log('Trying with alternate email format:', alternateEmail);
            const { data: altSignIn, error: altSignInError } = await supabase.auth.signInWithPassword({
              email: alternateEmail,
              password,
            });
            
            if (!altSignInError && altSignIn?.session) {
              loginSuccess = true;
              console.log('Alternate email sign-in successful');
            }
          } catch (altSignInError) {
            console.error('Alternate sign-in error:', altSignInError);
          }
        }
        
        // Last resort - try to use the session from the verify-otp response
        if (!loginSuccess && data?.session?.session?.access_token) {
          try {
            console.log('Trying to use session from verify-otp response');
            await supabase.auth.setSession({
              access_token: data.session.session.access_token,
              refresh_token: data.session.session.refresh_token,
            });
            loginSuccess = true;
          } catch (setSessionError) {
            console.error('Error setting session from verify-otp response:', setSessionError);
          }
        }
      } catch (signInError) {
        console.error('Error in sign-in process:', signInError);
      }
      
      // Force an auth refresh as an additional security measure
      try {
        await forceAuthRefresh();
        localStorage.setItem('force_auth_refresh_after_signup', Date.now().toString());
      } catch (refreshError) {
        console.error('Error refreshing auth after signup:', refreshError);
      }

      // Cancel the automatic redirect timer if we got this far
      clearTimeout(redirectTimer);
      
      // These are likely already set, but ensure they're set
      setVerifyLoading(false);
      setIsSuccess(true);
      
      // Redirect after a short delay to allow state updates
      setTimeout(() => {
        // Use direct window location instead of navigate for more reliable redirect
        console.log('Executing redirect to home page after auth refresh');
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Error in OTP verification process:', error);
      setVerificationError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      setVerifyLoading(false);
    }
  };
  
  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Render different steps
  const renderPhoneStep = () => (
    <Form onSubmit={handleSendOTP}>
      <PhoneInputContainer>
        <CountryCode>+90</CountryCode>
        <Input
          type="tel"
          placeholder="5XX XXX XX XX"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          maxLength={10}
          required
        />
      </PhoneInputContainer>
      
      <InfoText>
        Telefon numaranıza bir doğrulama kodu göndereceğiz.
      </InfoText>
      
      <Button type="submit" disabled={loading || phoneNumber.length !== 10}>
        {loading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
      </Button>
    </Form>
  );
  
  const renderOtpStep = () => (
    <Form onSubmit={handleOtpSubmit}>
      <InfoText>
        {formattedPhoneNumber.replace('90', '+90 ')} numarasına gönderilen 6 haneli doğrulama kodunu girin.
      </InfoText>
      
      <OTPInputContainer>
        {otpInputs.map((digit, index) => (
          <OTPInput
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            autoFocus={index === 0}
          />
        ))}
      </OTPInputContainer>
      
      {timer > 0 && (
        <Timer>
          Kodu yeniden gönderme: {formatTime(timer)}
        </Timer>
      )}
      
      {timer === 0 && (
        <ResendButton 
          type="button" 
          onClick={handleSendOTP}
          disabled={loading}
        >
          Kodu Yeniden Gönder
        </ResendButton>
      )}
      
      <Button type="submit" disabled={loading || otpInputs.join('').length !== 6}>
        {loading ? 'Doğrulanıyor...' : 'Doğrula ve Devam Et'}
      </Button>
    </Form>
  );
  
  const renderPasswordStep = () => (
    <Form onSubmit={handleVerifyOTP}>
      {verificationError && <ErrorText>{verificationError}</ErrorText>}
      {isSuccess && <SuccessText>Hesabınız başarıyla oluşturuldu!</SuccessText>}
      
      <InfoText>
        Hesabınız için lütfen bir şifre belirleyin.
      </InfoText>
      
      <Input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      
      <Input
        type="password"
        placeholder="Şifre (Tekrar)"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={6}
      />
      
      <InfoText>
        Şifreniz en az 6 karakter olmalıdır.
      </InfoText>
      
      <CheckboxContainer>
        <Checkbox 
          id="termsAgreement" 
          type="checkbox" 
          checked={termsAccepted} 
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />
        <CheckboxLabel htmlFor="termsAgreement">
          <Link to="/terms-of-use" target="_blank">Kullanım Koşulları</Link>'nı okudum ve kabul ediyorum.
        </CheckboxLabel>
      </CheckboxContainer>
      
      <Button type="submit" disabled={verifyLoading || !password || !confirmPassword || !termsAccepted}>
        {verifyLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
      </Button>
    </Form>
  );
  
  return (
    <Container>
      {error && <ErrorText>{error}</ErrorText>}
      {success && <SuccessText>{success}</SuccessText>}
      
      {step === 'phone' && renderPhoneStep()}
      {step === 'otp' && renderOtpStep()}
      {step === 'password' && renderPasswordStep()}
    </Container>
  );
};

export default PhoneSignup; 