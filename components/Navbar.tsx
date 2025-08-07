"use client";

import Link from "next/link";
import React from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import NavItems from "./NavItems";

// --- ICONS ---
const ChefHatIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
  >
    <path d="M19.8 11.7a2.4 2.4 0 0 0-1.2-2.1l-6.1-3.3a2.4 2.4 0 0 0-2.9 0L3.4 9.6a2.4 2.4 0 0 0-1.2 2.1v4.8a2.4 2.4 0 0 0 2.4 2.4h13.6a2.4 2.4 0 0 0 2.4-2.4v-4.8Z"></path>
    <path d="M9.6 18.5V6.3"></path>
    <path d="M14.4 18.5V6.3"></path>
    <path d="M12 18.5V6.3"></path>
    <path d="M12 6.3a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z"></path>
  </svg>
);

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="col-span-1">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <ChefHatIcon />
          </div>
        </Link>
      </div>
      <div className="justify-self-center">
        <NavItems />
      </div>
      <div className="justify-self-end flex items-center gap-8">
        <SignedOut>
          <SignInButton>
            <button className="btn-signin">Sign In</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;
