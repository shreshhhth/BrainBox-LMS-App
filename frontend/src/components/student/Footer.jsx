import React from "react";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <footer className="bg-black md:px-36 text-left w-full mt-10">
      <div className="flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-20 py-10 border-b border-white/30">
        <div className="flex flex-col md:items-start items-center w-full">
          <img className="w-40 h-20" src={assets.logo_dark} alt="" />
          <p className="mt-6 text-center md:text-left text-sm  text-white/80">
            BrainBox - Your Gateway to Knowledge Empowering students with a wide
            range of curated courses, designed to enhance learning and skill
            development. Unlock your potential with BrainBox today.
          </p>
        </div>
        <div className="flex flex-col md:items-start items-center w-full mt-5">
          <h2 className="font-semibold text-white mb-5">Company</h2>
          <ul className="flex md:flex-col w-full justify-between text-sm  text-white/80 md:space-y-2">
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
          </ul>
        </div>
        <div className="hidden md:flex flex-col items-start w-full mt-5">
          <h2 className="font-semibold text-white mb-5">
            Subscribe to our newsletter
          </h2>
          <p className=" text-sm  text-white/80">
            Subscribe to our newsletter for expert insights, free resources, and
            the latest news on BrainBox
          </p>
          <div className="flex items-center gap-2 pt-4">
            <input
              className="border border-gray-500/30 bg-gray-800 text-gray-500 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm"
              type="email"
              placeholder="Enter your email!"
            />
            <button className="bg-blue-600 w-24 h-9 text-white rounded">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm text-white/80">
        &copy; 2025 BrainBox. All rights reserved. | Designed with care by
        Shreshth{" "}
      </p>
    </footer>
  );
};

export default Footer;
