import React from "react";
import { assets } from "../../assets/assets";
import SearchBar from "./SearchBar";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full md:pt-18 pt-8 px-7 md:px-0 space-y-4 text-center bg-gradient-to-b from-cyan-100/70">
      <h1 className="md:text-[clamp(36px,3vw+1rem,44px)] text-[clamp(26px,2vw+1rem,36px)] relative font-bold text-gray-800 max-w-3xl mx-auto">
        Welcome to BrainBox — Your Smart Companion
        <span className="text-blue-600"> for Seamless Learning!</span>
        <img
          className="md:block hidden absolute -bottom-7 right-0"
          src={assets.sketch}
          alt="sketch"
        />
      </h1>
      <p className="md:block hidden text-gray-500 max-w-2xl mx-auto">
        BrainBox is a modern Learning Management System built with the MERN
        stack, designed to simplify education for students and educators alike.
        From intuitive course management to real-time progress tracking,
        BrainBox empowers smarter learning anytime, anywhere.
      </p>
      <p className="md:hidden text-gray-500 max-w-sm mx-auto">
        BrainBox is a modern Learning Management System built with the MERN
        stack, designed to simplify education for students and educators alike.
      </p>
      <SearchBar />
    </div>
  );
};

export default Hero;
