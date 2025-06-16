import React from "react";
import { assets, dummyTestimonial } from "../../assets/assets";

const TestimonialSection = () => {
  return (
    <div className="pb-14 px-8 md:px-0">
      <h2 className="text-3xl font-medium text-gray-800">Testimonials</h2>
      <p className="md:text-base text-gray-500 mt-3">
        Hear from students, educators, and professionals who have transformed
        their skills, knowledge, and careers with our platform. <br />
        Your success is our greatest achievement.
      </p>
      <div
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
        className="grid gap-3 mt-14 "
      >
        {dummyTestimonial.map((testimonial, index) => {
          return (
            <div
              key={index}
              className="text-sm text-left border border-gray-500/30 pb-6 rounded-lg bg-white shadow-black/5 shadow-[0px_4px1-15px_0px] overflow-hidden "
            >
              <div className="flex items-center gap-6 px-4 py-4 bg-gray-500/10">
                <img
                  className="h-12 w-12 rounded-full"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div>
                  <h1 className="text-lg font-medium text-gray-800">
                    {testimonial.name}
                  </h1>
                  <p className="text-gray-800/80">{testimonial.role}</p>
                </div>
              </div>
              <div className="p-5 pb-7">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => {
                    return (
                      <img
                        className="h-5"
                        key={i}
                        src={
                          i < Math.floor(testimonial.rating)
                            ? assets.star
                            : assets.star_blank
                        }
                        alt="Star"
                      />
                    );
                  })}
                </div>
                <p className="text-gray-500 mt-5">{testimonial.feedback}</p>
              </div>
              <a href="#" className="text-blue-500 underline px-5">
                Read more
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestimonialSection;
