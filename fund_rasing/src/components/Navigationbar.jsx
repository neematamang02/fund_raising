// src/components/Navigationbar.jsx

const Navigationbar = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50 bg-black">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-blue-600">
          FundBoost
        </a>
        <nav className="space-x-4">
          <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">
            Home
          </a>
          <a
            href="/donate"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Donate
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navigationbar;
