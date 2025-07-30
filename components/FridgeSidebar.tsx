"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUserFridges } from "@/lib/actions/recipe.actions";
import { Fridge } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const ExpandIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block h-5 w-5 pointer-events-none"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

const FridgeSidebar = () => {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFridgeId, setExpandedFridgeId] = useState<string | null>(null);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchFridges = async () => {
      try {
        const userFridges = await getUserFridges();
        const formattedFridges = userFridges.map((r: any) => ({
          id: r.id,
          fridge_name: r.fridge_name,
          ingredients: r.ingredients || {},
        }));
        setFridges(formattedFridges);
      } catch (error) {
        console.error("Failed to fetch fridges for sidebar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFridges();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setExpandedFridgeId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleExpand = (e: React.MouseEvent, fridgeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedFridgeId((prev) => (prev === fridgeId ? null : fridgeId));
  };

  if (loading) {
    return (
      <aside className="w-64 p-4 border-r flex-shrink-0">
        <h2 className="text-xl font-semibold mb-4">Fridges</h2>
        <div>Loading fridges...</div>
      </aside>
    );
  }

  return (
    <aside ref={sidebarRef} className="w-64 p-4 border-r bg-gray-100 h-screen sticky top-0 flex-shrink-0">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Fridges</h2>
      <nav className="space-y-2">
        {fridges.map((fridge) => (
          <div key={fridge.id} className="relative">
            <div className="flex items-center rounded-lg transition-colors w-full">
              <Link
                href={`/fridges/${fridge.id}`}
                className={cn(
                  "flex-1 min-w-0 px-3 py-2 rounded-l-md text-sm font-medium transition-colors",
                  pathname === `/fridges/${fridge.id}`
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                )}
              >
                <span className="truncate block">{fridge.fridge_name}</span>
              </Link>
              <button
                type="button"
                className={cn(
                  "p-2 rounded-r-md flex-shrink-0",
                  pathname === `/fridges/${fridge.id}` ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-200"
                )}
                aria-label="Show ingredients"
                onClick={(e) => handleToggleExpand(e, fridge.id)}
              >
                <ExpandIcon />
              </button>
            </div>
            {expandedFridgeId === fridge.id && (
              <div className="absolute z-20 left-full top-0 ml-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[220px] max-w-xs">
                <div className="font-semibold mb-2 text-gray-900">Ingredients</div>
                <ul className="list-disc pl-5 text-gray-800 text-sm">
                  {Object.entries(fridge.ingredients).map(([ingId, quantityMap]) => (
                    <li key={ingId}>
                      {ingId.replace(/_/g, " ")}:{" "}
                      {Object.entries(quantityMap)
                        .map(([unit, qty]) => `${qty} ${unit}`)
                        .join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        <Link
          href="/fridges/new"
          className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Fridge
        </Link>
      </nav>
    </aside>
  );
};

export default FridgeSidebar;
