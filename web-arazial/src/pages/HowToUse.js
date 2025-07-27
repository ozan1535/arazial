import React from "react";
import styles from "../styles/HowToUse.module.css";

const HowItWorks = () => {
  return (
    <div className={styles.container}>
      <section>
        <h2>📌 1. Nasıl Çalışır?</h2>
        <p>
          arazialcom, yalnızca kendi kontrolünde bulunan taşınmazları dijital
          ortamda satışa sunar. Ayrıca tapu ve mülkiyet durumu teyit edilmiş,
          güvenilir firmalara ait ilanlar da denetimden geçirilerek platformda
          yayınlanabilir.
        </p>
        <p>
          Tüm işlemler dijital ortamda, şeffaf ve kayıt altına alınmış şekilde
          gerçekleştirilir.
        </p>
        <p>Satışlar iki yöntemle yapılır:</p>

        <h3>🟢 Açık Artırma</h3>
        <ul>
          <li>İlanlar yalnızca arazialcom tarafından yayınlanır.</li>
          <li>
            Katılım için belirlenen teminat bedelinin yatırılması zorunludur.
          </li>
          <li>
            Kullanıcı, açık artırmaya katılmak için platforma üye olmalı ve
            kimlik doğrulamasını tamamlamalıdır.
          </li>
          <li>Her ilan için başlangıç fiyatı ve artış tutarı sabittir.</li>
          <li>
            “Teklif Ver” butonuna basıldığında, sistem mevcut en yüksek teklifin
            üzerine otomatik olarak belirlenen artış tutarını ekler.
          </li>
          <li>
            Örnek: Başlangıç fiyatı 60.000 TL, artış tutarı 3.000 TL ise
            teklifler şu şekilde ilerler: 63.000 TL, 66.000 TL, 69.000 TL…
          </li>
          <li>Süre sonunda en yüksek teklifi veren kullanıcı kazanır.</li>
          <li>Kazanan kişi ödeme yapmazsa teminat bedeli yanar.</li>
          <li>
            Satış tamamlandığında, yatırılan teminat satış fiyatından düşülür.
          </li>
        </ul>

        <h3>🟢 Hemen Al</h3>
        <ul>
          <li>İlan sabit fiyatlıdır; pazarlık yapılamaz.</li>
          <li>Satın alma işlemi için teminat yatırılması zorunludur.</li>
          <li>
            Satış tamamlandığında, yatırılan teminat satış fiyatından düşülür.
          </li>
          <li>
            Ancak kullanıcı işlemi kendi isteğiyle iptal ederse, teminat iade
            edilmez.
          </li>
        </ul>

        <p>
          Kullanıcılar yalnızca teklif verebilir veya satın alma işlemi
          yapabilir; platformda ilan oluşturma yetkisi yalnızca arazialcom’a
          aittir.
        </p>
      </section>

      <hr />

      <section>
        <h2>📌 2. Kullanım Koşulları</h2>
        <p>
          <a href="https://www.arazialcom.net/" target="_blank">
            arazialcom.net
          </a>{" "}
          sitesini kullanan herkes aşağıdaki koşulları kabul etmiş sayılır:
        </p>
        <ul>
          <li>
            Kullanıcı sadece açık artırmaya katılabilir veya "hemen al"
            seçeneğiyle satın alma yapabilir.
          </li>
          <li>İlan yayınlama yetkisi yalnızca arazialcom’a aittir.</li>
          <li>
            Açık artırmalarda teminat yatırılması zorunludur. Kazanan ödeme
            yapmazsa teminat yanar.
          </li>
          <li>Hemen al işlemlerinde teminat, satış fiyatından düşülür.</li>
          <li>
            Kullanıcı işlemi kendi talebiyle iptal ederse, teminat iade edilmez.
          </li>
          <li>
            Sistem istismarı, sahte işlem veya kötüye kullanım tespit edilirse
            üyelik iptal edilir.
          </li>
          <li>
            arazialcom, kullanım koşullarında dilediği zaman değişiklik yapma
            hakkını saklı tutar. Tüm değişiklikler platformda duyurulur.
          </li>
        </ul>
      </section>

      <hr />

      <section>
        <h2>📌 3. Üyelik Sözleşmesi</h2>
        <p>
          Bu sözleşme,
          <a href="https://www.arazialcom.net/" target="_blank">
            arazialcom.net
          </a>{" "}
          üzerinden üyelik oluşturan kullanıcı ile ARAZİALCOM EMLAK SANAYİ VE
          TİCARET LİMİTED ŞİRKETİ arasında dijital ortamda kurulmuştur.
        </p>

        <h3>1. Taraflar</h3>
        <ul>
          <li>
            Kullanıcı: Sisteme üye olan, kimlik doğrulaması tamamlanmış ve işlem
            yapan gerçek kişi.
          </li>
          <li>Şirket: ARAZİALCOM EMLAK SAN. VE TİC. LTD. ŞTİ.</li>
        </ul>
        <h3>2. Konu</h3>
        <p>
          Bu sözleşme, kullanıcının platform üzerindeki tüm işlem hak ve
          sorumluluklarını kapsar.
        </p>
        <h3>3. Üyelik Şartları</h3>
        <ul>
          <li>18 yaşını doldurmuş ve yasal ehliyet sahibi olmak.</li>
          <li>Kayıt sırasında doğru ve eksiksiz bilgi sunmak.</li>
          <li>Yalnızca kendi adına işlem yapmak.</li>
        </ul>

        <h3>4. Satış Koşulları</h3>
        <ul>
          <li>
            Açık artırma ve hemen al işlemleri için teminat yatırılması
            zorunludur.
          </li>
          <li>Açık artırmada kazanamayan kullanıcının teminatı iade edilir.</li>
          <li>Kazanan ödeme yapmazsa teminat bedeli yanar.</li>
          <li>
            Hemen al işlemlerinde yatırılan teminat satış fiyatından düşülür.
          </li>
          <li>
            Kullanıcının işlemi iptal etmesi durumunda, teminat iade edilmez.
          </li>
        </ul>

        <h3>5. Sözleşmenin İhlali</h3>
        <p>
          Sahte bilgi, teklif manipülasyonu, kötüye kullanım gibi durumlarda
          üyelik derhal iptal edilir.
        </p>

        <h3>6. Yürürlük</h3>
        <p>
          Kullanıcı, kayıt işlemini tamamladığı anda bu sözleşmeyi okumuş,
          anlamış ve kabul etmiş sayılır. Sözleşme anında yürürlüğe girer.
        </p>
      </section>
    </div>
  );
};

export default HowItWorks;
