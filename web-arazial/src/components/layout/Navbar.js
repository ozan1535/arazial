import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import { resetAllAuthStorage } from "../../services/authUtils";
import logoImage from "../../assets/logo.png";
import { IoSearchOutline } from "react-icons/io5";

const NavbarContainer = styled.nav`
  background-color: ${(props) =>
    props.$isScrolled ? "rgba(255, 255, 255, 0.95)" : "var(--color-surface)"};
  box-shadow: ${(props) => (props.$isScrolled ? "var(--shadow-md)" : "none")};
  border-bottom: ${(props) =>
    props.$isScrolled ? "none" : "1px solid rgba(0, 0, 0, 0.05)"};
  position: ${(props) => (props.$isFixed ? "fixed" : "relative")};
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: ${(props) => (props.$isScrolled ? "blur(10px)" : "none")};

  & + * {
    padding-top: ${(props) => (props.$isFixed ? "80px" : "0")};

    @media (max-width: 767px) {
      display: none;
      padding-top: 0; //${(props) => (props.$isFixed ? "70px" : "0")};
    }
  }

  @media (max-width: 767px) {
    display: none;
  }
`;

const NavbarContent = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: ${(props) => (props.$isScrolled ? "0.75rem 2rem" : "1.25rem 2rem")};
  max-width: 1400px;
  margin: 0 auto;
  height: ${(props) => (props.$isScrolled ? "70px" : "80px")};
  transition: all 0.3s ease;

  @media (min-width: 1024px) {
    padding-left: 3rem;
    padding-right: 3rem;
  }

  @media (max-width: 767px) {
    padding: ${(props) =>
      props.$isScrolled ? "0.75rem 1.5rem" : "1rem 1.5rem"};
    height: ${(props) => (props.$isScrolled ? "60px" : "70px")};
    display: flex;
    justify-content: space-between;
  }

  @media (max-width: 480px) {
    padding: ${(props) => (props.$isScrolled ? "0.75rem 1rem" : "1rem 1rem")};
    height: ${(props) => (props.$isScrolled ? "56px" : "64px")};
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--color-text);
  font-weight: 700;
  font-size: 1.5rem;
  transition: transform 0.2s ease;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-1px);
  }

  span {
    color: var(--color-primary);
    letter-spacing: -0.5px;
  }

  @media (max-width: 767px) {
    font-size: 1.25rem;
    margin: 0;
  }

  @media (max-width: 359px) {
    span {
      display: none;
    }
  }
`;

const LogoIcon = styled.div`
  margin-right: 0.75rem;
  display: flex;
  align-items: center;

  img {
    height: 3rem;
    width: 3rem;
    border-radius: 50%;
    object-fit: cover;

    @media (max-width: 767px) {
      height: 2.5rem;
      width: 2.5rem;
    }
  }

  @media (max-width: 359px) {
    margin-right: 0;
  }
`;

const NavMenu = styled.nav`
  display: flex;
  align-items: center;
  margin-left: auto;
  @media (min-width: 1024px) {
    gap: 0.5rem;
    margin: 0 1rem 0 auto;
    flex-grow: 0;
    justify-content: flex-end;
  }
`;

const NavLink = styled(Link)`
  padding: 0.625rem 1rem;
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: var(--color-primary);
    background-color: rgba(15, 52, 96, 0.04);
  }

  &.active {
    color: var(--color-primary);
    font-weight: 600;
    background-color: rgba(15, 52, 96, 0.06);
  }

  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
`;

const NavButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;

  .auth-buttons {
    @media (max-width: 767px) {
      display: none;
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  @media (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    margin-left: 1rem;
    svg {
      width: 2rem;
      height: 2rem;
      color: var(--color-text);
    }
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  right: ${(props) => (props.$isOpen ? "0" : "-100%")};
  width: 100%;
  max-width: 320px;
  height: 100vh;
  min-height: -webkit-fill-available; /* Fix for iOS Safari */
  background-color: white;
  z-index: 1001;
  transition: right 0.3s ease;
  box-shadow: ${(props) =>
    props.$isOpen ? "-4px 0 25px rgba(0, 0, 0, 0.1)" : "none"};
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  padding-top: 1rem;
  padding-bottom: env(
    safe-area-inset-bottom,
    2rem
  ); /* Add safe area padding for notched devices */
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  color: var(--color-text);
  border-radius: 50%;
  transition: background-color 0.2s ease, transform 0.2s ease;
  z-index: 10;

  &:hover {
    background-color: rgba(15, 52, 96, 0.06);
    transform: rotate(90deg);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.85rem 2rem;
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  font-size: 1.125rem;
  border-bottom: 1px solid var(--color-surface-secondary);
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background-color: var(--color-surface-secondary);
    color: var(--color-primary);
    padding-left: 2.5rem;
  }

  &.active {
    color: var(--color-primary);
    font-weight: 600;
    border-left: 3px solid var(--color-primary);
    background-color: rgba(15, 52, 96, 0.04);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.75rem;
  }

  &[as="button"] {
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 1.125rem;
    font-family: inherit;
  }
`;

const MobileAuthButtons = styled.div`
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-surface-secondary);
  width: 100%;

  button {
    width: 100%;
    justify-content: center;
    font-size: 1rem;
    padding: 0.75rem !important;
    height: 42px;
  }
`;

const MobileHeader = styled.div`
  padding: 1.5rem 2rem 1rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-surface-secondary);
  margin-bottom: 0.25rem;

  img {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    margin-right: 1rem;
  }

  span {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);

    strong {
      color: var(--color-primary);
    }
  }
`;

const MobileNavSection = styled.div`
  margin: 0;

  h3 {
    padding: 0.6rem 2rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    margin: 0;
  }
`;

const UserMenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: var(--border-radius-md);

  &:hover {
    background-color: rgba(15, 52, 96, 0.04);
  }

  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--color-surface);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .user-name {
    margin-left: 0.5rem;
    font-weight: 500;
    display: none;

    @media (min-width: 1024px) {
      display: block;
    }
  }

  .dropdown-icon {
    margin-left: 0.5rem;
    transition: transform 0.2s ease;
    transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0)")};
  }
`;

const UserMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  width: 220px;
  overflow: hidden;
  z-index: 100;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  transform: ${(props) =>
    props.$isOpen ? "translateY(0)" : "translateY(-10px)"};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transition: all 0.2s ease;
`;

const UserMenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.1s ease;
  font-weight: 500;

  svg {
    margin-right: 0.75rem;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-secondary);
  }

  &:hover {
    background-color: var(--color-surface-secondary);
    color: var(--color-primary);

    svg {
      color: var(--color-primary);
    }
  }
`;

const UserMenuDivider = styled.div`
  height: 1px;
  background-color: var(--color-surface-secondary);
  margin: 0.25rem 0;
`;

const UserMenuSignOutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  transition: all 0.1s ease;
  font-weight: 500;

  svg {
    margin-right: 0.75rem;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-error);
  }

  &:hover {
    background-color: var(--color-surface-secondary);
  }
`;

const PremiumBadge = styled.span`
  background: linear-gradient(
    90deg,
    var(--color-gold-dark) 0%,
    var(--color-gold) 100%
  );
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
  margin-left: 0.5rem;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
`;

// Add styled components for disabled menu items
const DisabledUserMenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  opacity: 0.6;
  cursor: not-allowed;

  svg {
    margin-right: 0.75rem;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-secondary);
  }
`;

const DisabledMobileNavLink = styled.div`
  display: flex;
  align-items: center;
  padding: 1.25rem 2rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 1.125rem;
  border-bottom: 1px solid var(--color-surface-secondary);
  opacity: 0.6;
  cursor: not-allowed;
  width: 100%;
`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { user, signOut, isAdmin, loading, reloadUserProfile, refreshAuth } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    // This effect will run whenever the user state changes
    console.log(
      "Auth state in Navbar changed:",
      user ? "logged in" : "logged out"
    );
    // Reset UI state when auth changes
    setIsUserMenuOpen(false);
    setIsOpen(false);
  }, [user]);

  const handleSignOut = async () => {
    try {
      setIsUserMenuOpen(false);

      // Wait for signout to complete or timeout after 3 seconds
      const signoutPromise = signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 3000)
      );

      await Promise.race([signoutPromise, timeoutPromise]);

      // Navigate to home page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Force manual signout if automatic signout fails
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <NavbarContainer $isFixed={true} $isScrolled={isScrolled}>
      <NavbarContent $isScrolled={isScrolled}>
        <Logo to="/">
          <LogoIcon>
            <img src={logoImage} alt="arazialcom Logo" />
          </LogoIcon>
          <span>arazialcom</span>
        </Logo>

        <NavMenu>
          {/* Masaüstü: Giriş yaptıysa hamburger menüdeki butonlar burada */}
          {windowWidth >= 1024 && user && (
            <>
              <NavLink to="/profile">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profilim
              </NavLink>
              <NavLink to="/dashboard">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Tekliflerim
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin/dashboard">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  Admin Paneli
                </NavLink>
              )}
              <NavLink
                as="button"
                onClick={handleSignOut}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Çıkış Yap
              </NavLink>
            </>
          )}
        </NavMenu>

        {/* NavButtonsContainer sadece kullanıcı yoksa gösterilecek */}
        {!user && (
          <NavButtonsContainer>
            {loading ? (
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "2px solid var(--color-surface-secondary)",
                  borderTopColor: "var(--color-primary)",
                  animation: "navbarSpin 1s linear infinite",
                }}
              />
            ) : (
              <div className="auth-buttons">
                <Button
                  as={Link}
                  to="/login"
                  variant="primary"
                  size="small"
                  minWidth="auto"
                  style={{
                    padding: "0.625rem 1.5rem",
                    fontSize: "0.875rem",
                    minHeight: "40px",
                    fontWeight: "500",
                    marginRight: "0.75rem",
                  }}
                >
                  Giriş Yap
                </Button>
                <Button
                  as={Link}
                  to="/signup"
                  variant="outline"
                  size="small"
                  minWidth="auto"
                  style={{
                    padding: "0.625rem 1.5rem",
                    fontSize: "0.875rem",
                    minHeight: "40px",
                    fontWeight: "500",
                  }}
                >
                  Kayıt Ol
                </Button>
              </div>
            )}
          </NavButtonsContainer>
        )}
        <MobileMenuButton
          onClick={() => setIsOpen(true)}
          style={{ marginLeft: "auto" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </MobileMenuButton>
      </NavbarContent>

      <MobileMenu $isOpen={isOpen}>
        <CloseButton onClick={() => setIsOpen(false)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </CloseButton>

        <MobileHeader>
          <img src={logoImage} alt="arazialcom Logo" />
          <span>
            arazial<strong>com</strong>
          </span>
        </MobileHeader>

        {!user && !loading && (
          <MobileAuthButtons>
            <Button
              as={Link}
              to="/login"
              variant="primary"
              onClick={() => setIsOpen(false)}
            >
              Giriş Yap
            </Button>
            <Button
              as={Link}
              to="/signup"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Kayıt Ol
            </Button>
          </MobileAuthButtons>
        )}

        {loading ? (
          <div
            style={{
              padding: "2rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "3px solid var(--color-surface-secondary)",
                borderTopColor: "var(--color-primary)",
                animation: "navbarSpin 1s linear infinite",
              }}
            />
          </div>
        ) : user ? (
          <>
            <MobileNavSection>
              <MobileNavLink to="/profile" onClick={() => setIsOpen(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profilim
              </MobileNavLink>
              <MobileNavLink to="/dashboard" onClick={() => setIsOpen(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Tekliflerim
              </MobileNavLink>
              {isAdmin && (
                <MobileNavLink
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  Admin Paneli
                </MobileNavLink>
              )}
              <MobileNavLink to="/contact" onClick={() => setIsOpen(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                İletişim
              </MobileNavLink>
            </MobileNavSection>
            <div
              style={{ marginTop: "2rem", padding: "0 1.5rem 1.5rem 1.5rem" }}
            >
              <Button
                variant="danger"
                style={{
                  width: "100%",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  padding: "0.9rem 0",
                }}
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
              >
                Çıkış Yap
              </Button>
            </div>
          </>
        ) : null}
      </MobileMenu>
    </NavbarContainer>
  );
};

// Add keyframes for spinner animation
const GlobalStyle = styled.div`
  @keyframes navbarSpin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default () => (
  <>
    <GlobalStyle />
    <Navbar />
  </>
);
