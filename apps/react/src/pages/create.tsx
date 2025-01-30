"use client";

import { PageLayout } from "../components/page-layout";
import { TokenLaunchForm } from "../components/create/token-launch-form";

export default function CreateToken() {
  return (
    <PageLayout>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-102">
        <TokenLaunchForm />
      </div>
    </PageLayout>
  );
}
