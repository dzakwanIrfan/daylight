"use client";

import Image from "next/image";

import { Button } from "@/components/company-profile/components/button";
import Navbar from "@/components/company-profile/components/navbar";
import Footer from "@/components/company-profile/components/footer";
import { MeshGradient } from "@blur-ui/mesh-gradient";

import { FaMedium, FaTiktok, FaYoutube } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";

const STORIES = [
    {
        id: 1,
        title: "Chapter 1: The City of Lights",
        image: "/images/about-us/story-poster1.png",
        url: "#",
    },
    {
        id: 2,
        title: "Chapter 2: The Darkness",
        image: "/images/about-us/story-poster2.png",
        url: "#",
    },
    {
        id: 3,
        title: "Chapter 3: The Walls",
        image: "/images/about-us/story-poster3.png",
        url: "#",
    },
];

export default function AboutUsPage() {
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
            <section className="min-h-screen px-4 sm:px-6 pt-40 overflow-hidden pb-20 md:pb-40">
                <div className="flex items-center">
                    <div className="container max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-20 lg:gap-0 items-center">
                            {/* Right Side Cards & Emojis */}
                            <div className="relative lg:min-h-[500px]">
                                {/* Card Image */}
                                <div className="relative z-20 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                                    <div className="relative w-full max-w-sm">
                                        <Image
                                            src="/images/about-us/stock1.png"
                                            alt="DayLight Community"
                                            width={500}
                                            height={600}
                                            className="rounded-2xl object-cover md:max-w-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="space-y-8 text-center md:text-left">
                                <h1 className="logo-text text-brand text-6xl">DayLight</h1>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                    Daylight is the world’s first Belonging Platform. Focused on
                                    identity, experience, and real life connection
                                </h2>
                                <div>
                                    <Button href="/personality-test"> Sign Up Now </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="min-h-screen flex flex-col items-center justify-center mx-6 md:mx-0 md:py-20 gap-10 md:gap-24">
                <div>
                    <h1 className="text-3xl font-sans font-bold">
                        Why <span className="logo-text text-brand">DayLight</span>?
                    </h1>
                </div>
                <div>
                    <div className="relative px-14 pt-14 py-8 rounded-2xl shadow-xl border-2 border-orange-200 bg-radial from-orange-100 to-orange-300 flex md:max-w-2xl inset-shadow-sm inset-shadow-white">
                        <div className="-top-10 absolute w-36 h-36 left-0 md:w-96 md:h-96 shrink-0 md:ml-4 md:-left-44 md:-top-10">
                            <Image
                                src="/images/about-us/maskot.png"
                                alt="maskot"
                                height={500}
                                width={500}
                                className="object-cover drop-shadow-lg"
                            />
                        </div>
                        <div className="absolute w-28 h-28 top-0 right-0 md:w-32 md:h-w-32 shrink-0 md:ml-4 md:-right-9 md:-top-10">
                            <Image
                                src="/images/about-us/question-marks.png"
                                alt="maskot"
                                height={500}
                                width={500}
                                className="object-cover drop-shadow-lg"
                            />
                        </div>
                        <div className="text-lg md:text-2xl font-bold pt-14 md:pt-0 md:pl-28">
                            <p>
                                We live in a hyper-connected world, but we felt disconnected.
                            </p>
                            <br />
                            <p>
                                You realize what&apos;s missing isn&apos;t followers, but real
                                connection.
                            </p>
                            <br />
                            <p>DayLight is here to help “Reconnecting the Disconnected”.</p>
                            <br />
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Behind DayLight Section */}
            <section className="py-10 md:py-20 px-4 sm:px-6 min-h-screen">
                <div className="container max-w-7xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-2">
                            Story Behind{" "}
                            <span className="logo-text text-brand">DayLight</span>
                        </h2>
                    </div>

                    {/* Timeline Content */}
                    <div className="container max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="flex flex-col lg:flex-row-reverse items-center gap-5 lg:gap-24 mb-7 md:mb-0">
                            {/* Polaroid image */}
                            <div className="flex-1 relative w-full group">
                                <div className="transform rotate-3 hover:rotate-6 transition-transform duration-300">
                                    <div>
                                        <Image
                                            src="/images/about-us/stock2.png"
                                            alt="Daylight is Born"
                                            width={400}
                                            height={500}
                                            className="object-cover rounded-sm w-full max-w-[400px] h-auto"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4 text-center lg:text-left max-w-2xl">
                                <div className="bg-brand text-white px-4 py-2 rounded-lg inline-block font-bold">
                                    The World Problem
                                </div>
                                <div className="space-y-4 text-gray-800">
                                    <p>
                                        The World Health Organization (WHO) declared{" "}
                                        <strong>
                                            loneliness as a global public health concern, revealing
                                            that 1 in 6 people worldwide face loneliness on a regular
                                            basis
                                        </strong>{" "}
                                        (WHO, 2023-2025).
                                    </p>
                                    <p>
                                        Research also showed loneliness is more severe in urban,
                                        individualistic societies, where people live closer but
                                        connect less. (University of Manchester, 2023; Nature,
                                        2021).
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Daylight is Born - Image left, content right */}
                        <div className="flex flex-col lg:flex-row items-center gap-5 lg:gap-24 mb-7 md:mb-0">
                            {/* Polaroid image */}
                            <div className="flex-1 relative w-full group">
                                <div className="transform rotate-3 hover:rotate-6 transition-transform duration-300">
                                    <div>
                                        <Image
                                            src="/images/about-us/stock3.png"
                                            alt="Daylight is Born"
                                            width={400}
                                            height={500}
                                            className="object-cover rounded-sm w-full max-w-[400px] h-auto"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 space-y-4 text-center lg:text-left">
                                <div className="bg-brand text-white px-4 py-2 rounded-lg inline-block font-bold">
                                    20 August 2025 - Daylight is Born
                                </div>
                                <p className="text-gray-800">
                                    We founded Daylight with a simple but powerful idea:{" "}
                                    <strong>
                                        Friendship should be part of our lifestyle, and it&apos;s
                                        should be easy as booking a ride or ordering foods.
                                    </strong>
                                </p>
                            </div>
                        </div>

                        {/* MVP Launch - Content left, image right */}
                        <div className="flex flex-col lg:flex-row-reverse items-center gap-5 lg:gap-24 mb-7 md:mb-0">
                            {/* Polaroid image */}
                            <div className="flex-1 relative w-full group">
                                <div className="transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                                    <div>
                                        <Image
                                            src="/images/about-us/stock4.png"
                                            alt="MVP Launch"
                                            width={400}
                                            height={500}
                                            className="object-cover rounded-sm w-full max-w-[400px] h-auto"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 space-y-4 text-center lg:text-left">
                                <div className="bg-brand text-white px-4 py-2 rounded-lg inline-block font-bold">
                                    16 October 2025 - MVP Launch
                                </div>
                                <p className="text-gray-800">
                                    Daylight&apos;s first pilot goes live in{" "}
                                    <strong>Jakarta, Indonesia</strong>. Our mission is to{" "}
                                    <strong>
                                        transform dinners, coffees, and other activities into safe
                                        spaces where strangers can become friends.
                                    </strong>
                                </p>
                            </div>
                        </div>

                        {/* Website Launch - Image left, content right */}
                        <div className="flex flex-col lg:flex-row items-center gap-5 lg:gap-24 mb-7 md:mb-0">
                            {/* Polaroid image */}
                            <div className="flex-1 relative w-full group">
                                <div className="transform rotate-3 hover:rotate-6 transition-transform duration-300">
                                    <div>
                                        <Image
                                            src="/images/about-us/stock5.png"
                                            alt="DayLight Community"
                                            width={400}
                                            height={500}
                                            className="object-cover rounded-sm w-full max-w-[400px] h-auto"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 space-y-4 text-center lg:text-left">
                                <div className="bg-brand text-white px-4 py-2 rounded-lg inline-block font-bold">
                                    16 December 2025 - Website Launch
                                </div>
                                <div className="space-y-4 text-gray-800">
                                    <p>
                                        When you join a Daylight event,{" "}
                                        <strong>
                                            you&apos;re contributing to fighting the global loneliness
                                            epidemic.
                                        </strong>
                                    </p>
                                    <p>
                                        Your presence matters, someone else is excited to see you!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="min-h-screen py-10 md:py-20 px-4 sm:px-6 flex flex-col items-center justify-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-0 md:mb-2 text-center">
                    Story Behind <br /><span className="logo-text text-brand">The Lights</span>
                </h2>
                <div className="text-center max-w-lg py-16">
                    <p>
                        <span className="font-bold">The city of lights</span> is a story
                        written by Daylight founder, Lilis Huri as the background story of
                        our lights characters.
                    </p>
                    <br />
                    <p>
                        The story is inspired by real life events that happened
                        post-pandemic, when people felt disconnected, isolated, and unsure
                        how to find their way back to each other.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-14 md:gap-24">
                    {STORIES.map((story) => (
                        <div className="flex flex-col gap-3 md:gap-10" key={story.id}>
                            <Image
                                src={story.image}
                                alt="Daylight is Born"
                                width={400}
                                height={500}
                                className="object-cover rounded-sm w-full max-w-[400px] h-auto"
                            />
                            <h1 className="font-bold text-xl">{story.title}</h1>
                            <div className="max-w-1/2">
                                <Button href={story.url}>Read More</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-[url('/images/about-us/cta-bg.png')] bg-cover py-32">
                {/* <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "",
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div> */}

                <div className="flex flex-col items-center justify-center gap-14 px-4">
                    <h1 className="text-3xl md:text-5x lg:text-6xl font-bold text-white text-center">Follow our Journey</h1>
                    <div className="flex text-white gap-10 lg:gap-14">
                        <a href="https://www.instagram.com/daylight.asia">
                            <AiFillInstagram className="h-9 w-8 md:h-14 md:w-14 hover:scale-150 transition" />
                        </a>
                        <a href="https://www.tiktok.com/@daylight_asia">
                            <FaTiktok className="h-9 w-8 md:h-14 md:w-14 hover:scale-150 transition" />
                        </a>
                        <a href="https://youtube.com/@daylightasia">
                            <FaYoutube className="h-9 w-8 md:h-14 md:w-14 hover:scale-150 transition" />
                        </a>
                        <a href="https://medium.com/@Daylight.asia">
                            <FaMedium className="h-9 w-8 md:h-14 md:w-14 hover:scale-150 transition" />
                        </a>
                    </div>
                    <Button href="/personality-test">Create Your Account</Button>
                </div>
            </section>

            <Footer></Footer>
        </div>
    );
}