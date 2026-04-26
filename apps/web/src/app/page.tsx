import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex-1 space-y-16">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Éhangez avec vos amis
          <br />
          <span className="text-primary">et le monde entier</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Une application simple pour communiquer avec vos amis
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button asChild>
            <Link href="/auth/login">Commencer</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Comptes de démonstration</h2>
          <p className="text-sm text-muted-foreground">
            Utilisez ces identifiants pour tester l&apos;application. Le mot de
            passe OTP est envoyé par email via Mailhog.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Credential
            label="Utilisateur"
            email="alice@example.com"
            password="Password123!"
          />

          <Credential
            label="Utilisateur"
            email="bob@example.com"
            password="Password123!"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          <a href="http://localhost:8025" target="_blank" className="underline">
            localhost:8025
          </a>
           pour récupérer le code OTP.
        </p>
      </div>
    </div>
  );
}

const Credential = ({
  label,
  email,
  password,
}: {
  label: string;
  email: string;
  password: string;
}) => (
  <div className="p-4 rounded-xl border bg-card space-y-2">
    <div className="flex justify-between items-center">
      <p className="font-medium">{label}</p>
    </div>
    <div className="space-y-1 font-mono text-sm">
      <p className="text-muted-foreground">
        <span className="text-foreground">Email :</span> {email}
      </p>
      <p className="text-muted-foreground">
        <span className="text-foreground">Mot de passe :</span> {password}
      </p>
    </div>
  </div>
);
