import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logoImage from '../../assets/logo.png';

const FooterContainer = styled.footer`
  background: #ffffff;
  color: #333;
  padding: 4rem 0 2rem;
  margin-top: 4rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const FooterTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const FooterLogoSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
`;

const LogoBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 160px;
  @media (max-width: 768px) {
    align-items: center;
    min-width: unset;
  }
`;

const ContactBlock = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  @media (max-width: 768px) {
    align-items: center;
    width: 100%;
  }
`;

const FooterLogo = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  text-decoration: none;
  gap: 0.75rem;
  transition: all 0.3s ease;
  margin-top: 0;

  @media (min-width: 768px) {
    margin-top: 5rem;
  }

  img {
    height: 40px;
    width: auto;
  }

  &:hover {
    color: #4CAF50;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FooterDescription = styled.p`
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
  margin-top: 0.5rem;
`;

const FooterSections = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 0;
  width: 100%;

  @media (min-width: 769px) {
    cursor: default;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  position: relative;
  padding-bottom: 0.5rem;
  width: 100%;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #4CAF50, transparent);
  }
`;

const ToggleIcon = styled.span`
  display: none;
  color: #4CAF50;
  font-size: 1.2rem;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    display: block;
  }

  ${props => props.isOpen && `
    transform: rotate(180deg);
  `}
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow: hidden;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    ${props => !props.isOpen && `
      display: none;
    `}
  }
`;

const FooterLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  padding: 0.25rem 0;
  position: relative;
  width: fit-content;
    
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background: #4CAF50;
    transition: width 0.3s ease;
  }
    
  &:hover {
    color: #4CAF50;
    transform: translateX(5px);
      
    &::after {
      width: 100%;
    }
  }
`;

const FooterBottom = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
  color: #666;
  font-size: 0.9rem;
`;

const LegalLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }
`;

const ContactInfo = styled.div`
  margin-top: 1.5rem;
`;

const CompanyName = styled.h4`
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 1rem;
    margin-top: 0.25rem;
    color: #4CAF50;
    flex-shrink: 0;
  }
  
  p {
    margin: 0;
    line-height: 1.6;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialIcon = styled.a`
  color: #666;
  transition: all 0.3s ease;
  
  &:hover {
    color: #4CAF50;
    transform: translateY(-2px);
  }
  
  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const SocialTitle = styled.h4`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  position: relative;
  padding-bottom: 0.5rem;
  margin-top: 5rem;

  @media (max-width: 768px) {
    margin-top: 0;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #4CAF50, transparent);
  }
`;

const Address = styled.div`
  color: #666;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [openSections, setOpenSections] = useState({
    about: false,
    agreements: false,
    contact: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <FooterContainer>
      <FooterContent>
        <FooterTop>
          <FooterLogoSection>
            <LogoBlock>
            <SocialTitle>TAKİPTE KALIN</SocialTitle>
                <SocialIcons>
                  <SocialIcon href="https://whatsapp.com/channel/0029Va9O4lVATRSg84Ug8z01" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </SocialIcon>
                  <SocialIcon href="https://www.instagram.com/arazialcom?igsh=MWF3amUwMjIwcWs3Yw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </SocialIcon>
                  <SocialIcon href="https://www.facebook.com/share/165PLpVekx/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </SocialIcon>
                </SocialIcons>
            </LogoBlock>
          </FooterLogoSection>

          <FooterSections>
            <FooterSection>
              <SectionHeader onClick={() => toggleSection('about')}>
                <SectionTitle>Hakkımızda</SectionTitle>
                <ToggleIcon isOpen={openSections.about}>▼</ToggleIcon>
              </SectionHeader>
              <SectionContent isOpen={openSections.about}>
                <FooterLink to="/about" onClick={handleLinkClick}>Hakkımızda</FooterLink>
                <FooterLink to="/how-to-use" onClick={handleLinkClick}>Nasıl Kullanılır?</FooterLink>
                <FooterLink to="/sss" onClick={handleLinkClick}>Sıkça Sorulan Sorular</FooterLink>
              </SectionContent>
            </FooterSection>

            <FooterSection>
              <SectionHeader onClick={() => toggleSection('agreements')}>
                <SectionTitle>Sözleşmeler</SectionTitle>
                <ToggleIcon isOpen={openSections.agreements}>▼</ToggleIcon>
              </SectionHeader>
              <SectionContent isOpen={openSections.agreements}>
                <FooterLink to="/privacy-policy" onClick={handleLinkClick}>Gizlilik Politikası</FooterLink>
                <FooterLink to="/terms-of-use" onClick={handleLinkClick}>Kullanım Koşulları</FooterLink>
                <FooterLink to="/cookie-policy" onClick={handleLinkClick}>Çerez Politikası</FooterLink>
                <FooterLink to="/kvkk-aydinlatma-metni" onClick={handleLinkClick}>KVKK</FooterLink>
              </SectionContent>
            </FooterSection>

            <FooterSection>
              <SectionHeader onClick={() => toggleSection('contact')}>
                <SectionTitle>İletişim</SectionTitle>
                <ToggleIcon isOpen={openSections.contact}>▼</ToggleIcon>
              </SectionHeader>
              <SectionContent isOpen={openSections.contact}>
                <FooterLink to="/contact" onClick={handleLinkClick}>Bize Ulaşın</FooterLink>
              </SectionContent>
            </FooterSection>
          </FooterSections>
        </FooterTop>

        <FooterBottom>
          <p>© {currentYear} arazialcom. Tüm hakları saklıdır.</p>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;