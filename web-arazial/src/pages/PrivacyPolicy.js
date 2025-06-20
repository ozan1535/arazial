import React from 'react';
import styled from 'styled-components';

// Assuming these styled components are similar to KvkkAydinlatmaMetniPage or defined globally
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

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eee;
  margin: 2rem 0;
`;

const ContentSection = styled.section`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.6rem;
  color: #34495e;
  margin-bottom: 1.25rem;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const Paragraph = styled.p`
  font-size: 1rem;
  color: #555;
  margin-bottom: 1rem;
  text-align: justify;
`;

const List = styled.ul`
  list-style: disc;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
`;

const Link = styled.a`
  color: #3498db;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const PrivacyPolicy = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>GİZLİLİK POLİTİKASI</PageTitle>
      </PageHeader>

      <Paragraph>
        Bu Gizlilik Politikası, arazialcom.net ("Platform") üzerinden sunulan hizmetler sırasında elde edilen kişisel verilerin nasıl toplandığını, kullanıldığını, korunduğunu ve hangi durumlarda paylaşıldığını açıklamak amacıyla hazırlanmıştır.
      </Paragraph>

      <Divider />

      <ContentSection>
        <SectionTitle>1. Toplanan Veriler</SectionTitle>
        <Paragraph>Kullanıcılarımızdan aşağıdaki kişisel veriler toplanabilir:</Paragraph>
        <List>
          <ListItem>Ad, soyad, telefon, e-posta adresi</ListItem>
          <ListItem>IP adresi, cihaz bilgisi, işlem geçmişi</ListItem>
          <ListItem>Teklif ve teminat işlemlerine ilişkin bilgiler</ListItem>
          <ListItem>Site kullanımına ilişkin çerez verileri</ListItem>
        </List>
        <Paragraph>
          Bu veriler, doğrudan kullanıcı tarafından sağlanabileceği gibi, site üzerindeki formlar, çerezler ve işlem kayıtları aracılığıyla da elde edilebilir.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>2. Verilerin İşlenme Amaçları</SectionTitle>
        <Paragraph>Toplanan kişisel veriler aşağıdaki amaçlarla işlenebilir:</Paragraph>
        <List>
          <ListItem>Üyelik ve kimlik doğrulama süreçlerinin yürütülmesi</ListItem>
          <ListItem>Açık artırma ilanlarının sunulması ve yönetimi</ListItem>
          <ListItem>Teminat ödemeleri ve iade süreçlerinin sağlanması</ListItem>
          <ListItem>Kullanıcı bilgilendirmeleri, duyurular ve destek iletişimi</ListItem>
          <ListItem>Yasal yükümlülüklerin yerine getirilmesi</ListItem>
        </List>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>3. Hukuki Dayanaklar</SectionTitle>
        <Paragraph>Kişisel verileriniz, 6698 sayılı KVKK'nın 5. ve 6. maddelerine uygun olarak;</Paragraph>
        <List>
          <ListItem>Açık rıza</ListItem>
          <ListItem>Sözleşmenin kurulması ve ifası</ListItem>
          <ListItem>Hukuki yükümlülük</ListItem>
          <ListItem>Meşru menfaat</ListItem>
        </List>
        <Paragraph>hukuki sebeplerine dayanarak işlenmektedir.</Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>4. Verilerin Saklama Süresi</SectionTitle>
        <Paragraph>
          Kişisel veriler, mevzuatta öngörülen süre kadar veya işleme amacının gerektirdiği süre boyunca saklanır. Bu süre sona erdiğinde veriler silinir, yok edilir veya anonimleştirilir.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>5. Verilerin Aktarımı</SectionTitle>
        <Paragraph>Kişisel verileriniz;</Paragraph>
        <List>
          <ListItem>Ödeme altyapı sağlayıcıları</ListItem>
          <ListItem>Web sunucu ve yazılım hizmeti sağlayıcıları</ListItem>
          <ListItem>Yasal yükümlülük nedeniyle yetkili kamu kurumları</ListItem>
        </List>
        <Paragraph>ile yalnızca hizmetin gereği ve yasal zorunluluk durumunda paylaşılabilir.</Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>6. Bilgi Güvenliği</SectionTitle>
        <Paragraph>Kullanıcı verileri, güncel teknolojik önlemlerle korunur.</Paragraph>
        <List>
          <ListItem>Tüm iletişim SSL (HTTPS) ile şifrelenmektedir.</ListItem>
          <ListItem>Erişim sadece yetkili kişilerle sınırlıdır.</ListItem>
          <ListItem>Sunucu ve veri güvenliği için teknik ve idari tedbirler alınmaktadır.</ListItem>
        </List>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>7. Çerez Politikası</SectionTitle>
        <Paragraph>arazialcom.net, kullanıcı deneyimini geliştirmek için çerezlerden faydalanır:</Paragraph>
        <List>
          <ListItem>Zorunlu çerezler: Sitenin temel işlevleri için gereklidir.</ListItem>
          <ListItem>İstatistik çerezleri: Site trafiği analizinde kullanılır.</ListItem>
          <ListItem>Tercih çerezleri: Kullanıcı ayarlarını hatırlar.</ListItem>
        </List>
        <Paragraph>
          Tarayıcınızın ayarlarından çerezleri yönetebilir veya engelleyebilirsiniz. Çerez kullanımına ilişkin detaylara "Çerez Politikası" sayfamızdan ulaşabilirsiniz.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>8. Kullanıcı Hakları</SectionTitle>
        <Paragraph>KVKK'nın 11. maddesi uyarınca;</Paragraph>
        <List>
          <ListItem>Verilerinizin işlenip işlenmediğini öğrenme</ListItem>
          <ListItem>Düzeltme, silme veya anonimleştirme talep etme</ListItem>
          <ListItem>Aktarıldığı kişileri öğrenme</ListItem>
          <ListItem>İşlemlere itiraz etme</ListItem>
          <ListItem>Zarara uğranması hâlinde tazminat talep etme</ListItem>
        </List>
        <Paragraph>haklarına sahipsiniz.</Paragraph>
        <Paragraph>
          Bu haklarınızı kullanmak için bize info@arazialcom.org adresinden ulaşabilirsiniz.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>9. Politika Güncellemeleri</SectionTitle>
        <Paragraph>
          Bu gizlilik politikası zaman zaman güncellenebilir. Güncel haline arazialcom.net üzerinden her zaman ulaşabilirsiniz.
        </Paragraph>
      </ContentSection>
    </PageContainer>
  );
};

export default PrivacyPolicy; 