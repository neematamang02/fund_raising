// src/pages/About.jsx

import React from "react";

const About = () => {
  return (
    <div className="pt-20 pb-16 px-4 max-w-6xl mx-auto text-gray-800">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-700">About FundApp</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Empowering people to give with purpose. FundApp connects donors and
          organizers to make meaningful change in communities through
          transparent, impactful campaigns.
        </p>
      </div>

      {/* Mission Section */}
      <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
        <div>
          <img
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Helping hands"
            className="rounded-lg shadow-md"
          />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 text-lg">
            At FundApp, our mission is to create a trusted platform where anyone
            can support causes they care about. From clean water projects to
            education initiatives, we help bring people together to fund
            life-changing campaigns across the globe.
          </p>
        </div>
      </div>

      {/* Vision Section */}
      <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
        <div className="md:order-2">
          <img
            src="https://images.unsplash.com/photo-1727553957790-3f8f7a0f5614?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Education support"
            className="rounded-lg shadow-md"
          />
        </div>
        <div className="md:order-1">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            Our Vision
          </h2>
          <p className="text-gray-700 text-lg">
            We envision a world where no meaningful cause goes unfunded. By
            giving both donors and campaign organizers a simple and transparent
            experience, we aim to become the go-to fundraising platform for
            community-led transformation.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-blue-600 mb-6">
          Our Core Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Transparency",
              desc: "We ensure clarity in how funds are collected and distributed.",
              img: "https://plus.unsplash.com/premium_photo-1666820202651-314501c88358?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            },
            {
              title: "Compassion",
              desc: "We believe in empathy-driven action that prioritizes people over profits.",
              img: "https://images.unsplash.com/photo-1518398046578-8cca57782e17?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            },
            {
              title: "Empowerment",
              desc: "We provide tools that enable anyone to become a force for good.",
              img: "https://images.unsplash.com/photo-1592530392525-9d8469678dac?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold text-blue-700 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default About;
