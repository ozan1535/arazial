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

const EmphasisBox = styled.div`
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--color-primary);
`;

const Security = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Güvenlik</PageTitle>
        <PageSubtitle>
          Kullanıcı bilgilerinin güvenliği ve veri koruma önlemlerimiz
        </PageSubtitle>
      </PageHeader>

      <DocumentMeta>
        <div>Son Güncelleme Tarihi: {new Date().toLocaleDateString('tr-TR')}</div>
      </DocumentMeta>

      <ContentSection>
        <Paragraph>
          Kullanıcı bilgilerinin güvenliği en yüksek önceliğimizdir. Gerekli teknik ve idari önlemler alınarak veri güvenliği sağlanmaktadır. Şüpheli durumları bize bildirmeniz durumunda hızlıca aksiyon alınır.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Güvenlik Önlemlerimiz</SectionTitle>
        <List>
          <ListItem>
            <strong>SSL Şifreleme:</strong> Tüm veri transferleri SSL protokolü ile şifrelenerek gerçekleştirilir.
          </ListItem>
          <ListItem>
            <strong>Güvenli Ödeme:</strong> Ödeme işlemleri PCI DSS uyumlu güvenli sistemler üzerinden yapılır.
          </ListItem>
          <ListItem>
            <strong>Veri Şifreleme:</strong> Hassas kullanıcı verileri şifrelenerek saklanır.
          </ListItem>
          <ListItem>
            <strong>Düzenli Denetim:</strong> Sistemlerimiz düzenli olarak güvenlik testlerinden geçirilir.
          </ListItem>
        </List>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Kullanıcı Güvenlik Önerileri</SectionTitle>
        <List>
          <ListItem>Güçlü ve benzersiz şifreler kullanın</ListItem>
          <ListItem>Şifrelerinizi kimseyle paylaşmayın</ListItem>
          <ListItem>Düzenli olarak şifrenizi değiştirin</ListItem>
          <ListItem>Şüpheli aktiviteleri hemen bildirin</ListItem>
          <ListItem>Ortak kullanılan cihazlarda oturum açık bırakmayın</ListItem>
        </List>
      </ContentSection>

      <ContentSection>
        <SectionTitle>İki Faktörlü Doğrulama</SectionTitle>
        <Paragraph>
          Hesap güvenliğinizi artırmak için iki faktörlü doğrulama sistemimizi kullanmanızı öneririz. Bu özellik, hesabınıza yalnızca siz olduğunuzu doğruladıktan sonra erişim sağlar.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Şüpheli Durum Bildirimi</SectionTitle>
        <EmphasisBox>
          Hesabınızla ilgili şüpheli bir durum fark ederseniz, lütfen hemen info@arazialcom.org adresine e-posta gönderin veya müşteri hizmetlerimizi arayın.
        </EmphasisBox>
        <List>
          <ListItem>Yetkisiz giriş denemeleri</ListItem>
          <ListItem>Şüpheli işlemler</ListItem>
          <ListItem>Hesap bilgilerinde değişiklikler</ListItem>
          <ListItem>Güvenlik açıkları</ListItem>
        </List>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Veri Merkezi Güvenliği</SectionTitle>
        <Paragraph>
          Verileriniz, yüksek güvenlikli veri merkezlerinde saklanmaktadır. Fiziksel ve dijital güvenlik önlemleriyle korunmaktadır.
        </Paragraph>
        <List>
          <ListItem>7/24 izleme ve denetim</ListItem>
          <ListItem>Yedekleme sistemleri</ListItem>
          <ListItem>Felaket kurtarma planları</ListItem>
          <ListItem>Düzenli güvenlik güncellemeleri</ListItem>
        </List>
      </ContentSection>
    </PageContainer>
  );
};

export default Security; 