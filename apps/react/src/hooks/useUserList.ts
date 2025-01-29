import { UserListContext } from "@/contexts/UserListContext";
import { useContext } from "react";

export function useUserList() {
  const context = useContext(UserListContext);
  if (!context) {
    throw new Error("useUserList must be used within a UserListProvider");
  }
  return context;
}
