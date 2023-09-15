import Moralis from "moralis";
import { NextResponse } from "next/server";
const config = {
    domain: process.env.APP_DOMAIN as string,
    statement: "Please sign this message to confirm your identity.",
    uri: process.env.NEXTAUTH_URL as string,
    timeout: 60,
};

export async function POST(request: Request) {
    const { address, chain } = await request.json();

    if (!address || !chain) {
        return new Response("Invalid address or chain", { status: 500 });
    }

    if (!Moralis.Core.isStarted) {
        await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
    }

    try {
        const response = await Moralis.Auth.requestMessage({
            address,
            chain,
            networkType: "evm",
            ...config,
        });

        const message = response.raw.message;

        return NextResponse.json(message);
    } catch (error: any) {
        return new Response(error.message, { status: 500 });
    }
}
