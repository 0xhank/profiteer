import { useFormData } from "../../contexts/FormDataContext";
import { useServer } from "../../hooks/use-server";

export const ReviewStep = ({
  onBack,
}: {
  onBack: () => void;
}) => {
  const { formData } = useFormData();
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Review & Create Token
        </h2>
      </div>

      {/* Token Preview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="relative flex-shrink-0">
            <img
              src={formData.image}
              alt="Token"
              width={80}
              height={80}
              className="rounded-full border-4 border-blue-500 shadow-lg sm:w-[120px] sm:h-[120px]"
            />
          </div>
          <div className="flex-grow space-y-2 sm:space-y-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Token Name
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {formData.name}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Symbol
              </p>
              <p className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                ${formData.symbol}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
          Payment Details
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center py-1 sm:py-2">
          </div>

          <div className="flex justify-between items-center py-1">
            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-400 mr-2 text-sm">
                Token Creation Fee
              </span>
              <div className="group relative">
                <svg
                  className="w-3 h-3 text-gray-500 cursor-help"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="hidden group-hover:block absolute z-50 w-64 p-2 bg-gray-900 text-white text-sm rounded-lg -top-2 left-6">
                  Network fee to create a token on the Solana blockchain
                </div>
              </div>
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              ~ $6.00
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <div className="flex items-center">
              <div className="group relative">
                <svg
                  className="w-3 h-3 text-gray-500 cursor-help"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="hidden group-hover:block absolute z-50 w-64 p-2 bg-gray-900 text-white text-sm rounded-lg -top-2 left-6">
                  Platform service fee for token creation (~2%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 sm:pt-6">
        <button
          onClick={onBack}
          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-600 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-all duration-300"
        >
          Back
        </button>

        <CreateTokenButton
          name={formData.name}
          symbol={formData.symbol}
          uri={formData.image}
        />
      </div>
    </div>
  );
};

const CreateTokenButton = (props: {
  name: string;
  symbol: string;
  uri: string;
}) => {
  
  const { createBondingCurve } = useServer();

  const onSendTransaction = async () => {
    console.log(props);
    try {
      const tx = await createBondingCurve.mutate(props);
      console.log({tx});
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      onClick={onSendTransaction}
      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:scale-105 transform transition-all duration-300 shadow-lg"
    >
      Create Token
    </button>
  );
}