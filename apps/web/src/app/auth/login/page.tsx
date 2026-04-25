"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await apiPost("/auth/login", { email, password });
            sessionStorage.setItem("otp_email", email);
            router.push("/auth/verify");
        } catch {
            setError("Identifiants incorrects.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
                    <p className="text-sm text-muted-foreground">
                        Entrez vos identifiants pour continuer
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Mot de passe</Label>
                            <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                Mot de passe oublié ?
                            </span>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Connexion..." : "Se connecter"}
                    </Button>
                </form>
            </div>
        </div>
    );
}