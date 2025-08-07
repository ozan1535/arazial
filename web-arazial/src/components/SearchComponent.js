import React from "react";
import { cities } from "../helpers/helpers";
import styled from "styled-components";
import Button from "./ui/Button";

const SearchContainer = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  max-width: 900px;

  @media (max-width: 768px) {
    padding: 0.75rem;
    margin-bottom: 1.5rem;
  }
`;

const SearchForm = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const SearchInputGroup = styled.div`
  width: 100%;
`;

const SearchInput = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-secondary);
    width: 1.25rem;
    height: 1.25rem;
  }

  select,
  input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
    }

    @media (max-width: 768px) {
      padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      font-size: 0.9rem;
    }
  }

  select {
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236E6E6E' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
  }

  @media (max-width: 768px) {
    svg {
      left: 0.75rem;
      width: 1rem;
      height: 1rem;
    }

    select {
      background-position: right 0.75rem center;
    }
  }
`;

const SearchButton = styled(Button)`
  padding: 1rem 2rem;
  min-height: auto;
  border-radius: 6px;
  font-weight: 600;

  @media (max-width: 768px) {
    min-height: 45px;
    padding: 0.5rem 1.5rem;
  }
`;

const ResponsiveButton = styled(Button)`
  min-height: auto;
  padding: 1rem 1.5rem;

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

function SearchComponent({
  selectedCity,
  handleSearchSubmit = null,
  handleCityChange,
  resetFilters = null,
  canShowButtons = true,
  isBackgroundTransparent = false,
}) {
  return (
    <SearchContainer
      style={{ backgroundColor: isBackgroundTransparent ? "transparent" : "" }}
    >
      <SearchForm onSubmit={handleSearchSubmit}>
        <SearchInputGroup>
          <SearchInput>
            <SearchIcon />
            <select value={selectedCity} onChange={handleCityChange}>
              <option value="">Tüm Şehirler</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </SearchInput>
        </SearchInputGroup>
        {canShowButtons && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <SearchButton type="submit" variant="primary" size="large">
              Ara
            </SearchButton>

            <ResponsiveButton
              type="button"
              variant="secondary"
              size="large"
              onClick={resetFilters}
            >
              Sıfırla
            </ResponsiveButton>
          </div>
        )}
      </SearchForm>
    </SearchContainer>
  );
}

export default SearchComponent;
