import React from 'react';
import styled from 'styled-components';

// Basic styling, can be enhanced later or use existing styled components if available
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

const SubSectionTitle = styled.h3`
  font-size: 1.3rem;
  color: #34495e;
  margin-bottom: 1rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
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

const List = styled.ul`
  list-style: disc;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
`;

const KvkkAydinlatmaMetniPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>KİŞİSEL VERİLERİN KORUNMASI POLİTİKASI</PageTitle>
      </PageHeader>

      <ContentSection>
        <SectionTitle>1. Giriş</SectionTitle>
        <Paragraph>
          arazialcom ("Şirket"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verilerinizin güvenliğine büyük önem vermektedir. Bu politika, kullanıcılarımızın verilerinin hangi amaçlarla, hangi yöntemlerle işlendiğini ve haklarını açıklamaktadır.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>2. Veri Sorumlusu</SectionTitle>
        <Paragraph>
          <strong>Veri sorumlusu:</strong> arazialcom<br />
          <strong>İletişim:</strong> info@arazialcom.org
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>3. İşlenen Kişisel Veriler</SectionTitle>
        <List>
          <ListItem>Kimlik bilgileri (Ad-soyad, TCKN)</ListItem>
          <ListItem>İletişim bilgileri (Telefon, e-posta)</ListItem>
          <ListItem>Kullanıcı işlem bilgileri</ListItem>
          <ListItem>Ödeme ve teminat verileri</ListItem>
          <ListItem>Cihaz/IP verileri</ListItem>
        </List>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>4. Veri İşleme Amaçları</SectionTitle>
        <List>
          <ListItem>Üyelik işlemlerinin gerçekleştirilmesi</ListItem>
          <ListItem>Teklif ve teminat süreçlerinin yürütülmesi</ListItem>
          <ListItem>Finansal kayıtların tutulması</ListItem>
          <ListItem>Yasal yükümlülüklerin yerine getirilmesi</ListItem>
          <ListItem>Kullanıcı deneyiminin geliştirilmesi</ListItem>
        </List>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>5. Hukuki Sebepler</SectionTitle>
        <Paragraph>
          KVKK md. 5/2 çerçevesinde; sözleşmenin kurulması, hukuki yükümlülüklerin yerine getirilmesi, meşru menfaat gereklilikleri gibi hukuki sebeplere dayanarak işlenir.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>6. Veri Aktarımı</SectionTitle>
        <Paragraph>Verileriniz;</Paragraph>
        <List>
          <ListItem>Yetkili kamu kurumları,</ListItem>
          <ListItem>Ödeme altyapısı sağlayıcıları,</ListItem>
          <ListItem>Teknik destek hizmeti alınan üçüncü kişilerle</ListItem>
        </List>
        <Paragraph>yasal sınırlar dahilinde paylaşılabilir.</Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>7. Saklama Süresi</SectionTitle>
        <Paragraph>
          Kişisel veriler, ilgili mevzuatta öngörülen süreler boyunca saklanır; süre sonunda anonimleştirilerek veya silinerek imha edilir.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>8. KVKK Kapsamında Haklarınız</SectionTitle>
        <Paragraph>
          KVKK madde 11 kapsamında; veri işlenip işlenmediğini öğrenme, düzeltme, silme, itiraz etme gibi tüm yasal haklara sahipsiniz.
        </Paragraph>
        <Paragraph>
          Başvurularınızı <strong>info@arazialcom.org</strong> adresine yazılı olarak iletebilirsiniz.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>2. PAZARLAMA VE AÇIK RIZA AYDINLATMA METNİ</SectionTitle>
        <Paragraph>
          Tarafınıza kampanya, duyuru, tanıtım, reklam ve bilgilendirme yapılabilmesi amacıyla iletişim bilgilerinizin kullanılması; 6698 sayılı KVKK uyarınca sadece açık rızanız ile mümkündür.
        </Paragraph>
        <Paragraph>Rıza göstermeniz halinde;</Paragraph>
        <List>
          <ListItem>E-posta, SMS ve mobil bildirim gönderimi yapılabilir,</ListItem>
          <ListItem>Verileriniz pazarlama amacı dışında kullanılmaz,</ListItem>
          <ListItem>Her zaman iletişimden çıkma hakkınız bulunmaktadır.</ListItem>
        </List>
        <Paragraph>
          Açık rızanızı dilediğiniz zaman iptal etmek için <strong>info@arazialcom.org</strong> adresinden bize ulaşabilirsiniz.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>3. ÇEREZ AYDINLATMA METNİ</SectionTitle>
        <Paragraph>
          arazialcom olarak, internet sitemizi ve uygulamalarımızı ziyaret ettiğinizde deneyiminizi iyileştirmek ve istatistiksel analiz yapmak amacıyla çerez (cookie) teknolojilerinden faydalanıyoruz.
        </Paragraph>
        <SubSectionTitle>Kullanılan Çerez Türleri:</SubSectionTitle>
        <List>
          <ListItem><strong>Zorunlu çerezler:</strong> Oturum yönetimi ve güvenlik</ListItem>
          <ListItem><strong>Performans çerezleri:</strong> Site trafiği ve hata takibi</ListItem>
          <ListItem><strong>Hedefleme çerezleri:</strong> Pazarlama ve kullanıcı tercihleri</ListItem>
        </List>
        <Paragraph>
          Tarayıcınızdan çerezleri reddedebilir veya yönetebilirsiniz. Detaylı bilgi için <strong>info@arazialcom.org</strong> üzerinden bize ulaşabilirsiniz.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>4. KULLANIM KOŞULLARI</SectionTitle>
        
        <SubSectionTitle>1. Tanımlar</SubSectionTitle>
        <Paragraph>
          <strong>"Platform":</strong> www.arazialcom.net alan adlı web sitesi.<br />
          <strong>"Kullanıcı":</strong> Platforma kayıtlı veya ziyaretçi sıfatıyla erişim sağlayan gerçek veya tüzel kişiler.<br />
          <strong>"Satıcı":</strong> İlan oluşturan ve arazisini satışa çıkaran tüzel kişilerdir.<br />
          <strong>"arazialcom":</strong> Platformun yöneticisi ve altyapı sağlayıcısıdır.
        </Paragraph>

        <SubSectionTitle>2. Hizmet Tanımı</SubSectionTitle>
        <Paragraph>
          arazialcom; arazi satışı yapan firmaların ilanlarını yayımlayan, teminatlı tekliflerin alınmasına imkân sağlayan, ilan listeleme ve ödeme altyapısı sunan bir çevrimiçi platformdur.
          arazialcom satışa taraf değildir.
        </Paragraph>

        <SubSectionTitle>3. Kullanıcı Yükümlülükleri</SubSectionTitle>
        <List>
          <ListItem>Gerçek ve doğru bilgi vermek,</ListItem>
          <ListItem>Kendi hesabının güvenliğini sağlamak,</ListItem>
          <ListItem>Teminat ödeme yükümlülüklerine uymak,</ListItem>
          <ListItem>Platformu kötüye kullanmamak.</ListItem>
        </List>

        <SubSectionTitle>4. Teminat Sistemi</SubSectionTitle>
        <List>
          <ListItem>Her teklif için belirtilen tutarda teminat alınır.</ListItem>
          <ListItem>Teklif kazanılmazsa teminat, 7 iş günü içinde iade edilir.</ListItem>
          <ListItem>Ödeme ve iade süreçleri sanal POS sistemi üzerinden yürütülür.</ListItem>
        </List>

        <SubSectionTitle>5. Sorumluluk Reddi</SubSectionTitle>
        <Paragraph>
          arazialcom, ilan içeriğinin doğruluğu ve satış sonrası işlemlerden sorumlu değildir.
          Her satış, kazanan kullanıcı ile ilan sahibi arasında gerçekleşir.
        </Paragraph>

        <SubSectionTitle>6. Fesih</SubSectionTitle>
        <Paragraph>
          arazialcom, üyeliği herhangi bir gerekçeyle sonlandırma hakkını saklı tutar.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>5. VERİ SAHİBİ BAŞVURU FORMU</SectionTitle>
        
        <SubSectionTitle>Başvuru Yöntemleri:</SubSectionTitle>
        <List>
          <ListItem><strong>E-posta:</strong> info@arazialcom.org</ListItem>
          <ListItem><strong>Posta:</strong> [Şirket adresi buraya eklenecek]</ListItem>
        </List>

        <SubSectionTitle>Zorunlu Bilgiler:</SubSectionTitle>
        <List>
          <ListItem>Ad-soyad</ListItem>
          <ListItem>T.C. kimlik numarası</ListItem>
          <ListItem>E-posta veya telefon</ListItem>
          <ListItem>Talep konusu</ListItem>
          <ListItem>İmza</ListItem>
        </List>

        <Paragraph>
          Başvurular en geç 30 gün içinde yazılı olarak yanıtlanır. Kimlik doğrulaması gerekebilir.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>6. MESAFELİ SATIŞ SÖZLEŞMESİ – TEKLİF</SectionTitle>
        <Paragraph>
          Bu sözleşme, teklif veren kullanıcı ("Alıcı") ile ilan yayınlayan firma ("Satıcı") arasında, arazialcom'un yalnızca aracı platform olarak yer aldığı teklif sürecine ilişkindir.
        </Paragraph>
        <List>
          <ListItem>Alıcı, ihaleye katılım için teminat yatırmakla yükümlüdür.</ListItem>
          <ListItem>Kazanan kullanıcı dışında kalan tüm kullanıcılara teminat kesintisiz iade edilir.</ListItem>
          <ListItem>Satışa ilişkin nihai sözleşme alıcı ile satıcı arasında yapılır.</ListItem>
          <ListItem>arazialcom, satış sözleşmesine taraf değildir.</ListItem>
        </List>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>7. MESAFELİ SATIŞ SÖZLEŞMESİ</SectionTitle>
        
        <SubSectionTitle>Taraflar:</SubSectionTitle>
        <List>
          <ListItem><strong>Satıcı:</strong> İlan sahibi tüzel kişi</ListItem>
          <ListItem><strong>Alıcı:</strong> İhaleyi kazanan kullanıcı</ListItem>
        </List>

        <Paragraph>
          Bu sözleşme, yalnızca ihaleyi kazanan kullanıcı ile ilan sahibi arasında yapılır. Satışa konu taşınmazın devri, noter veya tapu müdürlüğü huzurunda gerçekleştirilir.
          arazialcom, bu sürece taraf değildir ve garanti vermez.
        </Paragraph>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>8. ÜYELİK SÖZLEŞMESİ</SectionTitle>
        
        <SubSectionTitle>1. Üyelik Şartları:</SubSectionTitle>
        <List>
          <ListItem>Kullanıcı, kayıt olurken doğru bilgi vermekle yükümlüdür.</ListItem>
          <ListItem>Üyelik ücretsizdir ve iptal edilebilir.</ListItem>
        </List>

        <SubSectionTitle>2. Kullanım Alanı:</SubSectionTitle>
        <List>
          <ListItem>Kullanıcı, yalnızca teklif verme, ilan görüntüleme ve ödeme işlemleri için platformu kullanabilir.</ListItem>
          <ListItem>İlan yayınlama yalnızca yetkili satıcı hesapları üzerinden gerçekleştirilir.</ListItem>
        </List>

        <SubSectionTitle>3. Sorumluluk ve Fesih:</SubSectionTitle>
        <List>
          <ListItem>arazialcom, platformu kötüye kullanan hesapları durdurabilir.</ListItem>
          <ListItem>Her kullanıcı, hesabından yapılan işlemlerden sorumludur.</ListItem>
        </List>
      </ContentSection>

      <Divider />

      <ContentSection>
        <SectionTitle>9. GİZLİLİK POLİTİKASI</SectionTitle>
        <Paragraph>
          arazialcom, kullanıcıların gizliliğine önem verir. Kişisel veriler:
        </Paragraph>
        <List>
          <ListItem>Sadece yasal zorunluluk ve kullanıcı onayı ile işlenir,</ListItem>
          <ListItem>Üçüncü kişilerle yalnızca hizmet sunum amacıyla paylaşılır,</ListItem>
          <ListItem>Güvenli sunucularda saklanır ve yetkisiz erişime karşı korunur,</ListItem>
          <ListItem>Ticari amaçla satılmaz, pazarlanmaz, saklanmaz.</ListItem>
        </List>
      </ContentSection>
    </PageContainer>
  );
};

export default KvkkAydinlatmaMetniPage; 