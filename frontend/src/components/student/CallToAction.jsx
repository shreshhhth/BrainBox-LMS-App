import React from 'react'
import { assets } from '../../assets/assets'

const CallToAction = () => {
  return (
    <div className='flex flex-col items-center gap-4 pt-10 pb-24 px-8 md:px-0'>
      <h2 className="text-3xl font-medium text-gray-800">Learn anything, anytime, anywhere</h2>
      <p className="md:text-base text-gray-500 mt-3">Unlock limitless learning with BrainBox. Access a vast library of courses anytime, anywhere, <br /> and master new skills at your own pace.</p>
      <div className='flex items-center font-medium gap-6 mt-4'>
        <button className='px-10 py-3 rounded-md text-white bg-blue-600'>Get Started</button>
        <button className='flex items-center gap-2'>Learn More <img src={assets.arrow_icon} alt="arrow_icon" /></button>
      </div>
    </div>
  )
}

export default CallToAction