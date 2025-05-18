// src/pages/Home.jsx
import React from "react";
import ABC1 from "@/assets/images/abc.jpeg";
import ABC2 from "@/assets/images/abc.jpeg";
const campaigns = [
  {
    id: 1,
    title: "Clean Water for All",
    image: ABC1,
    target: 5000,

    raised: 3200,
  },
  {
    id: 2,
    title: "Education for Children",
    image: ABC2,
    target: 8000,
    raised: 4500,
  },
];

const Home = () => {
  return (
    <>
      <div className="w-full bg-blue-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join Us in Making a Difference
            </h1>
            <p className="text-lg mb-6">
              Support impactful campaigns and help communities thrive. Your
              contribution matters.
            </p>
            <a
              href="/donate"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded shadow hover:bg-gray-100"
            >
              Start Donating
            </a>
          </div>
          <div className="text-center">
            <img
              src="https://media.licdn.com/dms/image/v2/D4E12AQGNN73pZXQnww/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1695241576788?e=2147483647&v=beta&t=ux4pkyf_ajwxwnapUrBzuJOCPN-MORfp10I308eUOL4"
              alt="Fundraising Hero"
              className="rounded w-full max-h-80 object-cover mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Campaign Listings */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">
          Ongoing Campaigns
        </h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const percent = Math.min(
              100,
              Math.round((campaign.raised / campaign.target) * 100)
            );
            return (
              <div
                key={campaign.id}
                className="bg-white shadow-md rounded overflow-hidden flex flex-col"
              >
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold text-lg mb-2">
                    {campaign.title}
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Raised: ${campaign.raised.toLocaleString()} of $
                    {campaign.target.toLocaleString()}
                  </p>
                  <a
                    href="/donate"
                    className="mt-auto inline-block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Donate
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Home;
