import { cn } from "@/lib/utils";

export interface ButtonProps {
    children: React.ReactNode;
    href: string;
    padding?: string;
    fontSize?: string;
    className?: string;
    onClick?: () => void;
}

export const Button = ({
    children,
    href,
    padding,
    fontSize,
    className,
    onClick,
}: ButtonProps) => {
    return (
        <a
            href={href}
            onClick={onClick}
            className={cn(
                "inline-flex items-center justify-center text-black rounded-full outline-2 outline-white font-bold bg-radial-[at_50%_50%] from-yellow-glow from-40% to-brand to-90% shadow shadow-black",
                padding ? padding : "px-6 py-3",
                fontSize ? fontSize : "text",
                className
            )}
        >
            {children}
        </a>
    );
};