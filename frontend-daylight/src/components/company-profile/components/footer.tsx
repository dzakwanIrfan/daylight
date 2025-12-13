import { MeshGradient } from "@blur-ui/mesh-gradient";
import Image from "next/image";
import { Button } from "@/components/company-profile/components/button";
import { FaMedium, FaTiktok, FaYoutube } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import {
    ChevronDown,
} from "lucide-react";

export default function Footer() {
    return (
        <section className="relative">
            <div className="absolute inset-0 -z-10 overflow-hidden bg-[#c45c1d]">
                <MeshGradient
                    colors={{
                        color1: "#d86a21",
                        color2: "#e38b3c",
                        color3: "#b84c17",
                        color4: "#f2ac55",
                    }}
                    opacity={0.85}
                    className="w-full h-full"
                    style={{ width: "100%", height: "100%" }}
                />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-16 space-y-16 text-white">
                {/* Collage CTA */}
                <div className="grid md:grid-cols-[1fr_1.2fr_1fr] gap-4 items-center justify-center">
                    <div className="relative h-60 md:h-72 overflow-hidden rounded-3xl border border-white/20 shadow-xl">
                        <Image
                            src="/images/landing-page/stock6.png"
                            alt="DayLight friends dining"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="relative h-72 md:h-80 overflow-hidden rounded-3xl border border-white/20 shadow-2xl flex items-center justify-center">
                        <Image
                            src="/images/landing-page/stock7.png"
                            alt="DayLight community"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />
                        <div className="relative z-10 text-center px-6 space-y-4">
                            <p className="text-lg font-semibold">Lets Connect</p>
                            <Button href="/personality-test">Create Account</Button>
                            <div className="space-y-2">
                                <p className="text-sm">Follow our Journey.</p>
                                <div className="flex justify-center gap-4 text-white">
                                    <a href="https://www.instagram.com/daylight.asia">
                                        <AiFillInstagram className="h-5 w-5 hover:scale-150 transition" />
                                    </a>
                                    <a href="https://www.tiktok.com/@daylight_asia">
                                        <FaTiktok className="h-5 w-5 hover:scale-150 transition" />
                                    </a>
                                    <a href="https://youtube.com/@daylightasia">
                                        <FaYoutube className="h-5 w-5 hover:scale-150 transition" />
                                    </a>
                                    <a href="https://medium.com/@Daylight.asia">
                                        <FaMedium className="h-5 w-5 hover:scale-150 transition" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-60 md:h-72 overflow-hidden rounded-3xl border border-white/20 shadow-xl">
                        <Image
                            src="/images/landing-page/stock8.png"
                            alt="DayLight outing"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Footer content */}
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <p className="text-3xl font-bold logo-text">DayLight</p>
                            <p className="text-sm text-white/80">The Light of the Day</p>
                        </div>
                        <div className="flex items-center gap-6 text-white">
                            <a href="https://www.instagram.com/daylight.asia">
                                <AiFillInstagram className="h-5 w-5 hover:scale-150 transition" />
                            </a>
                            <a href="https://www.tiktok.com/@daylight_asia">
                                <FaTiktok className="h-5 w-5 hover:scale-150 transition" />
                            </a>
                            <a href="https://youtube.com/@daylightasia">
                                <FaYoutube className="h-5 w-5 hover:scale-150 transition" />
                            </a>
                            <a href="https://medium.com/@Daylight.asia">
                                <FaMedium className="h-5 w-5 hover:scale-150 transition" />
                            </a>
                        </div>
                        <button className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition-colors self-start md:self-auto">
                            <span>Indonesia</span>
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 font-semibold">
                        <div>
                            <p className="text-white inline-block text-lg">
                                DayLight Category
                            </p>
                            <hr className="border border-b-white mt-2 mb-4" />
                            <div className="space-y-2 text-white/90 font-medium text-base flex flex-col">
                                <a href="">DayBreak</a>
                                <a href="">DayTrip</a>
                                <a href="">DayCare</a>
                            </div>
                        </div>

                        <div>
                            <p className="text-white inline-block text-lg">Menu</p>
                            <hr className="border border-b-white mt-2 mb-4" />
                            <div className="space-y-2 text-white/90 font-medium text-base flex flex-col">
                                <a href="/">Home</a>
                                <a href="/blogs">Blogs</a>
                                <a href="/about-us">About Us</a>
                                <a href="/contact-us">Contact Us</a>
                            </div>
                        </div>

                        <div>
                            <p className="text-white inline-block text-lg">
                                DayLight Category
                            </p>
                            <hr className="border border-b-white mt-2 mb-4" />
                            <div className="space-y-2 text-white/90 font-medium text-base flex flex-col">
                                <a href="/terms">Term &amp; Conditions</a>
                                <a href="/privacy">Privacy Policy</a>
                                <a href="/community-guidelines">Community Guidelines</a>
                            </div>
                        </div>

                        {/* <div className="space-y-4">
                            <p className="bg-white text-[#c45c1d] rounded-full inline-block px-4 py-2">
                                Menu
                            </p>
                            <div className="space-y-2 text-white/90 font-medium">
                                <p>Home</p>
                                <p>Blogs</p>
                                <p>About Us</p>
                                <p>Contact Us</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="bg-white text-[#c45c1d] rounded-full inline-block px-4 py-2">
                                DayLight Category
                            </p>
                            <div className="space-y-2 text-white/90 font-medium">
                                <p>Term &amp; Conditions</p>
                                <p>Privacy Policy</p>
                                <p>Community</p>
                                <p>Guidelines</p>
                            </div>
                        </div> */}
                    </div>

                    <div className="h-px bg-white/40" />
                    <p className="text-center text-xs text-white/80 font-semibold tracking-wide">
                        © 2025 All rights Reserved. Team DayLight.asia
                    </p>
                </div>
            </div>
        </section>
    );
}