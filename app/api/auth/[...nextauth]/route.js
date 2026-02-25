import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { sendEmail } from "../../../../lib/mailer";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {},

            async authorize(credentials) {
                const { email, password } = credentials;

                try {
                    await connectDB();
                    const user = await User.findOne({ email });

                    if (!user) {
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (!passwordsMatch) {
                        return null;
                    }

                    return user;
                } catch (error) {
                    console.log("Error: ", error);
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                await connectDB();
                const existingUser = await User.findOne({ email: user.email });

                if (account?.provider === "google") {
                    if (!existingUser) {
                        const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
                        const newUser = await User.create({
                            name: user.name,
                            email: user.email,
                            password: hashedPassword,
                        });
                        user.role = newUser.role;
                        user._id = newUser._id;

                        await sendEmail({
                            to: user.email,
                            subject: "Welcome to Symphony Fashion!",
                            html: `<h2>Welcome, ${user.name}! 🎉</h2><p>Thank you for successfully creating your Symphony Fashion account via Google. We are thrilled to have you here and can't wait for you to explore our latest collections.</p><p>Happy shopping!</p>`,
                        });
                    } else {
                        user.role = existingUser.role;
                        user._id = existingUser._id;
                    }
                    return true;
                }

                if (account?.provider === "credentials") {
                    return true;
                }

                return true;
            } catch (error) {
                console.log("Sign In Callback Error: ", error);
                return false;
            }
        },
        async jwt({ token, user }) {
            if (user) {
                await connectDB();
                const dbUser = await User.findOne({ email: user.email });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser._id; // Store mongo ID
                } else {
                    token.role = user.role;
                    token.id = user._id;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                await connectDB();
                const dbUser = await User.findOne({ email: session.user.email });
                if (dbUser) {
                    session.user.role = dbUser.role;
                    session.user.id = dbUser._id;
                } else {
                    session.user.role = token.role || "user";
                    session.user.id = token.id;
                }
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
