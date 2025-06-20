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

const LegalNotices = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Yasal Bildirimler</PageTitle>
        <PageSubtitle>
          Fikri mülkiyet hakları ve yasal uyarılar
        </PageSubtitle>
      </PageHeader>

      <DocumentMeta>
        <div>Son Güncelleme Tarihi: {new Date().toLocaleDateString('tr-TR')}</div>
      </DocumentMeta>

      <ContentSection>
        <Paragraph>
          Bu sitede yer alan tüm içerikler, ilgili fikri mülkiyet hakları kapsamında korunmaktadır. Herhangi bir içeriğin izinsiz kopyalanması, dağıtılması veya kullanılması yasal yaptırımlara neden olabilir. Yasal uyarılar, gerektiğinde güncellenebilir.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Fikri Mülkiyet Hakları</SectionTitle>
        <List>
          <ListItem>
            Tüm metinler, görseller, logolar ve diğer içerikler arazialcom'un mülkiyetindedir.
          </ListItem>
          <ListItem>
            İçeriklerin kopyalanması, çoğaltılması ve dağıtılması için yazılı izin gereklidir.
          </ListItem>
          <ListItem>
            Kullanıcılar, sadece kişisel kullanım amacıyla içerikleri görüntüleyebilir.
          </ListItem>
        </List>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Sorumluluk Reddi</SectionTitle>
        <Paragraph>
          arazialcom, sitede yer alan bilgilerin doğruluğu ve güncelliği konusunda azami özeni göstermektedir. Ancak, içeriklerin kullanımından doğabilecek doğrudan veya dolaylı zararlardan sorumlu tutulamaz.
        </Paragraph>
        <List>
          <ListItem>
            Platformdaki bilgiler yatırım tavsiyesi niteliği taşımaz.
          </ListItem>
          <ListItem>
            Kullanıcılar, kendi araştırmalarını yaparak karar vermelidir.
          </ListItem>
          <ListItem>
            Teknik aksaklıklardan kaynaklanan gecikmeler olabilir.
          </ListItem>
        </List>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Üçüncü Taraf Hakları</SectionTitle>
        <Paragraph>
          Sitemizde yer alan üçüncü taraflara ait markalar, logolar ve diğer ticari unsurlar, ilgili hak sahiplerinin mülkiyetindedir.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Yasal Yaptırımlar</SectionTitle>
        <Paragraph>
          Fikri mülkiyet haklarının ihlali durumunda, 5846 sayılı Fikir ve Sanat Eserleri Kanunu ve ilgili mevzuat kapsamında yasal işlem başlatılır.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>İletişim</SectionTitle>
        <Paragraph>
          Yasal bildirimler ve fikri mülkiyet hakları ile ilgili sorularınız için info@arazialcom.org adresinden bizimle iletişime geçebilirsiniz.
        </Paragraph>
      </ContentSection>
    </PageContainer>
  );
};

export default LegalNotices; 