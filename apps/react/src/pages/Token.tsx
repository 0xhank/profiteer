import React from "react";
import { useParams } from "react-router-dom";

const TokenPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();

  return (
    <div>
      <h1>Token Page</h1>
      <p>This is the page for token ID: {tokenId}</p>
      {/* Add more mock content here */}
    </div>
  );
};

export default TokenPage;
