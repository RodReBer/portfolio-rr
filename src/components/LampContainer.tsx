"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-[35vh] md:min-h-[70vh] flex-col items-center justify-center bg-transparent w-full z-0 overflow-hidden",
        className,
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-100 md:scale-y-125 items-center justify-center isolate z-0">
        {/* Left conic gradient */}
        <motion.div
          initial={{ opacity: 0.5, width: "50%" }}
          whileInView={{ opacity: 1, width: "50%" }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-28 md:h-56 w-[50%] md:w-[30rem] bg-gradient-conic from-cyan-500 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute w-[100%] left-0 bg-slate-950 h-16 md:h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-8 md:w-40 h-[100%] left-0 bg-slate-950 bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        {/* Right conic gradient */}
        <motion.div
          initial={{ opacity: 0.5, width: "50%" }}
          whileInView={{ opacity: 1, width: "50%" }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-28 md:h-56 w-[50%] md:w-[30rem] bg-gradient-conic from-transparent via-transparent to-cyan-500 text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute w-8 md:w-40 h-[100%] right-0 bg-slate-950 bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-slate-950 h-16 md:h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        {/* Blur overlay at bottom */}
        <div className="absolute top-1/2 h-24 md:h-48 w-full translate-y-6 md:translate-y-12 scale-x-150 bg-slate-950 blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-24 md:h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        {/* Center glow - full width on mobile */}
        <div className="absolute inset-auto z-50 h-20 md:h-36 w-[90%] md:w-[28rem] -translate-y-1/4 md:-translate-y-1/2 rounded-full bg-cyan-500 opacity-40 blur-3xl"></div>
        {/* Inner glow */}
        <motion.div
          initial={{ width: "40%" }}
          whileInView={{ width: "50%" }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-16 md:h-36 w-[50%] md:w-64 -translate-y-[2.5rem] md:-translate-y-[6rem] rounded-full bg-cyan-400 blur-2xl"
        ></motion.div>
        {/* Cyan line */}
        <motion.div
          initial={{ width: "60%" }}
          whileInView={{ width: "80%" }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-[80%] md:w-[30rem] -translate-y-[3rem] md:-translate-y-[7rem] bg-cyan-400"
        ></motion.div>

        {/* Top cover */}
        <div className="absolute inset-auto z-40 h-20 md:h-44 w-full -translate-y-[5rem] md:-translate-y-[12.5rem] bg-slate-950"></div>
      </div>

      <div className="relative z-50 flex -translate-y-16 md:-translate-y-80 flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
};
