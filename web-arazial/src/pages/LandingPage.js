import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/ui/Button';

const HeroSection = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8rem 2rem 6rem;
  background: linear-gradient(135deg, rgba(7, 30, 61, 0.92), rgba(7, 20, 41, 0.97)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80') center/cover no-repeat;
  background-attachment: fixed;
  color: white;
  min-height: 80vh;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 80px;
    background-color: white;
    clip-path: polygon(0 40%, 100% 0, 100% 100%, 0% 100%);
  }
  
  @media (max-width: 768px) {
    min-height: auto;
    padding: 6rem 1.5rem 3rem;
    justify-content: flex-start;
    
    &::after {
      height: 40px;
    }
  }
`;

const HeroContent = styled.div`
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  z-index: 2;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  color: white;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  
  @media (min-width: 768px) {
    font-size: 4.5rem;
    line-height: 1.1;
  }
  
  .gold-text {
    color: var(--color-gold);
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -5px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
    }
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  
  @media (min-width: 640px) {
    flex-direction: row;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const HeroButton = styled(Button)`
  padding: 1rem 2.25rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: var(--border-radius-xl);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-width: 180px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  }
  
  &.secondary-on-primary {
    background-color: white;
    color: var(--color-primary);
    border: none;
    font-weight: 700;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.9);
      color: var(--color-primary-dark);
    }
  }
  
  &.gold-on-primary {
    background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold) 100%);
    color: white;
    border: none;
    font-weight: 700;
    
    &:hover {
      background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%);
      color: white;
    }
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 140px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ScrollText = styled.span`
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  color: white;
  opacity: 0.9;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const ScrollIcon = styled.div`
  width: 30px;
  height: 50px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    width: 6px;
    height: 6px;
    background-color: white;
    border-radius: 50%;
    transform: translateX(-50%);
    animation: scroll 2s infinite;
  }
  
  @keyframes scroll {
    0% {
      transform: translate(-50%, 0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, 20px);
      opacity: 0;
    }
  }
`;

const FeaturesSection = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(to bottom, #fff 0%, #f9fafb 100%);
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: var(--color-text);
`;

const SectionSubtitle = styled.p`
  font-size: 1.25rem;
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem;
  color: var(--color-text-secondary);
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2.5rem 2rem;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-lg);
  }
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(15, 52, 96, 0.25);
  
  svg {
    width: 32px;
    height: 32px;
    color: white;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--color-text);
`;

const FeatureText = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
`;

const HowItWorksSection = styled.section`
  padding: 6rem 2rem;
  background-color: white;
`;

const ProcessSteps = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    background: linear-gradient(to bottom, var(--color-primary-light), var(--color-primary-dark));
    transform: translateX(-50%);
    
    @media (max-width: 768px) {
      left: 30px;
    }
  }
`;

const ProcessStep = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
  position: relative;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:nth-child(even) {
    flex-direction: row-reverse;
    
    @media (max-width: 768px) {
      flex-direction: row;
    }
  }
  
  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

const StepNumber = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  box-shadow: 0 4px 15px rgba(15, 52, 96, 0.25);
  
  @media (max-width: 768px) {
    left: 30px;
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
`;

const StepContent = styled.div`
  width: 45%;
  padding: 2rem;
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(0, 0, 0, 0.04);
  
  @media (max-width: 768px) {
    width: calc(100% - 80px);
    margin-left: 80px;
  }
`;

const StepTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--color-text);
`;

const StepDescription = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 0;
`;

const CTASection = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold) 100%);
  color: white;
  position: relative;
  text-align: center;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('https://www.transparenttextures.com/patterns/cubes.png');
    opacity: 0.05;
    z-index: 1;
  }
`;

const CTAContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: 2.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CTAText = styled.p`
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButtonGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 2rem;
  background-color: #f9fafb;
  border-radius: 16px;
  margin-top: -2rem;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: -1rem;
    border-radius: 16px 16px 0 0;
  }
`;

const LandingPage = () => {
  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <>
      <HeroSection>
        <HeroContent>
          <HeroTitle>
            Arazi ve Arsa <span className="gold-text">Alım Satımı</span> Artık Çevrimiçi
          </HeroTitle>
          <HeroSubtitle>
            Arsa ve arazi ihalelerini artık online olarak takip edebilir, teklifler verebilir ve kazanabilirsiniz. Geleceğinize yatırım yapmak için en doğru adres arazialcom.
          </HeroSubtitle>
          <ButtonGroup>
            <HeroButton 
              as={Link} 
              to="/auctions" 
              className="gold-on-primary"
            >
              İhaleleri Görüntüle
            </HeroButton>
            <HeroButton 
              as={Link} 
              to="/auth/register" 
              className="secondary-on-primary"
            >
              Hemen Üye Ol
            </HeroButton>
          </ButtonGroup>
        </HeroContent>
        
        <ScrollIndicator onClick={scrollToFeatures}>
          <ScrollText>Keşfet</ScrollText>
          <ScrollIcon />
        </ScrollIndicator>
      </HeroSection>
      
      <FeaturesSection id="features">
        <SectionTitle>Neden arazialcom?</SectionTitle>
        <SectionSubtitle>
          arazialcom, arazi ihalelerine katılmanın en kolay ve en güvenli yoludur.
        </SectionSubtitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>Her Yerden Erişim</FeatureTitle>
            <FeatureText>
              İnternet bağlantısı olan her yerden ihalelere katılın ve tekliflerinizi verin. Fiziksel olarak ihalenin yapıldığı lokasyonda bulunmanıza gerek yok.
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>Güvenli ve Şeffaf</FeatureTitle>
            <FeatureText>
              Tüm teklifler şifrelenmiş ve güvenli bir şekilde saklanır. İhale süreçleri tamamen şeffaf olarak yönetilir ve denetlenebilir.
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>Zaman Tasarrufu</FeatureTitle>
            <FeatureText>
              Fiziksel ihalelerde harcanan zaman ve kaynaklar minimuma iner. İşlemler otomatik olarak sistem tarafından yürütülür.
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>Maliyet Avantajı</FeatureTitle>
            <FeatureText>
              Fiziksel ihalelerin getirdiği mekan, personel ve organizasyon maliyetlerinden tasarruf edin. Daha ekonomik bir ihale süreci yönetin.
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905 0 .905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>Kullanıcı Dostu</FeatureTitle>
            <FeatureText>
              Basit ve sezgisel kullanıcı arayüzü ile her seviyeden kullanıcının kolayca ihale işlemlerini gerçekleştirmesini sağlar.
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>Geniş Katılım</FeatureTitle>
            <FeatureText>
              Coğrafi sınırlamalar olmadan daha fazla katılımcıya ulaşın. Rekabet arttıkça, ihalenin getirisi de artar.
            </FeatureText>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <HowItWorksSection>
        <SectionTitle>Nasıl Çalışır?</SectionTitle>
        <SectionSubtitle>
          arazialcom platformumuzu kullanarak arazi ihalelerine katılmak çok kolay.
        </SectionSubtitle>
        <ProcessSteps>
          <ProcessStep>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepTitle>Hesap oluşturun</StepTitle>
              <StepDescription>
                Hızlı bir şekilde ücretsiz hesap oluşturun. Kayıt işlemi sadece birkaç dakikanızı alacaktır.
              </StepDescription>
            </StepContent>
          </ProcessStep>
          
          <ProcessStep>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepTitle>İhaleleri keşfedin</StepTitle>
              <StepDescription>
                Açık arttırma listesinden size uygun olan araziyi seçin. Tüm detayları ve fotoğrafları inceleyin.
              </StepDescription>
            </StepContent>
          </ProcessStep>
          
          <ProcessStep>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepTitle>Teklifinizi verin</StepTitle>
              <StepDescription>
                İhaleye katılın ve teklifinizi verin. İsterseniz otomatik teklif verme özelliğini de kullanabilirsiniz.
              </StepDescription>
            </StepContent>
          </ProcessStep>
          
          <ProcessStep>
            <StepNumber>4</StepNumber>
            <StepContent>
              <StepTitle>İhaleyi kazanın</StepTitle>
              <StepDescription>
                İhaleyi kazandığınızda, sistem sizi otomatik olarak bilgilendirecek ve sonraki adımlar için yönlendirecektir.
              </StepDescription>
            </StepContent>
          </ProcessStep>
        </ProcessSteps>
      </HowItWorksSection>

      <CTASection>
        <CTAContent>
          <CTATitle>Geleceğinize Yatırım Yapın</CTATitle>
          <CTAText>
            Türkiye'nin en güvenilir arazi yatırım platformuna katılın ve fırsatları kaçırmayın. Hesabınızı oluşturun ve hemen ihale vermeye başlayın.
          </CTAText>
          <CTAButtonGroup>
            <HeroButton 
              as={Link} 
              to="/auth/register" 
              variant="secondaryOnPrimary"
            >
              Ücretsiz Üye Ol
            </HeroButton>
            <HeroButton 
              as={Link} 
              to="/auctions" 
              variant="primary"
            >
              İhaleleri Görüntüle
            </HeroButton>
          </CTAButtonGroup>
        </CTAContent>
      </CTASection>
    </>
  );
};

export default LandingPage;