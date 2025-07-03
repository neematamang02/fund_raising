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
import { FundraisingButton } from "./ui/fundraising-button";
import ROUTES from "@/routes/routes";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* 1) Brand & Description */}
          <div className="space-y-6">
            <Link
              to={ROUTES.HOME}
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <Heart className="h-10 w-10 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Fundzy
              </span>
            </Link>
            <p className="text-blue-200 leading-relaxed">
              Fundzy empowers communities by making fundraising transparent,
              impactful, and accessible. Join us in creating lasting change, one
              donation at a time.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label="social-link"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
                >
                  <social.icon className="h-5 w-5 text-blue-200 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* 2) Quick Links */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Home", href: ROUTES.HOME },
                { name: "About Us", href: ROUTES.ABOUT },
                { name: "How It Works", href: "/how-it-works" },
                { name: "Success Stories", href: "/success" },
                { name: "Impact Reports", href: "/reports" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.href}
                    className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-amber-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3) Support */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 relative">
              Support
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Help Center", href: "/help" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Contact Us", href: "/contact" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.href}
                    className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-amber-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4) Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4 relative">
              Get In Touch
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-blue-200">
                <Mail className="h-5 w-5 text-amber-400" />
                <span>support@fundzy.com</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <Phone className="h-5 w-5 text-amber-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <MapPin className="h-5 w-5 text-amber-400" />
                <span>123 Impact Street, Change City</span>
              </div>
            </div>
            {/* Subscribe */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="font-semibold text-white mb-3">Stay Updated</h4>
              <p className="text-blue-200 text-sm mb-4">
                Get the latest impact stories and updates.
              </p>
              <div className="flex flex-col space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
                <FundraisingButton variant="warm" size="sm" fullWidth>
                  Subscribe
                </FundraisingButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-blue-200 text-sm">
            © 2025{" "}
            <Link
              to={ROUTES.HOME}
              className="text-white hover:text-amber-400 transition-colors font-medium"
            >
              Fundzy
            </Link>
            . All Rights Reserved.
          </div>
          <div className="text-blue-200 text-sm">
            Created by{" "}
            <span className="text-white font-semibold">Nipeshtamang</span>
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1 text-sm text-blue-200 hover:text-white transition-colors group"
          >
            <ArrowUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
