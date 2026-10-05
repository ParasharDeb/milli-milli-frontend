import { LoginCardProvider } from "@/app/components/auth/login-card";
import { CartDrawerProvider } from "@/app/components/cart-drawer";
import { SiteNav } from "@/app/components/site-nav";
import { CartProvider } from "@/app/lib/cart-context";
import "./home.css";

/**
 * The landing page is a self-contained editorial piece with its own footer,
 * so it lives outside the (site) group — but it shares the same navbar.
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <LoginCardProvider>
      <CartProvider>
        <CartDrawerProvider>
          <SiteNav />
          <div className="mm">{children}</div>
        </CartDrawerProvider>
      </CartProvider>
    </LoginCardProvider>
  );
}
