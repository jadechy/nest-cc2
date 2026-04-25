import { apiGet } from "@/lib/api.server";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/auth/login");

  await apiGet(`/auth/verify-email?token=${token}`);
  redirect("/auth/login?verified=true");
}
