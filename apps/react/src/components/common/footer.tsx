import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <div className={`bg-gray-700 w-full text-gray-400 p-4 text-sm backdrop-blur-sm flex justify-center space-x-6`}>
            <Link to="/terms" className="hover:text-gray-300">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-gray-300">
              Privacy Policy
            </Link>
          </div>
  );
}; 
