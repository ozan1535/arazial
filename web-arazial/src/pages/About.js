import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  
  @media (min-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 2rem;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.5rem;
`;

const Paragraph = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.75;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--color-surface-secondary);
  margin: 3rem 0;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  color: var(--color-text-secondary);
  line-height: 1.75;
  margin-bottom: 1rem;
  font-size: 1.125rem;
  display: flex;
  align-items: baseline;
  
  &:before {
    content: "•";
    color: var(--color-primary);
    font-weight: bold;
    margin-right: 0.75rem;
  }
`;

const NumberedList = styled.ol`
  padding-left: 1.25rem;
  margin: 1.5rem 0;
`;

const NumberedListItem = styled.li`
  color: var(--color-text-secondary);
  line-height: 1.75;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
  padding-left: 0.5rem;
  
  &::marker {
    color: var(--color-primary);
    font-weight: 600;
  }
`;

const About = () => {
  return (
    <AboutContainer>
      <Title>Hakkımızda</Title>
      
      <Section>
        <Paragraph>
          ARAZIALCOM EMLAK SANAYİ VE TİCARET LİMİTED ŞİRKETİ, Türkiye genelinde tapulu taşınmazların dijital ortamda açık artırma yöntemiyle başvuru süreçlerini yönetmek amacıyla kurulmuş bir teknoloji platformudur.
        </Paragraph>
        
        <Paragraph>
          Amacımız; güvenilir, şeffaf ve kolay erişilebilir bir sistem ile gayrimenkul açık artırma başvuru süreçlerini dijitalleştirerek, kullanıcıların zaman ve maliyet avantajı elde etmesini sağlamaktır.
        </Paragraph>

        <Paragraph>
          ARAZIALCOM EMLAK SANAYİ VE TİCARET LİMİTED ŞİRKETİ üzerinde yapılan işlemler satış amacı taşımaz; yalnızca kullanıcıların ilgilendikleri tapulu taşınmazlara açık artırma yoluyla katılım başvurusu yapabilmesini sağlar.<br/>
          Her başvuru için teminat bedeli tahsil edilmekte olup, işlem gerçekleşmediği durumlarda teminat tutarı eksiksiz ve şartsız şekilde iade edilmektedir.
        </Paragraph>
      </Section>
      
      <Divider />
      
      <Section>
        <SectionTitle>Sistem Nasıl Çalışır?</SectionTitle>
        
        <Paragraph>
          arazialcom'da taşınmaz başvuru süreci şu şekilde işlemektedir:
        </Paragraph>
        
        <NumberedList>
          <NumberedListItem>
            <strong>Taşınmaz İnceleme:</strong><br/>
            Platformda yayınlanan tapulu taşınmazların detay bilgilerini, konumlarını ve özelliklerini dijital ortamda kolayca inceleyebilirsiniz.
          </NumberedListItem>
          
          <NumberedListItem>
            <strong>Açık Artırmaya Katılım:</strong><br/>
            İlgilendiğiniz taşınmaz için belirtilen teminat bedelini yatırarak açık artırmaya katılabilirsiniz.
          </NumberedListItem>
          
          <NumberedListItem>
            <strong>Açık Artırma Süreci ve Sonuç:</strong><br/>
            Gerçek zamanlı ve şeffaf açık artırmalar sistem tarafından otomatik olarak yürütülür.<br/>
            Açık artırma sonunda en yüksek teklifi veren kullanıcı otomatik olarak belirlenir.<br/>
            İşlem gerçekleşmediği durumlarda, yatırılan teminat bedeli eksiksiz ve şartsız olarak iade edilir.
          </NumberedListItem>
        </NumberedList>
        
        <Paragraph>
          Tüm süreç dijital ortamda şeffaf bir şekilde yürütülmekte olup, kullanıcılarımıza hem zaman hem de maliyet açısından avantaj sağlamaktadır.
        </Paragraph>
      </Section>
      
      <Divider />
      
      <Section>
        <SectionTitle>Neden arazialcom?</SectionTitle>
        <List>
          <ListItem>✅ Güvenilir ve şeffaf açık artırma sistemi</ListItem>
          <ListItem>✅ Teminat sistemiyle güvenli katılım</ListItem>
          <ListItem>✅ Kullanıcı dostu, hızlı ve pratik dijital platform</ListItem>
          <ListItem>✅ İşlem gerçekleşmediğinde şartsız teminat iadesi</ListItem>
          <ListItem>✅ Dijital ortamda gerçek zamanlı açık artırmalarla tapulu taşınmazlara başvuru imkânı</ListItem>
        </List>
        
        <Paragraph style={{ marginTop: '2rem' }}>
          ARAZIALCOM EMLAK SANAYİ VE TİCARET LİMİTED ŞİRKETİ, modern teknolojiyi kullanarak gayrimenkul açık artırma ve başvuru süreçlerini daha güvenilir, daha şeffaf ve daha erişilebilir hale getirmek için kurulmuştur.<br/>
          Amacımız; kullanıcılarımıza sadece bir platform sunmak değil, güven esaslı bir gayrimenkul deneyimi yaşatmaktır.
        </Paragraph>
      </Section>
    </AboutContainer>
  );
};

export default About; 
