// src/pages/Home.jsx
import React from "react";
import HeroSection from "@/components/HeroSection";
import CampaignCard from "@/components/CampaignCard";

// Example campaign data (replace with dynamic data as needed)
import ABC1 from "@/assets/images/abc.jpeg";
import ABC2 from "@/assets/images/abc.jpeg";

const campaigns = [
  {
    id: 1,
    title: "Clean Water for All",
    imageSrc: ABC1,
    target: 5000,
    raised: 3200,
  },
  {
    id: 2,
    title: "Education for Children",
    imageSrc: ABC2,
    target: 8000,
    raised: 4500,
  },
  // …add more campaigns here…
];

export default function Home() {
  return (
    <>
      <HeroSection />

      {/* Campaign Listings */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">
          Ongoing Campaigns
        </h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              title={campaign.title}
              imageSrc={campaign.imageSrc}
              target={campaign.target}
              raised={campaign.raised}
            />
          ))}
        </div>
      </div>
    </>
  );
}
