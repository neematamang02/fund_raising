// src/components/HeroSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import ROUTES from "@/routes/routes";

export default function HeroSection() {
  return (
    <div className="w-full bg-gradient-to-br from-blue-500 via-sky-400 to-blue-300 text-white py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        {/* Left: Headline + Stats + CTA */}
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Empower Change. <br /> Fund Dreams.
          </h1>
          <p className="text-lg text-white/90 max-w-md">
            Help communities gain access to clean water, quality education, and
            healthcare. Your small act of giving can change someone's entire
            world.
          </p>

          {/* Quick Stats */}
          <div className="flex gap-6 text-white/90 text-sm">
            <div className="border-l-4 border-white pl-4">
              <p className="text-xl font-bold">120+</p>
              <span>Campaigns Funded</span>
            </div>
            <div className="border-l-4 border-white pl-4">
              <p className="text-xl font-bold">2.5K+</p>
              <span>Donors Contributed</span>
            </div>
            <div className="border-l-4 border-white pl-4">
              <p className="text-xl font-bold">$210K+</p>
              <span>Raised So Far</span>
            </div>
          </div>

          {/* CTA */}
          <Link
            to={ROUTES.Donate_page}
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-medium text-lg shadow hover:bg-gray-100 transition-transform duration-200 hover:scale-105"
          >
            Start Donating
          </Link>
        </div>

        {/* Right: Hero Image */}
        <div className="text-center">
          <img
            src="https://images.unsplash.com/photo-1574607383476-f517f260d30b?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.1.0"
            alt="Fundraising Hero"
            className="rounded-xl shadow-lg w-full max-h-[500px] object-cover"
          />
        </div>
      </div>
    </div>
  );
}
