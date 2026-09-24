import { Footer } from "@/app/components/footer";
import { Nav } from "@/app/components/nav";
import { LoginCardProvider } from "@/app/components/auth/login-card";
import { CartDrawerProvider } from "@/app/components/cart-drawer";
import { CartProvider } from "@/app/lib/cart-context";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <LoginCardProvider>
      {/* The order is shared by the nav badge, the menu page and the chat, so it
          lives above all of them. */}
      <CartProvider>
        <CartDrawerProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartDrawerProvider>
      </CartProvider>
    </LoginCardProvider>
  );
}
