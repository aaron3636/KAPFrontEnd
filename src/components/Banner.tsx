import React, { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import LogoutButton from "./LogoutButton";

interface BannerProps {
  children: ReactNode;
}

const Banner: React.FC<BannerProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <header className="bg-gradient-to-r from-blue-500 to-sky-800 mb-5">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            className="text-white text-xl focus:outline-none hover:text-blue-400"
            onClick={handleGoBack}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <Link to="/" className="text-white">
            <FontAwesomeIcon
              icon={faHome}
              className="text-2xl hover:text-blue-400"
            />
          </Link>
        </div>
        <h1 className="text-white text-3xl font-bold">{children}</h1>
        <div></div>
      </div>
    </header>
  );
};

export default Banner;
