"use client";

import { useState } from "react";
import { FormDataProvider } from "../../contexts/FormDataContext";
import { NameStep } from "./name-step";
import { ReviewStep } from "./review-step";

enum Step {
  Name = 0,
  Review = 1,
}

export const TokenLaunchForm = () => {
  return (
    <FormDataProvider>
      <TokenLaunchFormContent />
    </FormDataProvider>
  );
};

const TokenLaunchFormContent = () => {
  const [step, setStep] = useState(Step.Name);

  const RenderStep = () => {
    switch (step) {
      case Step.Name:
        return <NameStep onSubmit={() => setStep(Step.Review)} />;
      case Step.Review:
        return (
          <ReviewStep onBack={() => setStep(Step.Name)} />
        );
      default:
        return null;
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <RenderStep />
    </form>
  );
};
