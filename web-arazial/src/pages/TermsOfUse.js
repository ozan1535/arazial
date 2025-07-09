import React from "react";
import styled from "styled-components";

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

const Emphasis = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #f8fafc;
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--color-primary);
  font-weight: 600;
`;

const Divider = styled.hr`
  margin: 1.5rem 0;
  border: 0;
  border-top: 1px solid var(--color-border);
`;

const TermsOfUse = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>KULLANIM KOŞULLARI</PageTitle>
        <PageSubtitle>MESAFELİ HİZMET SÖZLEŞMESİ</PageSubtitle>
      </PageHeader>

      <DocumentMeta>
        <div>Yürürlülük Tarihi: 29/03/2025</div>
        <div>Son Güncelleme Tarihi: 29/03/2025</div>
      </DocumentMeta>

      <Emphasis>
        LÜTFEN BU KULLANIM KOŞULLARINI DİKKATLİCE OKUYUNUZ. BU PLATFORMU
        KULLANARAK, AŞAĞIDAKİ ŞART VE KOŞULLARI KABUL ETMİŞ SAYILIRSINIZ.
      </Emphasis>

      <ContentSection>
        <SectionTitle>1. Taraflar</SectionTitle>
        <Paragraph>
          İşbu Mesafeli Hizmet Sözleşmesi, bir tarafta ARAZİALCOM EMLAK SANAYİ
          VE TİCARET LİMİTED ŞİRKETİ (“Hizmet Sağlayıcı” olarak anılacaktır),
          diğer tarafta platforma üye olan ve teminat ödemesi gerçekleştiren
          kullanıcı (“Hizmet Alan” olarak anılacaktır) arasında, aşağıdaki
          şartlar çerçevesinde elektronik ortamda kurulmuştur.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>2. Konu</SectionTitle>
        <Paragraph>
          İşbu sözleşme, Hizmet Alan’ın ARAZİALCOM platformunda yayınlanan
          taşınmazlara katılım teminatı ödeyerek başvuru ve açık artırmaya
          katılım hakkı kazanması sürecine ilişkin şartları düzenler. Bu
          sözleşme herhangi bir taşınmazın satışı değil, yalnızca başvuru ve
          açık artırmaya katılım hizmeti sunulmasına ilişkindir.
        </Paragraph>
        <Paragraph>
          Bu sözleşme herhangi bir taşınmazın satışı değil, yalnızca başvuru ve
          açık artırmaya katılım hizmeti sunulmasına ilişkindir.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>3. Hizmetin Kapsamı</SectionTitle>
        <List>
          <ListItem>
            Hizmet Alan, ilanda belirtilen teminat tutarını ödeyerek ilgili
            taşınmaza teklif verme hakkı elde eder.
          </ListItem>
          <ListItem>Teminat ödemesi yapılmadan teklif verilemez.</ListItem>
          <ListItem>
            Açık artırma süreci, sistem üzerinden dijital ortamda şeffaf bir
            şekilde yürütülür ve en yüksek teklifi veren kullanıcı sistem
            tarafından otomatik olarak belirlenir.
          </ListItem>
          <ListItem>
            ARAZİALCOM, yalnızca dijital altyapıyı sağlar; doğrudan satış
            gerçekleştirmez ve taşınmaz mülkiyeti devrinden sorumlu değildir.
          </ListItem>
        </List>
      </ContentSection>

      <ContentSection>
        <SectionTitle>4.⁠ ⁠Teminat ve İade Koşulları</SectionTitle>
        <List>
          <ListItem>
            Teminat ödemesi, başvurulan taşınmaza katılım amacıyla tahsil
            edilir.
          </ListItem>
          <ListItem>
            Satın alma işlemi gerçekleşmezse, teminat bedeli 7 (yedi) iş günü
            içerisinde iade edilir.
          </ListItem>
          <ListItem>
            Satın alma işlemi gerçekleştiği takdirde, teminat bedeli satış
            bedelinden düşülür.
          </ListItem>
          <ListItem>
            Kullanıcının hatalı IBAN, hesap bilgisi gibi nedenlerle iade
            sürecinde yaşanacak gecikmelerden Hizmet Sağlayıcı sorumlu
            tutulamaz.
          </ListItem>
          <ListItem>
            ⁠ARAZİALCOM tarafından satışa sunulan taşınmazlara ilişkin olarak
            bölgesel piyasa koşulları dikkate alınarak bağımsız ekspertiz
            çalışmaları yapılmaktadır. Açık artırma sonucunda verilen teklifin
            belirlenen ekspertiz değerinin altında kalması durumunda satış
            işlemi gerçekleştirilmez. Bu durumda yatırılan teminat bedeli,
            herhangi bir kesinti yapılmaksızın kullanıcıya iade edilir.
          </ListItem>
        </List>
      </ContentSection>

      <ContentSection>
        <SectionTitle>5.⁠ ⁠Cayma Hakkı</SectionTitle>
        <List>
          <ListItem>
            Kullanıcı, teminat ödemesini yaptıktan sonra taşınmaza teklif
            vermemişse, 14 (on dört) gün içerisinde cayma hakkını kullanabilir.
          </ListItem>
          <ListItem>
            Cayma hakkı kullanıldığı takdirde, teminat bedeli kullanıcıya iade
            edilir.
          </ListItem>
        </List>
      </ContentSection>

      <ContentSection>
        <SectionTitle>6.⁠ ⁠Sözleşmenin Süresi</SectionTitle>
        <Paragraph>
          Bu sözleşme, teminat ödemesiyle birlikte elektronik ortamda yürürlüğe
          girer ve ilgili başvuru süreci sona erdiğinde veya teminat iadesi
          yapıldığında kendiliğinden sona erer.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>7.⁠ ⁠Uyuşmazlıkların Çözümü</SectionTitle>
        <Paragraph>
          Taraflar arasında doğabilecek uyuşmazlıklar öncelikle uzlaşma yoluyla
          çözülmeye çalışılır. Çözülemeyen durumlarda, Manisa Akhisar
          Mahkemeleri ve İcra Daireleri yetkilidir.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>8.⁠ ⁠Kişisel Verilerin Korunması</SectionTitle>
        <Paragraph>
          Kullanıcıların kişisel verileri, 6698 sayılı Kişisel Verilerin
          Korunması Kanunu (“KVKK”) kapsamında işlenmekte olup, ARAZİALCOM
          tarafından yalnızca hizmetin sunulması amacıyla kullanılmaktadır.
          Kişisel verilerinizin işlenmesine ilişkin detaylı bilgiye KVKK
          Aydınlatma Metni üzerinden ulaşabilirsiniz.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>9.⁠ ⁠Sorumluluk Reddi</SectionTitle>
        <Paragraph>
          ARAZİALCOM, sistemde meydana gelebilecek geçici erişim kesintileri,
          teknik arızalar, veri kaybı veya bağlantı sorunlarından dolayı
          doğabilecek zararlar için sorumluluk kabul etmez. Açık artırma süreci
          tamamen dijital ortamda yürütülmekte olup, kullanıcıların internet
          bağlantı veya cihaz kaynaklı sorunlarından Hizmet Sağlayıcı sorumlu
          değildir.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>10.⁠ ⁠Değişiklik Hakkı</SectionTitle>
        <Paragraph>
          ARAZİALCOM, açık artırma şartlarında, taşınmaz bilgileri üzerinde
          gerekli gördüğü değişiklikleri yapma ve sistemde iyileştirme amacıyla
          güncelleme yapma hakkını saklı tutar. Bu tür değişiklikler, platformda
          yayımlandığı anda geçerlilik kazanır.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>11.⁠ ⁠Başvurunun Reddedilmesi</SectionTitle>
        <Paragraph>
          ARAZİALCOM, kullanıcı başvurularını; eksik belge, hatalı bilgi veya
          güvenlik gerekçeleri ile reddetme hakkını saklı tutar. Başvurunun
          reddedilmesi halinde, ödenen teminat bedeli kullanıcıya iade edilir.
        </Paragraph>
      </ContentSection>

      <ContentSection>
        <SectionTitle>12. İletişim Bilgileri</SectionTitle>
        <Paragraph>
          ARAZİALCOM EMLAK SANAYİ VE TİCARET LİMİTED ŞİRKETİ
          <br />
          Adres: ULU CAMİİ MAH. 388 SK. NO:29/1B, AKHİSAR / MANİSA
          <br />
          Vergi No: 0730982784
          <br />
          E-posta: info@arazialcom.org
        </Paragraph>
      </ContentSection>
    </PageContainer>
  );
};

export default TermsOfUse;
