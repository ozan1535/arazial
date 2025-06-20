'use client';

import React from 'react';
import styled from 'styled-components';

const FAQContainer = styled.div`
  max-width: 4xl;
  margin: 0 auto;
  padding: 3rem 1rem;
  
  @media (min-width: 640px) {
    padding: 4rem 1.5rem;
  }
  
  @media (min-width: 1024px) {
    padding: 5rem 2rem;
  }
`;

const FAQTitle = styled.h1`
  text-align: center;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 3rem;
  letter-spacing: -0.025em;
  
  @media (max-width: 640px) {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }
`;

const FAQList = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (max-width: 640px) {
    gap: 1.5rem;
    padding: 0 0.5rem;
  }
`;

const FAQItem = styled.div`
  border-bottom: 1px solid var(--color-surface-secondary);
  padding-bottom: 2rem;
  
  @media (max-width: 640px) {
    padding-bottom: 1.5rem;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const Question = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
  
  @media (max-width: 640px) {
    font-size: 1.125rem;
    margin-bottom: 0.75rem;
  }
`;

const Answer = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.75;
  white-space: pre-line;
  
  @media (max-width: 640px) {
    font-size: 0.9375rem;
    line-height: 1.6;
  }
`;

const FAQ = () => {
  const faqItems = [
    {
      question: "arazialcom nedir?",
      answer: "arazialcom, öncelikli olarak kendi mülkiyetinde bulunan taşınmazların dijital ortamda satışa sunulduğu, aynı zamanda yetkili kurumsal firmalara ait arazilerin de ilana çıkarılabildiği bir taşınmaz satış platformudur.\nSistem, hem ihale yöntemiyle, hem de doğrudan (pazarlıklı) satış modeliyle çalışır. Her iki satış türünde de teminat bedeli alınır. Tapu işlemleri tamamen alıcı ve ilan sahibi arasında gerçekleştirilir."
    },
    {
      question: "arazialcom aracılık hizmeti sunuyor mu?",
      answer: "Hayır. arazialcom, taşınmaz alım-satımında aracılık yapmaz. İlan yayını, teklif toplama ve teminat sürecini dijital ortamda yönetir.\nTapu devri işlemleri doğrudan ilan sahibi ile alıcı arasında gerçekleşir."
    },
    {
      question: "İlanları kimler verebilir?",
      answer: "arazialcom'da sadece kurumsal firmalar ve resmi yetkili şirketler ilan verebilir. Bireysel şahıslardan ilan kabul edilmez.\nHer ilan için firma tarafından yazılı yetki alınması zorunludur."
    },
    {
      question: "İlan yayınlamak ücretli mi?",
      answer: "Evet. İlan yayınlama hizmeti yalnızca kurumsal firmalar ve resmi şirketler için sunulmaktadır.\nHer ilan, yetki belgesi ile birlikte yayınlanır ve seçilen ilan paketine göre ücretlendirilir.\narazialcom yalnızca ilan altyapısı sağlar; satış işlemlerine doğrudan karışmaz."
    },
    {
      question: "arazialcom'da kaç çeşit satış yöntemi vardır?",
      answer: "Sistemde iki farklı satış modeli uygulanmaktadır:\n• İhaleli satış: Belirli bir süre boyunca tekliflerin toplandığı ve en yüksek teklifin kazandığı satış modeli.\n• Doğrudan satış (Pazarlıklı satış): Sabit fiyat üzerinden ya da tarafların anlaşmasıyla yapılan satış modelidir.\nHer iki modelde de teminat alınır."
    },
    {
      question: "Satın alma süreci nasıl işler?",
      answer: "Satın alma sürecine katılmak isteyen her kullanıcı, ister ihaleli ister doğrudan satış olsun, öncelikle teminat bedelini yatırmalıdır.\nBu teminat, işlemin ciddiyetini ve güvenliğini sağlamak amacıyla tahsil edilir."
    },
    {
      question: "Teminat bedeli iade edilir mi?",
      answer: "• İhaleyi kazanamayan kullanıcılara teminat bedeli iade edilir.\n• İhaleyi kazanan kullanıcıya teminat iade edilmez; bu tutar hizmet bedeli olarak arazialcom tarafından tahsil edilir.\n• Doğrudan satışta taraflar anlaşamazsa teminat iade edilir; satış gerçekleşirse teminat arazialcom'a gelir olarak kalır."
    },
    {
      question: "Tapu işlemleri nasıl yapılır?",
      answer: "Tüm tapu işlemleri doğrudan alıcı ile ilan sahibi arasında gerçekleştirilir.\narazialcom bu sürece müdahil olmaz ve yalnızca dijital ortamda ilan yönetimi ve teklif sürecini sağlar."
    },
    {
      question: "arazialcom üzerinden ödeme yapmak güvenli mi?",
      answer: "Evet. Tüm ödemeler lisanslı sanal POS altyapısı ile alınır.\nKredi kartı bilgileriniz SSL şifreleme ile korunur ve hiçbir şekilde arazialcom tarafından saklanmaz ya da üçüncü taraflarla paylaşılmaz."
    },
    {
      question: "Kişisel bilgilerim güvende mi?",
      answer: "Evet. arazialcom, kullanıcı verilerini KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında korur.\nKişisel bilgiler yalnızca hizmet sunumu amacıyla kullanılır ve hiçbir koşulda üçüncü kişilerle paylaşılmaz."
    },
    {
      question: "Üyelik ücretli mi?",
      answer: "Hayır. Platforma üyelik ücretsizdir. Ancak teklif verebilmek, teminat yatırabilmek veya ilan yayınlayabilmek için sistemin belirlediği şartları sağlayan kullanıcıların gerekli ödemeleri yapması gerekir."
    }
  ];

  return (
    <FAQContainer>
      <FAQTitle>Sık Sorulan Sorular (SSS)</FAQTitle>
      <FAQList>
        {faqItems.map((item, index) => (
          <FAQItem key={index}>
            <Question>{index + 1}. {item.question}</Question>
            <Answer>{item.answer}</Answer>
          </FAQItem>
        ))}
      </FAQList>
    </FAQContainer>
  );
};

export default FAQ; 