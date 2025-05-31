// src/components/CampaignCard.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import ROUTES from "@/routes/routes";
import PropTypes from "prop-types";

export default function CampaignCard({ title, imageSrc, target, raised }) {
  // Compute percentage only once per render
  const percent = useMemo(() => {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((raised / target) * 100));
  }, [target, raised]);

  return (
    <div className="bg-white shadow-md rounded overflow-hidden flex flex-col">
      <img src={imageSrc} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Raised: ${raised.toLocaleString()} of ${target.toLocaleString()}
        </p>
        <Link
          to={ROUTES.Donate_page}
          className="mt-auto inline-block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Donate
        </Link>
      </div>
    </div>
  );
}

CampaignCard.propTypes = {
  title: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  target: PropTypes.number.isRequired,
  raised: PropTypes.number.isRequired,
};
