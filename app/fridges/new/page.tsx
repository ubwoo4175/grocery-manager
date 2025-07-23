"use client";

import React from "react";
import FridgeForm from "@/components/FridgeForm";
import FridgeSidebar from "@/components/FridgeSidebar";

const NewFridgePage = () => {
  return (
    <div className="flex bg-gray-50 text-gray-800 min-h-screen">
      <FridgeSidebar />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900">New Fridge</h1>
          </header>
          <FridgeForm id={null} />
        </div>
      </main>
    </div>
  );
};

export default NewFridgePage;
