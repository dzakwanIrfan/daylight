"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button as ButtonDayLight } from "./button";
import { Button } from "@/components/ui/button";

interface NavbarProps {
    isHome?: boolean;
}

export default function Navbar({ isHome = false }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        if (!isHome) return;
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHome]);

    const showWhiteNav = !isHome || isScrolled;
    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/about-us", label: "About Us" },
        { href: "/blog", label: "Blog" },
        { href: "/contact-us", label: "Contact Us" },
    ];

    return (
        <nav
            className={`fixed z-50 transition-all duration-500 ease-in-out left-1/2 -translate-x-1/2 ${showWhiteNav
                    ? "top-6 w-[90%] md:w-[85%] max-w-7xl bg-white shadow-lg rounded-2xl py-3 text-black"
                    : "top-0 w-full bg-transparent py-6 text-white"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <div className="text-2xl font-bold tracking-tight logo-text">
                    DayLight
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 font-medium">
                    {navLinks.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="hover:text-orange-500 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center space-x-4">
                    <Button className="rounded-full px-6 transition-all duration-300 text-black border border-gray-300 bg-white hover:bg-white cursor-pointer">
                        <a href="/auth/login">Login</a>
                    </Button>
                    <ButtonDayLight
                        href="/personality-test"
                        padding="px-6 py-2"
                        fontSize="text-sm font-semibold"
                    >
                        Sign Up
                    </ButtonDayLight>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <button
                        type="button"
                        aria-label="Toggle menu"
                        aria-expanded={isMobileOpen}
                        onClick={() => setIsMobileOpen((prev) => !prev)}
                        className="p-2 rounded-full transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        {isMobileOpen ? (
                            <X className={`w-6 h-6 ${showWhiteNav ? "text-black" : "text-white"}`} />
                        ) : (
                            <Menu
                                className={`w-6 h-6 ${showWhiteNav ? "text-black" : "text-white"}`}
                            />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="px-6 pt-2 pb-4 space-y-4 bg-white text-black shadow-lg border-t border-gray-100 rounded-b-2xl">
                    <div className="flex flex-col space-y-3 font-medium">
                        {navLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className="hover:text-orange-500 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div
                        className="flex flex-col gap-3 pt-2"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <Button
                            className="w-full rounded-full px-6 transition-all duration-300 text-black border border-gray-300 bg-white hover:bg-white cursor-pointer"
                        >
                            <a href="/auth/login" className="w-full text-center">
                                Login
                            </a>
                        </Button>
                        <ButtonDayLight href="/personality-test" padding="py-3" fontSize="text-sm font-semibold">
                            Sign Up
                        </ButtonDayLight>
                    </div>
                </div>
            </div>
        </nav>
    );
}