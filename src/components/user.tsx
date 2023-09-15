"use client";

import { signIn, signOut, useSession } from "next-auth/react";

import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

export default function User() {
    const { data: session } = useSession();
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const { isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

    async function authenticate() {
        if (isConnected) {
            await disconnectAsync();
        }

        const { account, chain } = await connectAsync({
            connector: new MetaMaskConnector(),
        });
        if (!account) {
            throw new Error("No account found");
        }
        if (!chain) {
            throw new Error("No chain found");
        }

        const userData = { address: account, chain: chain.id };

        const message = await fetch("/api/message", {
            method: "POST",
            body: JSON.stringify(userData),
        }).then((res) => res.json());

        console.log("message", message);

        const signature = await signMessageAsync({ message });

        const data = await signIn("credentials", {
            message,
            signature,
            redirect: false,
            callbackUrl: "/",
        });

        console.log("data", data);
    }
    return (
        <>
            {session ? (
                <>
                    <h4>User session:</h4>
                    <pre>{JSON.stringify(session, null, 4)}</pre>
                    <button onClick={() => signOut()}>Log out</button>
                </>
            ) : (
                <button onClick={authenticate}>
                    Authenticate with Metamask 🦊
                </button>
            )}
        </>
    );
}
