export const Disclaimer = () => {
  return (
    <div className={`static w-screen bottom-0 left-0 right-0 bg-gray-900/95 text-gray-400 p-4 text-sm backdrop-blur-sm flex justify-center space-x-6`}>
            <button onClick={() => window.open('/terms', '_blank')} className="hover:text-gray-300">
              Terms of Service
            </button>
            <button onClick={() => window.open('/privacy', '_blank')} className="hover:text-gray-300">
              Privacy Policy
            </button>
          </div>
  );
}; 
