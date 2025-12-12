"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Coffee,
    Heart,
    Quote,
} from "lucide-react";
import { FaMedium, FaTiktok, FaYoutube } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { MeshGradient } from "@blur-ui/mesh-gradient";
import { Button } from "@/components/company-profile/components/button";
import Navbar from "@/components/company-profile/components/navbar";
import InfiniteScroll from "@/components/company-profile/components/infinite-scroll";
import Footer from "@/components/company-profile/components/footer";

const ARCHETYPES = [
    {
        id: 1,
        name: "Hope",
        description:
            "Hope is our primary mascot, a light-shaped character and the leader of the pack.",
        color: "bg-radial-[at_25%_25%] from-[#FFD6AF] to-[#FFC370]",
        image: "/images/archetypes/default-cropped.png",
        tags: [
            { text: "Cute", color: "bg-orange-500" },
            { text: "Adorable", color: "bg-orange-300" },
            { text: "Friendly", color: "bg-pink-500" },
        ],
    },
    {
        id: 2,
        name: "Blaze",
        description:
            "Bold, passionate, and fearless. Move faster than doubt, and never do anything halfway. Inspire others and create change.",
        color: "bg-radial-[at_25%_25%] from-[#F8945F] to-[#DB5E4C]",
        image: "/images/archetypes/blazing-noon-cropped.png",
        tags: [
            { text: "Passionate", color: "bg-orange-500" },
            { text: "Bold", color: "bg-yellow-400" },
            { text: "Fearless", color: "bg-red-500" },
        ],
    },
    {
        id: 3,
        name: "Boldie",
        description:
            "Creative, mysterious, and alive at night. You thrive in the darkness and bring light to hidden places.",
        color: "bg-radial-[at_75%_25%] from-[#FFC370] to-[#FF5757]",
        image: "/images/archetypes/bold-noon-cropped.png",
        tags: [
            { text: "Driven", color: "bg-[#FFAE3D]" },
            { text: "Visionary", color: "bg-[#e78060]" },
            { text: "Focused", color: "bg-[#83e7ec]" },
        ],
    },
    {
        id: 4,
        name: "Bright",
        description:
            "Bright is like sunrise; warm and lively. An extrovert and a natural mood-lifter. Genuine and approachable. Always find the bright side, stay optimistic yet realistic. ",
        color:
            "bg-linear-to-br from-[#6CFFCB] to-[#FFEB72] bg-radial-[at_50%_75%] text-yellow-600",
        image: "/images/archetypes/bright-morning-cropped.png",
        tags: [
            { text: "Optimistic", color: "bg-[#4db4b8]" },
            { text: "Energetic", color: "bg-[#69c987]" },
            { text: "Outgoing", color: "bg-orange-400" },
        ],
    },
    {
        id: 5,
        name: "Dawn",
        description:
            "The Calm. Gentle and intuitive. Prefer observing over speaking. Have strong boundaries, reflective and deeply intuitive.",
        color: "bg-linear-to-br from-[#A2D6E6] to-[#FF5757] bg-radial-[at_25%_25%]",
        image: "/images/archetypes/calm-dawn-cropped.png",
        tags: [
            { text: "Gentle", color: "bg-[#c15444]" },
            { text: "Thoughtful", color: "bg-[#FF5757]" },
            { text: "Warm", color: "bg-[#87d4ff]" },
        ],
    },
    {
        id: 6,
        name: "Claudia",
        description:
            "Imaginative, deeply empathetic, and dreamy. Understand the world with softness and intuition most people don’t have",
        color: "bg-radial from-[#b7d2ed] to-white text-indigo-600",
        image: "/images/archetypes/cloudy-day-cropped.png",
        tags: [
            { text: "Creative", color: "bg-[#86ddf7]" },
            { text: "Empathetic", color: "bg-[#ffc38a]" },
            { text: "Dream", color: "bg-[#5D84A7]" },
        ],
    },
    {
        id: 7,
        name: "Goldie",
        description:
            "Charismatic, expressive, and radiant. Connect easily,  naturally confident,  and charming. Give warmth to many, yet often being misunderstood.",
        color: "bg-radial to-[#FFC370] from-[#f5d5a9]",
        image: "/images/archetypes/golden-hour-cropped.png",
        tags: [
            { text: "Charismatic", color: "bg-[#FFAE3D]" },
            { text: "Radian", color: "bg-[#D84F41]" },
            { text: "Expressive", color: "bg-[#7c5630]" },
        ],
    },
    {
        id: 8,
        name: "Bowie",
        description:
            "Balanced, adaptable, and harmonious. Balancing between social and personal life naturally. Easygoing, thoughtful, perceptive, and grounded",
        color: "bg-linear-to-br from-[#9747FF] via-[#a0fabc] to-[#FFF8C3]",
        image: "/images/archetypes/perfect-day-cropped.png",
        tags: [
            { text: "Balanced", color: "bg-[#6B6BFF]" },
            { text: "Adaptable", color: "bg-[#FF5757]" },
            { text: "Easygoing", color: "bg-[#FFC370]" },
        ],
    },
    {
        id: 9,
        name: "Dusk",
        description:
            "Silence, depth, and sharp insight. Observe before engaging. Speak little but with meaning. Process life through logic and intuition.",
        color: "bg-linear-to-br from-[#fcdbac] to-[#865cd6]",
        image: "/images/archetypes/quiet-dusk-cropped.png",
        tags: [
            { text: "Deep", color: "bg-[#161346]" },
            { text: "Reflective", color: "bg-[#FFC370]" },
            { text: "Analytical", color: "bg-[#6B6BFF]" },
        ],
    },
    {
        id: 10,
        name: "Sirene",
        description:
            "Calm, steady, and wise. Not the loudest, but the most reliable. Patient, open-minded, and #1 in speed dial.",
        color: "bg-linear-to-br from-[#90c2f0] to-[#89c99a]",
        image: "/images/archetypes/serene-drizzle-cropped.png",
        tags: [
            { text: "Deep", color: "bg-[#A2D6E6]" },
            { text: "Reflective", color: "bg-[#fcb774]" },
            { text: "Analytical", color: "bg-[#9EB97C]" },
        ],
    },
    {
        id: 11,
        name: "Starry",
        description:
            "Walks between reality and imagination. Look calm on the outside while ideas running endlessly inside your head. Guided by intuition, sense energies and patterns others overlook.",
        color: "bg-radial-[at_25%_25%] from-[#52b0d9] to-[#a96ef5]",
        image: "/images/archetypes/starry-night-cropped.png",
        tags: [
            { text: "Visionary", color: "bg-[#376296]" },
            { text: "Independent", color: "bg-[#1d2536]" },
            { text: "Intuitive", color: "bg-[#7a867d]" },
        ],
    },
];

// --- DATA FOR SERVICES ---
const SERVICES = [
    {
        id: "daybreak",
        title: "DayBreak",
        description:
            "Dinner & Coffee activities, designed to turn simple moments into effortless conversations and genuine connections with the people at your table.",
        image: "/images/landing-page/stock3.png",
        buttonText: "Book a Table",
        icon: <Coffee className="w-5 h-5" />,
        align: "left",
    },
    {
        id: "daytrip",
        title: "DayTrip",
        description:
            "Trip with Strangers. Discover new places, hidden city gems, and weekend adventures with like-minded friends who share your spirit for spontaneous fun.",
        image: "/images/landing-page/stock4.png",
        buttonText: "Book a Trip",
        icon: <MapPin className="w-5 h-5" />,
        align: "right",
    },
    {
        id: "daycare",
        title: "DayCare",
        description:
            "Health & Wellness connect through health and mind-focused activities.",
        image: "/images/landing-page/stock5.png",
        buttonText: "Book a Spot",
        icon: <Heart className="w-5 h-5" />,
        align: "left",
    },
];

// --- DATA FOR TESTIMONIALS ---
const TESTIMONIALS = [
    {
        id: 1,
        name: "Tiara",
        text: "I came feeling a bit nervous, afraid I wouldn't fit in. But once I sat down and started talking, everything just flowed. We shared little stories, laughed at silly things, even opened up about things I never thought I’d say to strangers. I know it’s weird, but going home after Daylight Dinner felt like meeting people who just get you.",
        image: "/images/landing-page/testimony/tiara.png",
    },
    {
        id: 2,
        name: "Raiyan",
        text: "Aku kira bakal awkward duduk bareng orang yang aku bahkan nggak tau namanya. Tapi malah jadi nyaman banget. Kita saling nanya hal-hal simple, terus tiba-tiba udah ngobrolin hidup. Semua ngalir tanpa dipaksa. Daylight Dinner bikin aku sadar kalau koneksi itu kadang muncul dari hal-hal yang paling sederhana.",
        image: "/images/landing-page/testimony/raiyan.png",
    },
    {
        id: 3,
        name: "Rayhan",
        text: "Aku kira bakal awkward duduk bareng orang yang aku bahkan nggak tau namanya. Tapi malah jadi nyaman banget. Kita saling nanya hal-hal simple, terus tiba-tiba udah ngobrolin hidup. Semua ngalir tanpa dipaksa.",
        image: "/images/landing-page/testimony/rayhan.png",
    },
    {
        id: 4,
        name: "Ihsan",
        text: "Nggak nyangka sih, dinner bareng stranger bisa se-enjoy itu.",
        image: "/images/landing-page/testimony/ihsan.png",
    },
    {
        id: 5,
        name: "Sarah",
        text: "Ikut Dinner Daylight tuh pengalaman beda banget. Awalnya cuma datang sendiri, tapi ketemu orang-orang baru yang easy-going bikin ngobrolnya ngalir.",
        image: "/images/landing-page/testimony/sarah.png",
    },
    {
        id: 6,
        name: "Salma",
        text: "Dinner bareng stranger lewat Daylight ternyata nggak awkward sama sekali. Obrolan seru, laugh bareng, dan sambil nikmatin makanan yang enak. Seru banget, pengen ulang lagi!",
        image: "/images/landing-page/testimony/salma.png",
    },
    {
        id: 7,
        name: "Sandi",
        text: "Nggak ada yang sok jago, semua santai. Jadi enak banget ngobrolnya gw gaak kenal siapa pun, tapi somehow langsung nyambung. Seru banget billiard kali ini",
        image: "/images/landing-page/testimony/sandi.png",
    },
    {
        id: 8,
        name: "Hilmi",
        text: "Nggak expect apa-apa, tapi pulang dengan keseruan yang ga pernah gw dptin. Billiard bareng stranger ternyata seru",
        image: "/images/landing-page/testimony/hilmi.png",
    },
    {
        id: 9,
        name: "Akmal",
        text: "Di Daylight, gue dapet pengalaman baru yang seru banget. Bayangin, lo dikumpulin dalam satu ruangan bareng orang-orang random, tapi vibes-nya nyaman dan ngobrolnya ngalir aja. Yang bikin keren, Daylight nyesuain sama kepribadian lo, bahkan sampe ke Persona quiz. Jadi yang lo temuin beneran bisa nyambung dan relate.",
        image: "/images/landing-page/testimony/akmal.png",
    },
    {
        id: 10,
        name: "Aris",
        text: "Jujur gue bener bener iseng coba coba aja ketemuan sama orang yang ga gue kenal di Daylight, gue kira tuh bakalan ga sefrekuensi loh, Tapi ternyata mereka itu beneer bener seru dan asik banget jujur, sematch itu sama gue, jadi bawaanya tuh selalu have fun terus, obrolan kayak let it flow aja gitu. Mantap mantap respect Daylight",
        image: "/images/landing-page/testimony/aris.png",
    },
    {
        id: 11,
        name: "Rina",
        text: "Halloween kali ini ikut rumah hantu Blok M lewat Daylight, gokil banget! Awalnya deg-degan, tapi teriak bareng orang-orang baru bikin seru parah. Seram + ketawa bareng stranger = pengalaman Halloween paling memorable.",
        image: "/images/landing-page/testimony/rina.png",
    },
    {
        id: 12,
        name: "Khadijah",
        text: "Gak nyangka Halloween kali ini bakal sefun ini. Rumah hantu + Daylight bikin aku ketemu stranger yang asik, teriak bareng, dan pulang bawa temen baru. Bener-bener pengalaman yang nggak terlupakan.",
        image: "/images/landing-page/testimony/khadijah.png",
    },
    {
        id: 13,
        name: "Hana",
        text: "Halloween ini berasa spesial karena ikut rumah hantu Blok M via Daylight. Bareng stranger ketawa, teriak, dan main bareng. Halloween jadi lebih seru, aman, dan memorable.",
        image: "/images/landing-page/testimony/hana.png",
    },
    {
        id: 14,
        name: "Gilang",
        text: "Halloween kemarin ikut rumah hantu Blok M bareng Daylight, rasanya beda banget. Deg-degan, tapi excited liat orang-orang baru ikutan teriak sama aku. Serem tapi malah jadi lucu, dan pulang bawa cerita seru sama stranger baru",
        image: "/images/landing-page/testimony/gilang.png",
    },
    {
        id: 15,
        name: "Vany",
        text: "Serius, Halloween edition Daylight tuh beda. Rumah hantu + ketemu orang baru yang gampang diajak ngobrol, teriak bareng, dan pulang bawa temen baru. Deg-degan tapi fun banget!",
        image: "/images/landing-page/testimony/vany.png",
    },
    {
        id: 16,
        name: "Sifa",
        text: "Gue kira Halloween bakal biasa aja, tapi Daylight bikin pengalaman seru banget. Ngobrol sama stranger, teriak bareng di rumah hantu, dan ketawa ngakak tanpa malu-malu. Bener-bener nggak nyesel daftar.",
        image: "/images/landing-page/testimony/sifa.png",
    },
    {
        id: 17,
        name: "Amel",
        text: "Aku kira karaoke bareng stranger bakal canggung banget. Tapi ternyata begitu lagu pertama nyala, semua langsung lepas. Kita nyanyi fals bareng, ketawa nggak berhenti, dan tiba-tiba aja kerasa akrab. Rasanya kayak ketemu orang-orang yang energinya sama. Pulang dari acara Daylight, aku mikir: ‘Wah, seru juga ya kenal orang baru tanpa harus pura-pura.",
        image: "/images/landing-page/testimony/amel.png",
    },
    {
        id: 18,
        name: "Arif",
        text: "Claudia character kerasa lembut banget. Kayak ada tempat buat ngerasain semuanya tanpa takut dinilai. Akhirnya ada penjelasan kenapa aku sering butuh waktu buat mencerna perasaan. Ternyata itu bagian dari aku. Claudia bikin aku ngerasa nggak sendirian dalam cara aku memproses hidup.",
        image: "/images/landing-page/testimony/arif.png",
    },
];

// --- DATA FOR FAQ ---
const FAQS = [
    {
        question: "What is DayLight?",
        answer:
            "DayLight is a community platform designed to connect people through real-life shared experiences like dinners, trips, and wellness activities.",
    },
    {
        question: "How do I join an event?",
        answer:
            "Simply sign up, take our persona test to find your vibe, and browse our upcoming events to book a spot!",
    },
    {
        question: "Is it safe to go on trips with strangers?",
        answer:
            "Safety is our priority. We vet participants and have community guidelines in place to ensure a safe and welcoming environment for everyone.",
    },
    {
        question: "What if I need to cancel my booking?",
        answer:
            "You can cancel up to 48 hours before the event for a full refund. Check our specific cancellation policy for DayTrips as they may vary.",
    },
    {
        question: "Do I need to come with a friend?",
        answer:
            "Not at all! Most of our members come solo. Our events are specifically designed to help you make new friends effortlessly.",
    },
];

export default function LandingPage() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [selectedTestimonial, setSelectedTestimonial] = useState<
        (typeof TESTIMONIALS)[0] | null
    >(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [archetypeCarouselIndex, setArchetypeCarouselIndex] = useState(0);
    const [canScrollNext, setCanScrollNext] = useState(true);

    // Refs for carousels
    const carouselRef = useRef<HTMLDivElement>(null);

    // Maximum characters to show before "read more"
    const MAX_TEXT_LENGTH = 150;

    // Archetype Carousel Functions
    const scrollPrev = () => {
        if (carouselRef.current) {
            const containerWidth = carouselRef.current.offsetWidth;
            carouselRef.current.scrollBy({
                left: -containerWidth,
                behavior: "smooth",
            });
        }
    };

    const scrollNext = () => {
        if (carouselRef.current) {
            const containerWidth = carouselRef.current.offsetWidth;
            carouselRef.current.scrollBy({
                left: containerWidth,
                behavior: "smooth",
            });
        }
    };

    // Track carousel scroll position
    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const handleScroll = () => {
            const scrollLeft = carousel.scrollLeft;
            const containerWidth = carousel.offsetWidth;
            const scrollWidth = carousel.scrollWidth;
            const clientWidth = carousel.clientWidth;

            // Calculate current slide index based on full container width
            const currentIndex = Math.round(scrollLeft / containerWidth);

            setArchetypeCarouselIndex(currentIndex);

            const isAtEnd = Math.abs(scrollWidth - clientWidth - scrollLeft) < 2;
            setCanScrollNext(!isAtEnd);
        };

        carousel.addEventListener("scroll", handleScroll);
        // Add resize listener to handle screen width changes
        window.addEventListener("resize", handleScroll);

        handleScroll(); // Initial check

        return () => {
            carousel.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    // Track testimonial carousel selection
    useEffect(() => {
        if (!api) {
            return;
        }

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };

        // Set initial state asynchronously to avoid linting error
        const timeoutId = setTimeout(() => {
            onSelect();
        }, 0);

        api.on("select", onSelect);

        return () => {
            clearTimeout(timeoutId);
            api.off("select", onSelect);
        };
    }, [api]);

    return (
        <div className="relative font-sans overflow-x-hidden">
            {/* --- NAV --- */}
            <Navbar isHome={true}></Navbar>

            {/* --- SECTION 1: HERO --- */}
            <section className="relative min-h-screen">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/images/landing-page/stock1.png')",
                    }}
                >
                    <div className="absolute inset-0 bg-black/20" />
                </div>

                <main className="relative z-10 flex flex-col justify-center min-h-screen px-4 sm:px-6 py-20">
                    <div className="container max-w-7xl mx-auto">
                        <div className="max-w-2xl text-left">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                                Daylight is a community platform connecting people through
                                real-life experiences.
                                <span className="hidden md:absolute bottom-64 ml-2">
                                    <Image
                                        src="/images/archetypes/default.png"
                                        alt="default-archetype"
                                        width={100}
                                        height={50}
                                        className="rounded-2xl object-cover"
                                    />
                                </span>
                            </h1>

                            <div className="mb-12">
                                <Button href="/personality-test">Take a Test</Button>
                            </div>

                            {/* Social Icons */}
                            <div className="flex flex-col gap-4">
                                <p className="text-white text-sm font-medium">
                                    Follow our Journey.
                                </p>
                                <div className="flex items-center gap-4 text-white">
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

                    <div className="absolute bottom-4 md:bottom-20 lg:bottom-32 left-1/2 transform -translate-x-1/2 z-20">
                        <button
                            onClick={() =>
                                window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
                            }
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-white hover:bg-white/30 transition-all"
                        >
                            <ChevronDown className="w-6 h-6" />
                        </button>
                    </div>
                </main>
            </section>

            {/* --- SECTION 2: CTA (Wavy Bottom) --- */}
            <section className="relative z-10 min-h-screen px-4 sm:px-6 py-20 overflow-hidden pb-40">
                <div className="flex items-center">
                    <div className="absolute inset-0 -z-10 w-full h-full">
                        <MeshGradient
                            colors={{
                                color1: "#FEECA7",
                                color2: "#D4E8E8",
                                color3: "#FFF0E6",
                                color4: "#A2D6E6",
                            }}
                            opacity={0.8}
                            className="w-full h-full"
                            style={{ width: "100%", height: "100%" }}
                        />
                    </div>

                    <div className="container max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Text Content */}
                            <div className="space-y-8 text-center md:text-left">
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                    Take the test, select an event and just show up. We’ll handle
                                    the rest.
                                </h2>
                                <div>
                                    <Button href="/personality-test"> Sign Up Now </Button>
                                </div>
                            </div>

                            {/* Right Side Cards & Emojis */}
                            <div className="relative lg:min-h-[800px]">
                                {/* Card Image */}
                                <div className="relative z-20 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                                    <div className="relative w-full max-w-sm mx-auto">
                                        <Image
                                            src="/images/landing-page/stock2.png"
                                            alt="DayLight Community"
                                            width={800}
                                            height={900}
                                            className="rounded-2xl object-cover md:max-w-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <InfiniteScroll />
                {/* WAVY DIVIDER */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-0">
                    <svg
                        className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[150px]"
                        data-name="Layer 1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 119"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z"
                            className="fill-white"
                        ></path>
                    </svg>
                </div>
            </section>

            {/* --- SECTION 3: ARCHETYPE CAROUSEL --- */}
            <section className="relative z-10 pt-24 pb-12 overflow-hidden bg-[url(/images/landing-page/grid-background.png)] bg-cover bg-no-repeat">
                {/* Subtle Perspective Grid Background */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.3]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 140, 0, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 140, 0, 0.08) 1px, transparent 1px)`,
                        backgroundSize: "40px 40px",
                        transform: "perspective(500px) rotateX(20deg) scale(1.2)",
                    }}
                ></div>

                <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-2 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                            Persona quiz
                        </h2>
                        <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                            Take the test and discover your{" "}
                            <span className="font-bold text-gray-900">light persona</span>. We
                            chose &quot;light&quot; because we believe everyone carries a glow
                            within them. And that inner light, no matter how small, can
                            brighten someone else&apos;s world and spark hope in ways you
                            might never realize.
                        </p>
                    </div>

                    <div className="relative group">
                        {archetypeCarouselIndex > 0 && (
                            <button
                                onClick={scrollPrev}
                                className="absolute left-4 md:left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 bg-white p-3 rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-orange-500 hover:scale-110 transition-all flex items-center justify-center w-12 h-12"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        <div
                            ref={carouselRef}
                            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar px-4 md:px-0 w-full"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            {/* First slide: All archetypes group image */}
                            <div className="snap-center shrink-0 w-full flex items-center justify-center px-4">
                                <div className="relative w-full md:max-w-2xl aspect-video">
                                    <Image
                                        src="/images/landing-page/archetypes-group.png"
                                        alt="All Light Personas"
                                        fill
                                        className="object-contain drop-shadow-lg"
                                    />
                                </div>
                            </div>

                            {/* Individual archetype cards */}
                            {ARCHETYPES.map((archetype) => (
                                <div
                                    key={archetype.id}
                                    className="snap-center shrink-0 w-full flex items-center justify-center px-4"
                                >
                                    <div
                                        className={`w-full max-w-xl ${archetype.color} rounded-2xl p-8 shadow-xl border-2 border-orange-200 hover:-translate-y-2 transition-transform duration-300 flex flex-col md:flex-row items-center relative overflow-visible`}
                                    >
                                        {/* Image on the left, overlapping the card */}
                                        <div className="relative -top-10 md:absolute w-36 h-36 md:w-64 md:h-64 shrink-0 md:ml-4 md:-left-44 md:-top-10">
                                            <Image
                                                src={archetype.image}
                                                alt={archetype.name}
                                                height={500}
                                                width={500}
                                                className="object-cover drop-shadow-lg"
                                            />
                                        </div>

                                        {/* Text content on the right */}
                                        <div className="flex-1 space-y-4 md:pl-28 md:pt-0">
                                            <h3 className="text-3xl font-bold text-gray-900">
                                                {archetype.name}
                                            </h3>
                                            <p className="text-gray-700 text-base leading-relaxed">
                                                {archetype.description}
                                            </p>
                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {archetype.tags?.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className={`${tag.color} text-white px-4 py-1.5 rounded-full text-sm font-medium`}
                                                    >
                                                        {tag.text}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {canScrollNext && (
                            <button
                                onClick={scrollNext}
                                className="absolute right-4 md:right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 bg-white p-3 rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-orange-500 hover:scale-110 transition-all flex items-center justify-center w-12 h-12"
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-gray-900 font-bold mb-6 text-lg">
                            Find your light <span className="text-orange-500">archetype</span>{" "}
                            here:
                        </p>
                        <Button href="/personality-test">Start the test</Button>
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: SERVICES LIST --- */}
            <section className="relative z-10 py-24">
                <div className="absolute inset-0 -z-10 w-full h-full">
                    <MeshGradient
                        colors={{
                            color1: "#FEECA7",
                            color2: "#D4E8E8",
                            color3: "#FFF0E6",
                            color4: "#A2D6E6",
                        }}
                        opacity={0.8}
                        className="w-full h-full"
                        style={{ width: "100%", height: "100%" }}
                    />
                </div>
                <div className="custom-shape-divider-top-1765113513">
                    <svg
                        data-name="Layer 1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 119"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                            className="shape-fill"
                        ></path>
                    </svg>
                </div>
                <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-32">
                    {SERVICES.map((service) => (
                        <div
                            key={service.id}
                            className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${service.align === "right" ? "lg:flex-row-reverse" : ""
                                }`}
                        >
                            {/* Image */}
                            <div className="flex-1 relative w-full group">
                                <div
                                    className={`absolute -top-10 -left-10 w-full h-full bg-orange-200/50 rounded-[4rem] rotate-3 group-hover:rotate-6 transition-transform duration-500 blur-xl`}
                                ></div>

                                <div className="relative w-full aspect-4/3 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/50 transform group-hover:scale-[1.01] transition-transform duration-500">
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 space-y-6 text-center lg:text-left">
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight font-display logo-text">
                                    {service.title}
                                </h2>
                                <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium max-w-md mx-auto lg:mx-0">
                                    {service.description}
                                </p>
                                <Button href="#">{service.buttonText}</Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="custom-shape-divider-bottom-1765113567">
                    <svg
                        data-name="Layer 1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 119"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                            className="shape-fill"
                        ></path>
                    </svg>
                </div>
            </section>

            {/* --- SECTION 5: TESTIMONIALS --- */}
            <section className="relative z-10 py-24 bg-white w-full overflow-hidden">
                <div className="w-full mx-auto px-4 sm:px-6 md:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                            What <span className="text-orange-500">Our Community</span>
                            <br />
                            Said about Daylight
                        </h2>
                    </div>

                    {/* Carousel */}
                    <div className="relative group w-full">
                        <Carousel
                            setApi={setApi}
                            opts={{
                                align: "center",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-2 md:-ml-4 lg:-ml-6 py-20">
                                {TESTIMONIALS.map((testimonial, index) => {
                                    const isLongText = testimonial.text.length > MAX_TEXT_LENGTH;
                                    const truncatedText = isLongText
                                        ? testimonial.text.substring(0, MAX_TEXT_LENGTH) + "..."
                                        : testimonial.text;

                                    return (
                                        <CarouselItem
                                            key={testimonial.id}
                                            className="pl-9 md:pl-4 lg:pl-6 basis-[280px] sm:basis-[320px] md:basis-[380px] lg:basis-[400px]"
                                        >
                                            <div
                                                className={cn(
                                                    "flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 h-[480px] md:h-[600px]",
                                                    {
                                                        "scale-110 md:scale-105 shadow-2xl z-10":
                                                            current === index,
                                                        "hover:shadow-2xl z-0": current !== index,
                                                    }
                                                )}
                                            >
                                                <div className="relative w-full h-44 md:h-64 bg-gray-100 shrink-0">
                                                    <Image
                                                        src={testimonial.image}
                                                        alt={testimonial.name}
                                                        fill
                                                        className="object-cover object-top"
                                                    />
                                                </div>
                                                <div className="p-6 md:p-8 flex flex-col flex-1 min-h-0">
                                                    <div className="flex-1 overflow-y-hidden pr-1">
                                                        <Quote className="w-4 h-4 md:w-8 md:h-8 text-black mb-4 fill-current shrink-0" />
                                                        <p className="text-gray-700 font-medium leading-relaxed text-xs md:text-base">
                                                            {truncatedText}
                                                        </p>
                                                        {isLongText && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTestimonial(testimonial);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className="mt-3 text-orange-500 hover:text-orange-600 font-semibold text-sm transition-colors"
                                                            >
                                                                Read more
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="mt-4 md:mt-6 text-right shrink-0 pt-4 border-t border-gray-100">
                                                        <p className="font-bold text-gray-900 text-lg">
                                                            - {testimonial.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    );
                                })}
                            </CarouselContent>
                            <CarouselPrevious className="left-2 md:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-orange-500 hover:scale-110 transition-all hidden md:flex" />
                            <CarouselNext className="right-2 md:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-orange-500 hover:scale-110 transition-all hidden md:flex" />
                        </Carousel>
                    </div>
                </div>

                {/* Testimonial Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-3/4 md:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                                {selectedTestimonial?.name}&apos;s Testimonial
                            </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                            <div className="space-y-6 mt-4">
                                {selectedTestimonial && (
                                    <>
                                        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100">
                                            <Image
                                                src={selectedTestimonial.image}
                                                alt={selectedTestimonial.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Quote className="w-6 h-6 md:w-10 md:h-10 text-black fill-current" />
                                            <p className="text-gray-700 font-medium leading-relaxed text-sm md:text-lg">
                                                {selectedTestimonial.text}
                                            </p>
                                            <div className="text-right pt-4 border-t border-gray-200">
                                                <p className="font-bold text-gray-900 text-xl">
                                                    - {selectedTestimonial.name}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogContent>
                </Dialog>
            </section>

            {/* --- SECTION 6: FAQ --- */}
            <section className="relative z-10 py-24 bg-linear-to-b from-white via-orange-50 to-orange-100">
                <div className="container max-w-4xl mx-auto px-4 sm:px-6 relative">
                    {/* Decorative Mascots (Placeholders using archetype images) */}
                    <div className="hidden lg:block absolute top-0 -left-20 rotate-[-15deg] animate-pulse">
                        <Image
                            src="/images/archetypes/calm-dawn.png"
                            width={120}
                            height={120}
                            alt="Mascot Left"
                        />
                    </div>
                    <div className="hidden lg:block absolute top-0 -right-20 rotate-15 animate-bounce delay-700">
                        <Image
                            src="/images/archetypes/blazing-noon.png"
                            width={120}
                            height={120}
                            alt="Mascot Right"
                        />
                    </div>

                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                            FaQ (Frequently Asked Questions)
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {FAQS.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border border-gray-200 bg-white/80 backdrop-blur-sm rounded-2xl px-2 shadow-sm data-[state=open]:ring-2 data-[state=open]:ring-orange-200 transition-all"
                                >
                                    <AccordionTrigger className="text-gray-900 font-bold text-base md:text-lg hover:no-underline px-6 py-5 hover:text-orange-600 transition-colors">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-gray-600 px-6 pb-6 text-sm md:text-base leading-relaxed font-medium">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>

                    {/* FAQ Footer */}
                    <div className="mt-16 text-center space-y-4">
                        <h3 className="text-2xl font-bold text-gray-900">
                            More questions?
                        </h3>
                        <Button href="#">Our Help Center</Button>
                    </div>
                </div>
            </section>

            {/* --- SECTION 7: FOOTER --- */}
            <Footer />
        </div>
    );
}