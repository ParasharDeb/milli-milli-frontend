import { Footer } from "@/app/components/footer";
import { Nav } from "@/app/components/nav";
import { LoginCardProvider } from "@/app/components/auth/login-card";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <LoginCardProvider>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </LoginCardProvider>
  );
}
