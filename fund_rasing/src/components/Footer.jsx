import { Link } from "react-router-dom";
import ROUTES from "@/routes/routes";
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

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div
        className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`}
      ></div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
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
            <p className="text-blue-200 leading-relaxed max-w-sm">
              Empowering communities worldwide through transparent, impactful
              fundraising. Together, we create lasting change one donation at a
              time.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
                >
                  <social.icon className="h-5 w-5 text-blue-200 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4 relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "About Us", href: ROUTES.ABOUT },
                { name: "How It Works", href: "#" },
                { name: "Success Stories", href: "#" },
                { name: "Impact Reports", href: "#" },
                { name: "Volunteer", href: "#" },
              ].map((link, index) => (
                <li key={index}>
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

          {/* Support */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4 relative">
              Support
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Help Center", href: "#" },
                { name: "Privacy Policy", href: "#" },
                { name: "Terms of Service", href: "#" },
                { name: "Cookie Policy", href: "#" },
                { name: "Contact Us", href: "#" },
              ].map((link, index) => (
                <li key={index}>
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

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4 relative">
              Get In Touch
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            </h3>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-blue-200">
                <Mail className="h-5 w-5 text-amber-400" />
                <span>support@fundraising.com</span>
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

            {/* Newsletter Signup */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="font-semibold text-white mb-3">Stay Updated</h4>
              <p className="text-blue-200 text-sm mb-4">
                Get the latest impact stories and campaign updates.
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

        {/* Call to Action Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-amber-400/20">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">
              Ready to Make a Difference?
            </h3>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Join our community of changemakers and start creating positive
              impact today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={ROUTES.DONATE || "/donate"}>
                <FundraisingButton variant="donate" size="lg">
                  <Heart className="h-5 w-5" />
                  Start Donating
                </FundraisingButton>
              </Link>
              <Link to="/campaign/new">
                <FundraisingButton
                  variant="outline-trust"
                  className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-600"
                >
                  Create Campaign
                </FundraisingButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-blue-200 text-sm">
              © 2025{" "}
              <Link
                to={ROUTES.HOME}
                className="text-white hover:text-amber-400 transition-colors font-medium"
              >
                Fund-Raising Platform
              </Link>
              . All Rights Reserved. Made with ❤️ for positive change.
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 text-blue-200 hover:text-white transition-colors group"
            >
              <span className="text-sm">Back to top</span>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                <ArrowUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button - Fixed Position */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </footer>
  );
};

export default Footer;
