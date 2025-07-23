"use client";

import React, { useState, useEffect } from "react";
import Fridge from "@/components/Fridge";
import { getUserFridge } from "@/lib/actions/recipe.actions";
import { Quantity } from "@/lib/types";

const FridgePage = () => {
  const [fridgeItems, setFridgeItems] = useState<{ [ingredientId: string]: Quantity } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFridgeContents = async () => {
      try {
        const fetchedFridgeContents = await getUserFridge();
        if (fetchedFridgeContents && fetchedFridgeContents.length > 0) {
          setFridgeItems(fetchedFridgeContents[0].ingredients || {});
        } else {
          setFridgeItems({});
        }
      } catch (error) {
        console.error("Failed to fetch fridge contents:", error);
        setFridgeItems({});
      } finally {
        setLoading(false);
      }
    };

    fetchFridgeContents();
  }, []);

  const handleFridgeSave = (newFridgeItems: { [ingredientId: string]: Quantity }) => {
    setFridgeItems(newFridgeItems);
  };

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading your fridge...</div>;
  }

  return <div>{fridgeItems !== null && <Fridge initialData={fridgeItems} onSave={handleFridgeSave} />}</div>;
};

export default FridgePage;
