"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from 'react';

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    const path = usePathname();
    
    return (
        <Link
            href={href}
            className={path.startsWith(href) ? "active" : undefined}
        >
            {children}
        </Link>
    );
}