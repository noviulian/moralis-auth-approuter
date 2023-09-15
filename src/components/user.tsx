"use client";

import { ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";
import { signIn, signOut, useSession } from "next-auth/react";

export default function User() {
    const { data: session } = useSession();
    const connectToMetamask = async (): Promise<{
        signer: ethers.providers.JsonRpcSigner;
        chain: string;
        account: string;
    }> => {
        if (!window.ethereum) {
            alert("Please install MetaMask first.");
            throw new Error("MetaMask not installed");
        }
        const provider = new ethers.providers.Web3Provider(
            window.ethereum,
            "any"
        );

        const [accounts, chainId] = await Promise.all([
            provider.send("eth_requestAccounts", []),
            provider.send("eth_chainId", []),
        ]);

        const signer = provider.getSigner();
        return { signer, chain: chainId, account: accounts[0] };
    };

    async function authenticate() {
        const { signer, chain, account } = await connectToMetamask();

        if (!account) {
            throw new Error("No account found");
        }
        if (!chain) {
            throw new Error("No chain found");
        }

        const userData = {
            address: account,
            chain: chain,
        };
        const message = await fetch("/api/message", {
            method: "POST",
            body: JSON.stringify(userData),
        }).then((res) => res.json());

        console.log("message", message);

        const signature = await signer.signMessage(message);

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
                    <button onClick={() => signOut()}>signout</button>
                </>
            ) : (
                <button onClick={authenticate}>
                    authenticate with metamask
                </button>
            )}
        </>
    );
}
