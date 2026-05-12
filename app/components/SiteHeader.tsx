import Image from "next/image";
import Link from "next/link";

type NavLink = {
  href: string;
  label: string;
};

type SiteHeaderProps = {
  links: NavLink[];
};

export function SiteHeader({ links }: SiteHeaderProps) {
  return (
    <nav className="nav">
      <Link href="/" className="logo">
        <Image className="logo-icon" src="/nicheforge-icon.jpg" alt="NicheForge AI icon" width={96} height={96} priority />
        <span>NicheForge AI</span>
      </Link>
      <div className="nav-links">
        {links.map((link) => (
          <Link href={link.href} key={`${link.href}-${link.label}`}>{link.label}</Link>
        ))}
      </div>
    </nav>
  );
}
