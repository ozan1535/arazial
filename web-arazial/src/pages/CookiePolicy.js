import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2.5rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: var(--color-text);
  margin-bottom: 0.75rem;
`;

const PageSubtitle = styled.p`
  color: var(--color-text-secondary);
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const DocumentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
`;

const ContentSection = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  padding: 2.5rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
`;

const Paragraph = styled.p`
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: var(--color-text);
`;

const List = styled.ul`
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.75rem;
  line-height: 1.6;
  color: var(--color-text);
`;

const CookiePolicy = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Çerez Politikası</PageTitle>
        <PageSubtitle>
          Web sitemizde kullanılan çerezler hakkında bilgilendirme
        </PageSubtitle>
      </PageHeader>

      <DocumentMeta>
        <div>Son Güncelleme Tarihi: {new Date().toLocaleDateString('tr-TR')}</div>
      </DocumentMeta>

      <ContentSection>
        <Paragraph>
          Web sitemiz, kullanıcı deneyimini geliştirmek amacıyla çerezler kullanmaktadır. Çerezler, ziyaretçilerin site içerisindeki davranışlarını analiz etmeye ve size daha iyi hizmet sunmamıza yardımcı olur. Tarayıcı ayarlarınız üzerinden çerezleri yönetebilir veya devre dışı bırakabilirsiniz.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Çerez Nedir?</SectionTitle>
        <Paragraph>
          Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza yerleştirilen küçük metin dosyalarıdır. Bu dosyalar, web sitemizi daha etkili kullanmanızı sağlayan temel özellikleri sunmamıza yardımcı olur.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Çerez Türleri</SectionTitle>
        <List>
          <ListItem>
            <strong>Zorunlu Çerezler:</strong> Sitemizin düzgün çalışması için gerekli olan çerezlerdir.
          </ListItem>
          <ListItem>
            <strong>Analitik Çerezler:</strong> Sitemizin kullanımını analiz etmek ve performansını artırmak için kullanılır.
          </ListItem>
          <ListItem>
            <strong>İşlevsel Çerezler:</strong> Dil tercihi gibi seçimlerinizi hatırlamak için kullanılır.
          </ListItem>
          <ListItem>
            <strong>Hedefleme Çerezleri:</strong> Size özel içerik ve reklamlar sunmak için kullanılır.
          </ListItem>
        </List>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Çerezleri Nasıl Kontrol Edebilirsiniz?</SectionTitle>
        <Paragraph>
          Tarayıcınızın ayarlarını değiştirerek çerezleri kontrol edebilir veya silebilirsiniz. Ancak, çerezleri devre dışı bırakmanız durumunda web sitemizin bazı özelliklerinin düzgün çalışmayabileceğini unutmayın.
        </Paragraph>
        <List>
          <ListItem>Chrome: Ayarlar {`>`} Gelişmiş {`>`} Gizlilik ve Güvenlik {`>`} Site Ayarları {`>`} Çerezler</ListItem>
          <ListItem>Firefox: Seçenekler {`>`} Gizlilik ve Güvenlik {`>`} Çerezler ve Site Verileri</ListItem>
          <ListItem>Safari: Tercihler {`>`} Gizlilik {`>`} Çerezler ve Web Sitesi Verileri</ListItem>
          <ListItem>Edge: Ayarlar {`>`} Site İzinleri {`>`} Çerezler ve Site Verileri</ListItem>
        </List>
      </ContentSection>

      <ContentSection>
        <SectionTitle>İletişim</SectionTitle>
        <Paragraph>
          Çerez politikamız hakkında sorularınız için info@arazialcom.org adresinden bizimle iletişime geçebilirsiniz.
        </Paragraph>
      </ContentSection>
    </PageContainer>
  );
};

export default CookiePolicy; 