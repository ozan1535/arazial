import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Primary Colors - Corporate Navy Blue */
    --color-primary: #1D3557;
    --color-primary-light: #2A4A7F;
    --color-primary-dark: #002F6C;
    
    /* Secondary Colors - Golden Accent */
    --color-accent: #F4A261;
    --color-gold: #DAA520;
    --color-gold-light: #E8B94F;
    --color-gold-dark: #C69214;
    
    /* Neutral Palette - Elegant Background */
    --color-surface: #FFFFFF;
    --color-background: #F8F9FA;
    --color-surface-secondary: #F3F4F6;
    --color-surface-tertiary: #EBEEF2;
    
    /* Text Colors */
    --color-text: #1D3557;
    --color-text-secondary: #4B5563;
    --color-text-tertiary: #6B7280;
    --color-text-light: #9CA3AF;
    
    /* Status Colors */
    --color-error: #E63946;
    --color-success: #00A67E;
    --color-warning: #F4A261;
    --color-info: #457B9D;
    
    /* Form Colors */
    --color-border: #D1D5DB;
    --color-bg-input: #FFFFFF;
    --color-text-placeholder: #9CA3AF;
    --color-disabled: #E5E7EB;
    --color-error-bg: #FEF2F2;
    --color-success-bg: #ECFDF5;
    
    /* Border Radius */
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    --border-radius-xl: 16px;
    --border-radius-xxl: 24px;
    
    /* Shadows - enhanced for depth */
    --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    --shadow-premium: 0 10px 25px -5px rgba(212, 175, 55, 0.15), 0 8px 10px -6px rgba(212, 175, 55, 0.1);
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-xxl: 3rem;
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms ease;
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    height: 100%;
    width: 100%;
    scroll-behavior: smooth;
    font-size: 16px;
  }
  
  body {
    height: 100%;
    width: 100%;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: var(--color-background);
    color: var(--color-text);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    padding: 0;
  }
  
  #root {
    min-height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
  }
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
    transition: all var(--transition-normal);
    
    &:hover {
      color: var(--color-primary-light);
    }
  }
  
  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    border-radius: var(--border-radius-md);
    border: 2px solid var(--color-border);
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--color-bg-input);
  }
  
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(15, 52, 96, 0.2);
  }
  
  button {
    cursor: pointer;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.25;
    color: var(--color-text);
    letter-spacing: -0.5px;
    margin-bottom: 0.75em;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: -0.05em;
  }
  
  h2 {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  h4 {
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  h5 {
    font-size: 1.125rem;
    font-weight: 600;
  }
  
  h6 {
    font-size: 1rem;
    font-weight: 600;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  
  section {
    scroll-margin-top: 80px;
    width: 100%;
    padding: 4rem 0;
  }
  
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
  }
  
  .text-center {
    text-align: center;
  }
  
  .text-primary {
    color: var(--color-primary);
  }
  
  .text-gold {
    color: var(--color-gold);
  }
  
  .text-accent {
    color: var(--color-accent);
  }
  
  /* Utility classes */
  .premium-text {
    background: linear-gradient(45deg, var(--color-gold) 0%, #F0DE8C 50%, var(--color-gold) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
  
  .premium-border {
    border: 1px solid var(--color-gold);
  }
  
  /* Animation utilities */
  .fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export default GlobalStyles;