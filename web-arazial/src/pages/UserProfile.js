import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const ProfileHeader = styled.div`
  margin-bottom: 3rem;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
`;

const MemberSince = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  
  &:hover {
    color: var(--color-primary);
  }
`;

const SectionContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--color-text-light);
  border-radius: var(--border-radius-md);
  background-color: var(--color-surface);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb, 15, 52, 96), 0.2);
  }
`;

const BidsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: var(--color-background);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--color-border);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #10b981;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #ecfdf5;
  border-radius: var(--border-radius-md);
`;

/**
 * UserProfile Component
 * 
 * This component handles the user profile page with the following tabs:
 * - Profile information (user details, contact information)
 * - Bid history (past bids on auctions)
 * - Settings (password management, account deletion)
 * 
 * The password change functionality uses Supabase Auth to:
 * 1. Validate the current password by attempting to sign in
 * 2. Update to a new password if validation succeeds (min 8 characters)
 */
const UserProfile = () => {
  const { user, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        if (!user?.id) {
          console.error('No user ID available for profile fetch');
          return;
        }
        
        console.log('[UserProfile] Fetching profile data for user:', user.id);
        
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('[UserProfile] Error fetching profile:', profileError);
          throw profileError;
        }
        
        if (!profileData) {
          console.warn('[UserProfile] No profile data found, may need to create one');
        }
        
        // Fetch user bids
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select(`
            id,
            amount,
            created_at,
            auctions (
              id,
              title,
              status
            )
          `)
          .eq('bidder_id', user.id)
          .order('created_at', { ascending: false });
          
        if (bidsError) {
          console.error('[UserProfile] Error fetching bids:', bidsError);
          throw bidsError;
        }
        
        console.log('[UserProfile] Successfully loaded profile data');
        setProfile(profileData);
        setBids(bidsData || []);
        
        // Check if columns exist in the profileData and set default values if not
        setFormData({
          fullName: profileData?.full_name || '',
          phone: profileData?.phone_number || '',
          address: profileData?.address || '',
          city: profileData?.city || '',
          postalCode: profileData?.postal_code || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchUserProfile();
  }, [user]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      // First, ensure the columns exist in the database
      const { error: schemaError } = await supabase.rpc('ensure_profile_columns');
      if (schemaError) console.error('Error ensuring schema:', schemaError);
      
      // Then update the profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone_number: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          updated_at: new Date()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      alert('Profil bilgileriniz başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Profil güncellenirken bir hata oluştu.');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Mevcut şifrenizi giriniz';
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Yeni şifrenizi giriniz';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Şifre en az 8 karakter olmalıdır';
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      setLoading(true);
      setErrors({});
      
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      });
      
      if (signInError) {
        console.error('Password verification error:', signInError);
        
        // Translate common error messages to Turkish
        if (signInError.message === 'Invalid login credentials') {
          setErrors({
            ...errors,
            currentPassword: 'Mevcut şifre doğru değil',
            general: 'Şifre doğrulanamadı. Lütfen mevcut şifrenizi kontrol edin.'
          });
        } else if (signInError.message.includes('rate limit')) {
          setErrors({
            ...errors,
            general: 'Çok fazla deneme yapıldı. Lütfen bir süre bekleyip tekrar deneyin.'
          });
        } else {
          setErrors({
            ...errors,
            currentPassword: 'Mevcut şifre doğrulanamadı',
            general: 'Şifre doğrulanamadı. Lütfen mevcut şifrenizi kontrol edin.'
          });
        }
        return;
      }
      
      // If current password is valid, update to the new password
      const { error } = await updatePassword(passwordForm.newPassword);
      
      if (error) throw error;
      
      setSuccess({
        ...success,
        password: 'Şifreniz başarıyla güncellendi.'
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      
      // More detailed error messages based on the error
      if (error.message?.includes('password')) {
        setErrors({
          ...errors,
          newPassword: 'Yeni şifre gereksinimleri karşılamıyor.',
          general: 'Şifre güncellenirken bir hata oluştu. Yeni şifreniz en az 8 karakter uzunluğunda olmalıdır.'
        });
      } else if (error.message?.includes('rate limit')) {
        setErrors({
          ...errors,
          general: 'Çok fazla deneme yapıldı. Lütfen bir süre bekleyip tekrar deneyin.'
        });
      } else if (error.message?.includes('network')) {
        setErrors({
          ...errors,
          general: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'
        });
      } else {
        setErrors({
          ...errors,
          general: 'Şifre güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <SectionContainer>
            <SectionTitle>Profil Bilgileri</SectionTitle>
            <form onSubmit={handleProfileUpdate}>
              <FormGroup>
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input 
                  type="text" 
                  id="fullName" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="phone">Telefon</Label>
                <Input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  value={formData.phone}
                  disabled
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="address">Adres</Label>
                <Input 
                  type="text" 
                  id="address" 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </FormGroup>
              
              <FormRow>
                <FormGroup>
                  <Label htmlFor="city">Şehir</Label>
                  <Input 
                    type="text" 
                    id="city" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="postalCode">Posta Kodu</Label>
                  <Input 
                    type="text" 
                    id="postalCode" 
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </FormRow>
              
              <Button type="submit">Bilgileri Güncelle</Button>
            </form>
          </SectionContainer>
        );
      case 'bids':
        return (
          <SectionContainer>
            <SectionTitle>Teklif Geçmişim</SectionTitle>
            {bids.length > 0 ? (
              <BidsTable>
                <TableHead>
                  <TableRow>
                    <TableHeader>İhale</TableHeader>
                    <TableHeader>Teklif Tutarı</TableHeader>
                    <TableHeader>Tarih</TableHeader>
                    <TableHeader>Durum</TableHeader>
                  </TableRow>
                </TableHead>
                <tbody>
                  {bids.map(bid => (
                    <TableRow key={bid.id}>
                      <TableCell>{bid.auctions.title}</TableCell>
                      <TableCell>{bid.amount.toLocaleString('tr-TR')} TL</TableCell>
                      <TableCell>{formatDate(bid.created_at)}</TableCell>
                      <TableCell>
                        {bid.auctions.status === 'active' ? 'Aktif' : 
                         bid.auctions.status === 'completed' ? 'Tamamlandı' : 'Yaklaşan'}
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </BidsTable>
            ) : (
              <EmptyState>
                <p>Henüz teklif verdiğiniz bir ihale bulunmamaktadır.</p>
              </EmptyState>
            )}
          </SectionContainer>
        );
      case 'settings':
        return (
          <SectionContainer>
            <SectionTitle>Şifre Değiştirme</SectionTitle>
            
            {success.password && <SuccessMessage>{success.password}</SuccessMessage>}
            {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
            
            <form onSubmit={handlePasswordSubmit}>
              <FormGroup>
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <Input 
                  type="password" 
                  id="currentPassword" 
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                />
                {errors.currentPassword && <ErrorMessage>{errors.currentPassword}</ErrorMessage>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input 
                  type="password" 
                  id="newPassword" 
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                />
                {errors.newPassword && <ErrorMessage>{errors.newPassword}</ErrorMessage>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <Input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                />
                {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
              </FormGroup>
              
              <Button type="submit" disabled={loading}>
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </Button>
            </form>
          </SectionContainer>
        );
      default:
        return null;
    }
  };
  
  return (
    <PageContainer>
      <ProfileHeader>
        <ProfileInfo>
          {loading ? (
            <UserName>Yükleniyor...</UserName>
          ) : (
            <>
              <UserName>{profile?.full_name}</UserName>
          <MemberSince>
            {profile?.created_at ? `Üyelik Tarihi: ${formatDate(profile.created_at)}` : ''}
          </MemberSince>
            </>
          )}
        </ProfileInfo>
      </ProfileHeader>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
        >
          Profil Bilgileri
        </Tab>
        <Tab 
          active={activeTab === 'bids'} 
          onClick={() => setActiveTab('bids')}
        >
          Teklif Geçmişim
        </Tab>
        <Tab 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
        >
          Hesap Ayarları
        </Tab>
      </TabsContainer>
      
      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        renderTabContent()
      )}
    </PageContainer>
  );
};

export default UserProfile; 