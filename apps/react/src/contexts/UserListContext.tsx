"use client";

import { getAllUsers, User } from "@/services/api";
import { getTokenPrice } from "@/utils/tokenPrice";
import { createContext, ReactNode, useEffect, useState } from "react";

interface UserPriceData {
  priceUsd: number | null;
  priceChange24h: number | null;
}

interface UserListContextType {
  users: User[];
  prices: Record<string, UserPriceData>;
  loading: boolean;
}

export const UserListContext = createContext<UserListContextType | undefined>(
  undefined
);

export function TokenListProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [prices, setPrices] = useState<Record<string, UserPriceData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersAndPrices = async () => {
      try {
        // Set users immediately
        const usersData = await getAllUsers();
        const filteredUsers = usersData.filter((user) => user.token_address);
        setUsers(filteredUsers);

        // Fetch prices separately
        const pricePromises = filteredUsers.map(async (user) => {
          if (user.token_address) {
            const priceData = await getTokenPrice(user.token_address);
            return [user.token_address, priceData];
          }
          return null;
        });

        const priceResults = await Promise.all(pricePromises);
        const priceData: Record<string, UserPriceData> = {};
        priceResults.forEach((result) => {
          if (result) {
            priceData[result[0] as string] = result[1] as UserPriceData;
          }
        });

        // Sort and update users only after prices are fetched
        const sortedUsers = [...filteredUsers].sort((a, b) => {
          const priceA = priceData[a.token_address]?.priceUsd ?? 0;
          const priceB = priceData[b.token_address]?.priceUsd ?? 0;
          return priceB - priceA;
        });

        setUsers(sortedUsers);
        setPrices(priceData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndPrices();
    const intervalId = setInterval(fetchUsersAndPrices, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <UserListContext.Provider value={{ users, prices, loading }}>
      {children}
    </UserListContext.Provider>
  );
}
