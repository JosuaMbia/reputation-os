"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // On découpe l'URL (ex: /dashboard/reviews -> ["dashboard", "reviews"])
  const segments = pathname.split("/").filter((item) => item !== "");

  // Dictionnaire pour traduire les routes en français
  const translations: Record<string, string> = {
    dashboard: "Accueil",
    reviews: "Mes Avis",
    settings: "Réglages",
    campaigns: "Campagnes",
  };

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-6">
      <Link href="/dashboard" className="hover:text-indigo-600 transition flex items-center gap-1">
        <Home className="w-4 h-4" />
      </Link>
      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const name = translations[segment] || segment;

        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            {isLast ? (
              <span className="font-bold text-gray-900 dark:text-white capitalize">
                {name}
              </span>
            ) : (
              <Link href={path} className="hover:text-indigo-600 transition capitalize">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}