"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res.error) {
                setError("Invalid email or password");
                return;
            }

            router.replace("/");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="page">
            <Navbar cartCount={0} />
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
                <div style={{ background: '#0b1020', border: '1px solid rgba(51,65,85,0.6)', padding: '2.5rem', borderRadius: '18px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 40px rgba(15,23,42,0.8)' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h1>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Email Address</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="john@example.com"
                                style={{ padding: '0.9rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.3)', color: 'white' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Password</label>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                placeholder="Enter your password"
                                style={{ padding: '0.9rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.3)', color: 'white' }}
                            />
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '1rem', marginTop: '0.5rem', width: '100%' }}>
                            Login
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0 1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(148,163,184,0.3)' }}></div>
                        <span style={{ padding: '0 1rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(148,163,184,0.3)' }}></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                            padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.4)',
                            background: 'rgba(15,23,42,0.6)',
                            color: '#e5e7eb', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500
                        }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#9ca3af' }}>
                        Don't have an account?{" "}
                        <Link href="/register" style={{ color: '#f97316', textDecoration: 'underline' }}>
                            Register here
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
