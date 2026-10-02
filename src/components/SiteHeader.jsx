import Link from "next/link";
import { Store, ShoppingCart, Package } from "./Icons";
import { SHOP_NAME, SHOP_TAGLINE } from "@/lib/shop-config";

const LINKS = [
  { key: "shop", href: "/", label: "Shop", Icon: ShoppingCart },
  { key: "items", href: "/items", label: "Items", Icon: Package },
];

export default function SiteHeader({ active }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/25">
          <Store className="h-5 w-5" />
        </span>
        <span className="leading-tight">
          <span className="block text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {SHOP_NAME}
          </span>
          <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
            {SHOP_TAGLINE}
          </span>
        </span>
      </Link>

      <nav className="flex items-center gap-1 self-start rounded-2xl border border-slate-200/80 bg-white/70 p-1 backdrop-blur sm:self-auto dark:border-white/10 dark:bg-white/5">
        {LINKS.map(({ key, href, label, Icon }) => {
          const isActive = active === key;
          return (
            <Link
              key={key}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
