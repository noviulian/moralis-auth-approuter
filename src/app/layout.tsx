import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import Provider from "../context/auth-context";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "@/context/wagmi";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    return (
        <html lang="en">
            <body className={inter.className}>
                <WagmiConfig config={wagmiConfig}>
                    <Provider session={session}>{children}</Provider>
                </WagmiConfig>
            </body>
        </html>
    );
}
