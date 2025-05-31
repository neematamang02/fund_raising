import { useState } from "react";
import { Link } from "react-router-dom";
import ToggleRole from "./ToggleRole";
import ROUTES from "@/routes/routes";

const navLinks = [
  { name: "Home", path: ROUTES.HOME },
  { name: "Donate", path: ROUTES.Donate_page },
  { name: "Create Campaign", path: ROUTES.Create_campaignpg },
  { name: "About us", path: ROUTES.About_page },
];

export default function Navigationbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-[#1E3A8A] text-white shadow-md sticky top-0 w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to={ROUTES.HOME} className="text-2xl font-bold">
              Fund-Raising
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map(({ name, path }) => (
              <Link key={path} to={path} className=" px-3 py-2 rounded-md">
                {name}
              </Link>
            ))}
            <ToggleRole />
            <Link
              to={ROUTES.Login_Page}
              className="px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#b06936]"
            >
              Login
            </Link>
            <Link
              to={ROUTES.Register_page}
              className="px-4 py-2 border border-indigo-600 rounded-lg bg-green-600 hover:bg-green-700"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {open ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white">
          {navLinks.map(({ name, path }) => (
            <Link
              key={path}
              to={path}
              className="block px-4 py-2 hover:bg-gray-100"
            >
              {name}
            </Link>
          ))}
          <ToggleRole mobile />
          <Link
            to={ROUTES.Login_Page}
            className="block px-4 py-2 hover:bg-gray-100"
          >
            Login
          </Link>
          <Link
            to={ROUTES.Register_page}
            className="block px-4 py-2 hover:bg-gray-100"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
