import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  color: #333;
  line-height: 1.8;

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1.5rem;
  }
`;

const PageHeader = styled.header`
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
`;

const DocumentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #95a5a6;
  margin-bottom: 2.5rem;
  padding: 0.75rem 0;
  border-top: 1px dashed #eee;
  border-bottom: 1px dashed #eee;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
`;

const ContentSection = styled.section`
  margin-bottom: 2.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.6rem;
  color: #34495e;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #ecf0f1;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const Paragraph = styled.p`
  font-size: 1rem;
  color: #555;
  margin-bottom: 1rem;
  text-align: justify;

  strong {
    color: #2c3e50;
  }
`;

const HorizontalRule = styled.hr`
  border: none;
  border-top: 1px dashed #ccc;
  margin: 2rem 0;
`;

const SartlarVeKosullarPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Şartlar ve Koşullar</PageTitle>
      </PageHeader>

      <DocumentMeta>
        <div>Yürürlülük Tarihi: {new Date().toLocaleDateString('tr-TR')}</div>
        <div>Son Güncelleme Tarihi: {new Date().toLocaleDateString('tr-TR')}</div>
      </DocumentMeta>

      <ContentSection>
        <SectionTitle>1. Kullanım Şartları</SectionTitle>
        <Paragraph>
          Bu web sitesini kullanarak aşağıda belirtilen şartları kabul etmiş sayılırsınız.
          arazialcom.net, ilan sahiplerinin taşınmazlarını açık artırma veya teklif usulüyle yayınlayabildiği bir dijital platformdur.
          arazialcom, ilan sahibi ile alıcı arasında gerçekleşecek satış işlemlerine doğrudan taraf değildir ve yalnızca altyapı hizmeti sunar.
          Kullanıcılar, platformu kullanırken Türkiye Cumhuriyeti yasalarına ve ilgili tüm mevzuata uygun hareket etmekle yükümlüdür.
        </Paragraph>
      </ContentSection>

      <HorizontalRule />

      <ContentSection>
        <SectionTitle>2. Mesafeli Satış Sözleşmesi</SectionTitle>
        <Paragraph>
          <strong>Sözleşmenin Konusu</strong>
        </Paragraph>
        <Paragraph>
          İşbu sözleşme, www.arazialcom.net adresinden sunulan dijital hizmetlerin (ilan yayını, teklif alma sistemi, ödeme altyapısı vb.) uzaktan sunulmasına ilişkin hükümleri kapsar.
          Kullanıcı, dijital ortamda sağlanan hizmetlerden yararlanmayı kabul ettiğinde bu sözleşme yürürlüğe girer.
          arazialcom, yalnızca hizmet altyapısı sağlayan aracı konumundadır; satıcı veya alıcı sıfatı bulunmamaktadır.
        </Paragraph>
      </ContentSection>

      <HorizontalRule />

      <ContentSection>
        <SectionTitle>3. İptal ve İade Koşulları</SectionTitle>
        <Paragraph>
          <strong>Dijital Hizmetlerde İade Politikası</strong>
        </Paragraph>
        <Paragraph>
          arazialcom üzerinden sunulan hizmetler dijital niteliklidir.
          İlan yayını veya teklif altyapısı aktif hale geldikten sonra iade ya da iptal işlemi yapılamaz.
          Ancak, teknik aksaklık nedeniyle hizmetin hiç sağlanamaması durumunda, kullanıcı info@arazialcom.org adresi üzerinden başvuruda bulunabilir.
          Talepler 7 iş günü içinde değerlendirilerek geri dönüş sağlanır.
        </Paragraph>
      </ContentSection>

    </PageContainer>
  );
};

export default SartlarVeKosullarPage; 