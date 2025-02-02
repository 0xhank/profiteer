import { Link } from "react-router-dom";
import { Token } from "shared/src/types/token";
import { cn } from "../utils/cn";
import { formatNumber, formatPrice } from "../utils/formatPrice";

export default function TokenCard({
  token,
  clickable = true,
}: {
  token: Token;
  clickable?: boolean;
}) {
  return (
    <Link
      key={token.mint}
      to={`/wiki/${token.mint}`}
      className={cn(
        `block transform`,
        clickable ? "hover:scale-105" : "cursor-default"
      )}
    >
      <div className="relative bg-white p-4 sm:p-6 h-full transform skew-x-[-12deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="/cloud-bg.webp"
            alt=""
            className="object-cover transform skew-x-[12deg] scale-150 blur-[2px] w-full h-full"
          />
        </div>
        <div className="flex items-center justify-between space-x-2 transform skew-x-[12deg] relative z-10">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={token.metadata.imageUri}
              alt={token.metadata.name}
              width={40}
              height={40}
              className="rounded-full flex-shrink-0 sm:w-12 sm:h-12"
            />
            <div className="min-w-0">
              <h3 className="text-2xl font-bold text-gray-900 truncate">
                {token.metadata.name}
              </h3>
              <p className="text-xl text-semibold text-gray-500 truncate">
                ${token.metadata.symbol}
              </p>
            </div>
          </div>
          {token.priceUsd && (
            <div className="text-right flex-shrink-0">
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                ${formatPrice(token.priceUsd)}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
              Mkt cap: {formatNumber(token.priceUsd * token.metadata.supply)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
