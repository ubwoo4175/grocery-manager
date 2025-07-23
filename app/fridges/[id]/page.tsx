"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserFridge, deleteUserFridge } from "@/lib/actions/recipe.actions";
import { Fridge } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import FridgeForm from "@/components/FridgeForm";
import FridgeSidebar from "@/components/FridgeSidebar";
import { Button } from "@/components/ui/button";

const EditFridgePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [fridge, setFridge] = useState<Fridge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFridge = async () => {
      if (!isUserLoaded) return;
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        const fetchedFridge = await getUserFridge(id);
        if (!fetchedFridge) {
          router.push("/fridges");
          return;
        }
        setFridge(fetchedFridge);
      } catch (error) {
        console.error("Failed to fetch fridge:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFridge();
  }, [id, user, isUserLoaded, router]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this fridge?")) {
      try {
        await deleteUserFridge(id);
        alert("Fridge deleted successfully!");
        router.push("/fridges");
      } catch (error) {
        console.error("Error deleting fridge:", error);
        alert("Failed to delete fridge. See console for details.");
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading fridge...</div>;
  }

  return (
    <div className="flex bg-gray-50 text-gray-800 min-h-screen">
      <FridgeSidebar />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900">{fridge?.fridge_name}</h1>
            <div className="flex justify-end mb-4">
              <Button variant="destructive" onClick={handleDelete}>
                Delete Fridge
              </Button>
            </div>
          </header>
          <FridgeForm fridge={fridge} id={id} />
        </div>
      </main>
    </div>
  );
};

export default EditFridgePage;
