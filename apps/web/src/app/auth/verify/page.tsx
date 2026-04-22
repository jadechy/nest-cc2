"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp"

export default function VerifyPage() {
    const router = useRouter();
    const [otpCode, setOtpCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const email = sessionStorage.getItem("otp_email");

        const result = await signIn("credentials", {
            otp: otpCode,
            email,
            redirect: false,
        });
        setLoading(false);

        if (result?.error) {
            setError("Identifiants incorrects. Veuillez réessayer.");
            return;
        }
        router.push("/user");
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
                    <p className="text-sm text-muted-foreground">
                        Entrez le code reçu par email
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Code</Label>
                        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS}
                            value={otpCode}
                            onChange={(value) => setOtpCode(value)}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
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