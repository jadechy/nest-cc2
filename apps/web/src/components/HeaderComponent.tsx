"use client";
import { signOut, useSession } from "next-auth/react";
import { Button, buttonVariants } from "./ui/button";
import Link from "next/link";
import { VariantProps } from "class-variance-authority";
import { ReactNode } from "react";
import { BicepsFlexed, Menu, User } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

const NavComponent = () => {
  const { data } = useSession();
  return (
    <>
        {/* <> */}
          {/* <LinkComponent label="Recherche" href="/exercises" /> */}

          {/* <LinkComponent label="Mes entrainements" href="/workouts" />
          <div className="flex gap-2">
            <div className="relative">
              <p
                className={`absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 text-center ${ids.length > 0 ? "opacity-100" : "opacity-0"} transition-all`}
              >
                {ids.length}
              </p>
              <LinkComponent
                label={<BicepsFlexed />}
                href="/workouts/draft"
                size="icon"
              />
            </div>
            <LinkComponent label={<User />} href="/profil" size="icon" />
          </div>
        </> */}

      <Button onClick={() => signOut({ callbackUrl: "/" })}>Déconnexion</Button>
    </>
  );
};

const navClassName = "gap-2 justify-end";

export const HeaderComponent = () => {
  const { data: session } = useSession();

  return (
    <header className="flex justify-between bg-gray-50/20 p-5 backdrop-blur-xl sticky top-0 z-20">
      <h1 className="font-bold">
        <Link href="/">Message</Link>
      </h1>
      <nav className={`${navClassName} flex`}>
        {session ? (
          <>
            <div className={`${navClassName} hidden sm:flex`}>
              <NavComponent />
            </div>
            <Drawer>
              <DrawerTrigger asChild>
                <Button className="block sm:hidden">
                  <Menu />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Menu</DrawerTitle>
                </DrawerHeader>
                <div
                  className={`${navClassName} flex-col flex items-center pb-4`}
                >
                  <NavComponent />
                </div>
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <>
            <Button variant="secondary" asChild>
              <Link href="/auth/register">Inscription</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">Connexion</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
};

const LinkComponent = ({
  label,
  href,
  ...props
}: { label: ReactNode; href: string } & VariantProps<
  typeof buttonVariants
>) => (
  <Button variant="link" {...props} asChild>
    <Link href={href}>{label}</Link>
  </Button>
);
