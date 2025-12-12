"use client";

import { Button } from "@/components/company-profile/components/button";
import Navbar from "@/components/company-profile/components/navbar";
import { MeshGradient } from "@blur-ui/mesh-gradient";

import { FaMedium, FaTiktok, FaYoutube } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import Footer from "@/components/company-profile/components/footer";

export default function ContactUsPage() {
    return (
        <div className="relative font-sans overflow-x-hidden">
            <Navbar></Navbar>

            <div className="fixed inset-0 -z-10 w-full h-full">
                <MeshGradient
                    colors={{
                        color1: "#FFF0E6",
                        color2: "#FEECA7",
                        color3: "#A2D6E6",
                        color4: "#f2ac55",
                    }}
                    opacity={0.8}
                    className="w-full h-full"
                    style={{ width: "100%", height: "100%" }}
                />
            </div>

            <section className="min-h-screen px-12 sm:px-6 pt-40 overflow-hidden pb-20 md:pb-40">
                <div className="flex flex-col items-center">
                    <div className="text-center mb-10">
                        <div className="text-4xl md:text-5xl font-bold mb-0 md:mb-2">
                            Contact Us
                        </div>
                        <p>Reach us through email and WhatsApp.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-20">
                        <div className="max-w-2xl px-10 py-5 flex flex-col gap-16 rounded-xl bg-white/30 backdrop-blur-lg border-white/20 inset-shadow-sm inset-shadow-white">
                            <div className="flex flex-col md:flex-row justify-start gap-12 md:gap-0 md:justify-between">
                                <div className="flex flex-col gap-3">
                                    <div className="text-gray-500 font-bold text-xl">
                                        Our Contact
                                    </div>
                                    <div className="font-bold text-base">
                                        <div>contact@daylightapp.asia</div>
                                        <div>+62 819 - 2432 - 712</div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="text-gray-500 font-bold text-xl">
                                        Our Social Media
                                    </div>
                                    <div className="font-bold text-base">
                                        <div className="flex gap-4">
                                            <a href="https://www.instagram.com/daylight.asia">
                                                <AiFillInstagram className="h-8 w-8 hover:scale-150 transition" />
                                            </a>
                                            <a href="https://www.tiktok.com/@daylight_asia">
                                                <FaTiktok className="h-8 w-8 hover:scale-150 transition" />
                                            </a>
                                            <a href="https://youtube.com/@daylightasia">
                                                <FaYoutube className="h-8 w-8 hover:scale-150 transition" />
                                            </a>
                                            <a href="https://medium.com/@Daylight.asia">
                                                <FaMedium className="h-8 w-8 hover:scale-150 transition" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row justify-center gap-10">
                                <div className="flex flex-col gap-4">
                                    <div className="text-gray-500 font-bold text-xl">
                                        Customer Support
                                    </div>
                                    <div className="text-base">
                                        <div>Our support team is available just contact us.</div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="text-gray-500 font-bold text-xl">
                                        Feedback and Suggestions
                                    </div>
                                    <div className="text-base">
                                        <div>
                                            Help us build a better platform, any suggestion to improve
                                            the platform are always welcome.
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 md:justify-between">
                                    <div className="text-gray-500 font-bold text-xl">
                                        Media Inquiries
                                    </div>
                                    <div className="text-base">
                                        <div>
                                            For partnership, and collaboration you could email us at
                                            contact@daylightapp.asia.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full max-w-2xl px-6 sm:px-10 py-10 flex flex-col gap-10 rounded-3xl bg-white/30 backdrop-blur-lg border-white/20 inset-shadow-sm inset-shadow-white">
                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                                <h1 className="text-3xl font-bold text-gray-800">
                                    Get in Touch
                                </h1>
                                <p className="text-lg text-gray-700">Send us a message</p>
                            </div>

                            <form className="flex flex-col gap-6">
                                <input
                                    type="text"
                                    placeholder="Subject (For Partnership & Collab)"
                                    className="w-full rounded-full px-6 py-4 bg-white text-gray-800 placeholder:text-gray-500 shadow-[0_6px_12px_rgba(0,0,0,0.08)] border border-white focus:outline-none focus:ring-2 focus:ring-[#f2ac55]"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Your Full Name *"
                                        className="rounded-full px-6 py-4 bg-white text-gray-800 placeholder:text-gray-500 shadow-[0_6px_12px_rgba(0,0,0,0.08)] border border-white focus:outline-none focus:ring-2 focus:ring-[#f2ac55]"
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Your Email *"
                                        className="rounded-full px-6 py-4 bg-white text-gray-800 placeholder:text-gray-500 shadow-[0_6px_12px_rgba(0,0,0,0.08)] border border-white focus:outline-none focus:ring-2 focus:ring-[#f2ac55]"
                                        required
                                    />
                                </div>

                                <textarea
                                    placeholder="Your Message *"
                                    rows={5}
                                    className="w-full rounded-3xl px-6 py-4 bg-white text-gray-800 placeholder:text-gray-500 shadow-[0_6px_12px_rgba(0,0,0,0.08)] border border-white focus:outline-none focus:ring-2 focus:ring-[#f2ac55] resize-none"
                                    required
                                />

                                <div className="flex justify-center pt-2">
                                    <Button href="#">Send</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            <Footer></Footer>
        </div>
    );
}