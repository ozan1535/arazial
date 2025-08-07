import { Link, useNavigate } from "react-router-dom";
import { IoPersonSharp } from "react-icons/io5";
import { RiAdminFill, RiAuctionFill } from "react-icons/ri";
import { MdContactSupport, MdRealEstateAgent } from "react-icons/md";
import { GrContact } from "react-icons/gr";
import styled from "styled-components";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const AccountContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem 0;
  margin: 0 1rem;
`;

const AccountLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-decoration: none;
  background-color: white;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin-bottom: 1rem;

  span {
    margin-left: 8px;
    color: #333;
    font-size: 1rem;
    font-weight: bold;
  }
`;

function Account() {
  const {
    user,
    signOut,
    isAdmin,
    loading,
    reloadUserProfile,
    refreshAuth,
    isAuthenticated,
  } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
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
  return (
    <AccountContainer>
      <AccountLink to="/profile">
        <IoPersonSharp size={24} color="gray" />
        <span>Profilim</span>
      </AccountLink>
      <AccountLink to="/dashboard">
        <RiAuctionFill size={24} color="gray" />
        <span>Tekliflerim</span>
      </AccountLink>
      <AccountLink to="/">
        <MdRealEstateAgent size={24} color="gray" />
        <span>Tüm İlanlar</span>
      </AccountLink>
      <AccountLink to="/contact">
        <GrContact size={24} color="gray" />
        <span>İletişim</span>
      </AccountLink>
      <AccountLink to="/sss">
        <MdContactSupport size={24} color="gray" />
        <span>SSS / Yardım Merkezi</span>
      </AccountLink>
      {isAdmin && (
        <AccountLink to="/admin">
          <RiAdminFill size={24} color="gray" />
          <span>Admin Paneli</span>
        </AccountLink>
      )}
      {isAuthenticated ? (
        <AccountLink to="#" onClick={handleSignOut}>
          <FaSignOutAlt size={24} color="gray" />
          <span style={{ marginLeft: "0.5rem" }}>Çıkış Yap</span>
        </AccountLink>
      ) : (
        <AccountLink to="/login">
          <FaSignInAlt size={24} color="gray" />
          <span style={{ marginLeft: "0.5rem" }}>Giriş Yap</span>
        </AccountLink>
      )}
    </AccountContainer>
  );
}

export default Account;
