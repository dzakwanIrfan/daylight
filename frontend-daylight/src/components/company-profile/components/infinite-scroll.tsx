import Image from "next/image";

const InfiniteScroll = () => {
    return (
        <div className="w-full overflow-hidden py-10">
            <div className="flex gap-20 animate-loop-scroll space-x-10 w-max hover:[animation-play-state:paused]">
                {/* Set 1 */}
                <div className="flex gap-20 space-x-10">
                    <Image
                        src="/images/landing-page/running-text/mata-karanjang.png"
                        alt="mata-karanjang"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/solo.png"
                        alt="solo"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/solo-pizza.png"
                        alt="solo-pizza"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/espressolo.png"
                        alt="espressolo"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/imnot.png"
                        alt="imnot"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/sosy.png"
                        alt="sosy"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/ssas.png"
                        alt="ssas"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/tirtalaya.png"
                        alt="tirtalaya"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                </div>

                {/* Set 2 (Duplicate) */}
                <div className="flex gap-20 space-x-10">
                    <Image
                        src="/images/landing-page/running-text/mata-karanjang.png"
                        alt="mata-karanjang"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/solo.png"
                        alt="solo"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/solo-pizza.png"
                        alt="solo-pizza"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/espressolo.png"
                        alt="espressolo"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/imnot.png"
                        alt="imnot"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/sosy.png"
                        alt="sosy"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/ssas.png"
                        alt="ssas"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                    <Image
                        src="/images/landing-page/running-text/tirtalaya.png"
                        alt="tirtalaya"
                        width={150}
                        height={50}
                        className="h-16 w-auto grayscale"
                    />
                </div>
            </div>
        </div>
    );
};

export default InfiniteScroll;