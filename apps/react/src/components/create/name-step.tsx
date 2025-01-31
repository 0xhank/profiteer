import { useMemo } from "react";
import { useFormData } from "../../contexts/FormDataContext";

export const NameStep = ({ onSubmit }: { onSubmit: () => void }) => {
  const { formData, setFormData } = useFormData();

  const { name, symbol, image: imageUri } = formData;
  const isValid: { valid: boolean; error?: string } = useMemo(() => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator

    if (symbol.length > 7) {
      return { valid: false, error: "Symbol must be 7 characters or less" };
    }

    if (imageUri.length > 0 && !urlPattern.test(imageUri)) {
      return { valid: false, error: "Invalid image URL" };
    }
    if (name.length === 0 || symbol.length === 0 || imageUri.length === 0) {
      return { valid: false };
    }

    return { valid: true };
  }, [name, symbol, imageUri]);

  return (
    <div className="space-y-6">
      {imageUri && isValid.valid && (
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={imageUri}
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
            value={name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            value={symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            maxLength={10}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 transition-all duration-300"
            placeholder="TKN"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
            Image URL
          </label>
          <input
            type="text"
            value={imageUri}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 transition-all duration-300"
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>
      </div>

      {isValid.error && (
        <div className="text-red-500">{isValid.error}</div>
      )}

      <button
        onClick={() => onSubmit()}
        disabled={!isValid.valid}
        className="w-full px-6 py-3 mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:scale-102 transform transition-all duration-300 shadow-lg"
      >
        Next
      </button>
    </div>
  );
};
