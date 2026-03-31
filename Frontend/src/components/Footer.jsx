import { Link } from "react-router-dom";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ROUTES from "@/routes/routes";

const QUICK_LINKS = [
  { name: "Home", href: ROUTES.HOME },
  { name: "About", href: ROUTES.ABOUT },
  { name: "Donate", href: ROUTES.DONATE },
  { name: "Login", href: ROUTES.LOGIN },
  { name: "Register", href: ROUTES.REGISTER },
];

const SUPPORT_LINKS = [
  { name: "My Donations", href: ROUTES.MY_DONATIONS },
  { name: "Apply Organizer", href: ROUTES.APPLY_ORGANIZER },
  { name: "Notifications", href: ROUTES.NOTIFICATIONS },
];

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-background/10 bg-foreground text-background/80">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <Link to={ROUTES.HOME} className="inline-flex items-center gap-2.5">
              <Heart className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold text-background">HopeOn</span>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-background/65">
              HopeOn empowers communities with transparent fundraising and clear
              impact tracking. Give with confidence and create meaningful
              change.
            </p>

            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-background/15 bg-background/10 transition-colors duration-200 hover:bg-background/20"
                >
                  <social.icon className="h-4 w-4 text-background/70" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-background">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/65 transition-colors duration-200 hover:text-background"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-background">Support</h3>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/65 transition-colors duration-200 hover:text-background"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-base font-semibold text-background">Get In Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-background/65">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@hopeon.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/65">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/65">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Impact Street, Change City</span>
              </div>
            </div>

            <div className="rounded-xl border border-background/10 bg-background/8 p-4">
              <h4 className="mb-2 text-sm font-semibold text-background">
                Stay Updated
              </h4>
              <p className="mb-3 text-sm text-background/65">
                Get the latest impact stories and updates.
              </p>
              <div className="space-y-2.5">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-background/20 bg-transparent px-3 py-2 text-sm text-background placeholder:text-background/40"
                  aria-label="Email address"
                />
                <Button
                  type="button"
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm text-background/55 sm:flex-row sm:px-6">
          <div>
            © 2025{" "}
            <Link
              to={ROUTES.HOME}
              className="font-medium text-background transition-colors hover:text-primary"
            >
              HopeOn
            </Link>
            . All Rights Reserved.
          </div>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 text-background/55 transition-colors hover:text-background"
          >
            <ArrowUp className="h-4 w-4" />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
