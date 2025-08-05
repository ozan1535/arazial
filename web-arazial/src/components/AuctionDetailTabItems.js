import styled from "styled-components";
import { auctionDetailTabContent } from "../helpers/helpers";
import { useState } from "react";

const TabContainer = styled.div`
  width: 100%;
`;

const Tabs = styled.div`
  display: flex;
`;

const Tab = styled.div`
  width: 100px;
  padding: 10px;
  text-align: center;
  border-top: ${(props) => (props.active ? "3px solid red" : "#f0f0f0")};
  background-color: ${(props) => (props.active ? "white" : "#f0f0f0")};
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const TabContent = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  margin-top: 20px;
  display: ${(props) => (props.active ? "block" : "none")};
`;

export default function AuctionDetailTabItems({ auction }) {
  const [activeTab, setActiveTab] = useState("aciklama");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <TabContainer>
      <Tabs>
        {auctionDetailTabContent(auction).map((tab) => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </Tabs>

      {auctionDetailTabContent(auction).map((tab) => (
        <TabContent key={tab.id} active={activeTab === tab.id}>
          {tab.id === "konum" ? (
            <iframe
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${tab.content.lat},${tab.content.lng}&output=embed`}
            />
          ) : (
            <div>{tab.content}</div>
          )}
        </TabContent>
      ))}
    </TabContainer>
  );
}
