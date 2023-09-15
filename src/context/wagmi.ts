"use client";
import { configureChains, createConfig, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { publicClient, webSocketPublicClient } = configureChains(
    [mainnet],
    [publicProvider()]
);

export const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
});
