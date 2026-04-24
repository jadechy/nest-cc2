"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { apiPost } from "@/lib/api.client";
import { MailIcon, SaveIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { userSchema } from "@/types/users.schema";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const userFormSchema = userSchema
  .pick({
    username: true,
    email: true,
    password: true,
  })
  .extend({ confirmPassword: userSchema.shape.password })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type UserFormType = z.infer<typeof userFormSchema>;

export const UserForm = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [email, setEmail] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UserFormType>({
        resolver: zodResolver(userFormSchema),
    });

    const onSubmit = async (data: UserFormType) => {
        console.log();
        await apiPost(`/auth/register`, data);
        setEmail(data.email);
    };

    if (email) {
        return (
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MailIcon />
            </div>
            <p className="font-semibold">Vérifiez votre boîte mail</p>
            <p className="text-sm text-muted-foreground">
            Un email de confirmation a été envoyé à{" "}
            <span className="font-medium text-foreground">{email}</span>. Cliquez
            sur le lien pour activer votre compte.
            </p>
        </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
            <Label>Nom</Label>
            <Input {...register("username")} placeholder="John Doe" />
            {errors.username && (
            <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
        </div>

        <div className="space-y-2">
            <Label>Email</Label>
            <Input
            {...register("email")}
            type="email"
            placeholder="john@example.com"
            />
            {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
        </div>

        <div className="space-y-2">
            <Label>Mot de passe</Label>
            <Input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            />
            {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
        </div>

        <div className="space-y-2">
            <Label>Confirmation du mot de passe</Label>
            <Input
            {...register("confirmPassword")}
            type="password"
            placeholder="••••••••"
            />
            {errors.confirmPassword && (
            <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
            </p>
            )}
        </div>

        <Button type="submit" className="w-full">
            <SaveIcon /> S&apos;inscrire
        </Button>
        </form>
    );
}