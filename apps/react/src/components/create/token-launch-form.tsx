"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { NameStep } from "./name-step";
import { ReviewStep } from "./review-step";

enum Step {
  Name = 0,
  Review = 1,
}

export const TokenLaunchForm = () => {
  const { user } = usePrivy();
  const [step, setStep] = useState(Step.Name);
  const [formData, setFormData] = useState({
    name: user?.twitter?.name
      ? `OFFICIAL ${user.twitter.name.toUpperCase()}`
      : "",
    symbol: user?.twitter?.name?.toUpperCase() || "",
    twitter: user?.twitter?.username || "",
    image: user?.twitter?.profilePictureUrl || "",
    username: user?.twitter?.username || "",
    amount: "0.01",
  });
  const [, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (user) {
      const updatedProfilePicUrl = user.twitter?.profilePictureUrl?.replace(
        "normal",
        "400x400"
      );
      setFormData((prev) => ({
        ...prev,
        name: user.twitter?.name
          ? `OFFICIAL ${user.twitter.name.toUpperCase()}`
          : prev.name,
        symbol: user.twitter?.name?.toUpperCase() || prev.symbol,
        twitter: user.twitter?.username || prev.twitter,
        image: updatedProfilePicUrl || prev.image,
        username: user.twitter?.username || prev.username,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setStep(1);
        setSuccess("");
        setFormData({
          name: user?.twitter?.name
            ? `OFFICIAL ${user.twitter.name.toUpperCase()}`
            : "",
          symbol: user?.twitter?.name?.toUpperCase() || "",
          twitter: user?.twitter?.username || "",
          image: user?.twitter?.profilePictureUrl || "",
          username: user?.twitter?.username || "",
          amount: "0.01",
        });
      }, 5000);
    }
  }, [success, user]);

  const renderStep = () => {
    switch (step) {
      case Step.Name:
        return (
          <NameStep
            formData={formData}
            handleInputChange={handleInputChange}
            setError={setError}
            setStep={setStep}
          />
        );
      case Step.Review:
        return (
          <ReviewStep
            formData={formData}
            onBack={() => setStep(Step.Name)}
            onSuccess={(mintAddress) =>
              setSuccess(
                `Token created successfully! Mint address: ${mintAddress}`
              )
            }
            onError={(err) =>
              setError(
                err.message || "Failed to create token. Please try again."
              )
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          <p className="font-bold">{success}</p>
        </div>
      )}
      {renderStep()}
    </form>
  );
};
