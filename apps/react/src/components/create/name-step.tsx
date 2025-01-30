import React from "react";

interface NameStepProps {
  formData: {
    name: string;
    symbol: string;
    twitter: string;
    image: string;
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  setError: (error: string) => void;
  setStep: (step: number) => void;
}

export const NameStep: React.FC<NameStepProps> = ({
  formData,
  handleInputChange,
  setError,
  setStep,
}) => (
  <div className="space-y-6">
    {formData.image && (
      <div className="flex justify-center mb-6">
        <div className="relative">
          <img
            src={formData.image}
            alt="Profile"
            className="rounded-full border-4 border-blue-500 shadow-lg transform transition-all duration-300 hover:scale-105"
          />
        </div>
      </div>
    )}

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          Token Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 transition-all duration-300"
          placeholder="My Token"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          Symbol
        </label>
        <input
          type="text"
          name="symbol"
          value={formData.symbol}
          onChange={handleInputChange}
          maxLength={10}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 transition-all duration-300"
          placeholder="TKN"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          Twitter
        </label>
        <input
          type="text"
          name="twitter"
          value={formData.twitter}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 transition-all duration-300"
          placeholder="@username"
        />
      </div>
    </div>

    <button
      onClick={() => {
        if (formData.symbol.length > 7) {
          setError("Token symbol must be 7 characters or less");
          return;
        }
        setError("");
        setStep(1);
      }}
      className="w-full px-6 py-3 mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:scale-102 transform transition-all duration-300 shadow-lg"
    >
      Next
    </button>
  </div>
);
