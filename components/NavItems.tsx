'use client';

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";

const navItems = [
    { label:'Home', href: '/' },
    { label: 'Recipes', href: '/recipes' },
    { label: 'Fridge', href: '/fridge' },
]

const NavItems = () => {
    const pathname = usePathname();

    return (
        <nav className="flex items-center space-x-20">
            {navItems.map(({ label, href }) => (
                <Link
                    href={href}
                    key={label}
                    className={cn(
                        "text-gray-800 hover:text-green transition-colors duration-200",
                        pathname === href && "font-semibold text-green-700"
                    )}
                >
                    {label}
                </Link>
            ))}
        </nav>
    )
}

export default NavItems