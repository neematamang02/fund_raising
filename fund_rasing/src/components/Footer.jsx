// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import ROUTES from "@/routes/routes";

const Footer = () => {
  return (
    <>
      <footer className="bg-[#1E3A8A] text-white rounded-lg shadow-sm dark:bg-gray-900 m-4">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <Link
              to={ROUTES.HOME}
              className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
            >
              <img
                src="https://flowbite.com/docs/images/logo.svg"
                className="h-8"
                alt="Flowbite Logo"
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                Fund-Raiser
              </span>
            </Link>
            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium sm:mb-0 dark:text-gray-400">
              <li>
                <Link to="#" className="hover:underline me-4 md:me-6">
                  About
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:underline me-4 md:me-6">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:underline me-4 md:me-6">
                  Licensing
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.Donate_page}
                  className="hover:underline me-4 md:me-6"
                >
                  Donate
                </Link>
              </li>
            </ul>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <span className="block text-sm sm:text-center">
            © 2025{" "}
            <a href="https://flowbite.com/" className="hover:underline">
              fundraiser
            </a>
            . All Rights Reserved.
          </span>
        </div>
      </footer>
    </>
  );
};

export default Footer;
