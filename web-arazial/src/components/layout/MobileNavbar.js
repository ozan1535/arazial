import React from "react";
import { FaHome, FaRegHeart, FaHeart } from "react-icons/fa";
import {
  IoHomeOutline,
  IoPersonOutline,
  IoPersonSharp,
  IoSearchOutline,
  IoSearchSharp,
} from "react-icons/io5";

import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

const MobileNavbarContainer = styled.div`
  width: 100%;
  height: 50px;
  background-color: white;
  position: fixed;
  bottom: 0;
  z-index: 100000;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 1rem;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  @media (min-width: 767px) {
    display: none;
  }
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: inherit;
  text-decoration: none;
  font-size: 12px;
`;

function MobileNavbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <MobileNavbarContainer>
      <NavItem to="/">
        {currentPath === "/" ? (
          <FaHome size={24} />
        ) : (
          <IoHomeOutline size={24} />
        )}
        <span>Keşfet</span>
      </NavItem>

      <NavItem to="/search">
        {currentPath === "/search" ? (
          <IoSearchSharp size={24} />
        ) : (
          <IoSearchOutline size={24} />
        )}
        <span>Arama</span>
      </NavItem>

      <NavItem to="/favorites">
        {currentPath === "/favorites" ? (
          <FaHeart size={24} />
        ) : (
          <FaRegHeart size={24} />
        )}
        <span>Favoriler</span>
      </NavItem>

      <NavItem to="/account">
        {currentPath === "/account" ? (
          <IoPersonSharp size={24} />
        ) : (
          <IoPersonOutline size={24} />
        )}
        <span>Hesabım</span>
      </NavItem>
    </MobileNavbarContainer>
  );
}

export default MobileNavbar;
