import NextAuth, { Session, SessionStrategy, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Moralis from "moralis";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "MoralisAuth",
            credentials: {
                message: {
                    label: "Message",
                    type: "text",
                    placeholder: "0x0",
                },
                signature: {
                    label: "Signature",
                    type: "text",
                    placeholder: "0x0",
                },
            },
            // @ts-ignore
            async authorize(credentials) {
                if (!credentials) return null;
                try {
                    const { message, signature } = credentials;

                    if (!Moralis.Core.isStarted) {
                        await Moralis.start({
                            apiKey: process.env.MORALIS_API_KEY,
                        });
                    }

                    const results = await Moralis.Auth.verify({
                        message,
                        signature,
                        network: "evm",
                    });
                    console.log("results", results.raw);
                    const { address, profileId, id, expirationTime } =
                        results.raw;

                    const user = {
                        id,
                        address,
                        profileId,
                        signature,
                        expirationTime,
                    };

                    return user;
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            user && (token.user = user);
            return token;
        },
        async session({ session, token }) {
            session.expires = token.user.expirationTime;
            session.user = token.user;
            return session;
        },
    },
    session: { strategy: "jwt" as SessionStrategy },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
