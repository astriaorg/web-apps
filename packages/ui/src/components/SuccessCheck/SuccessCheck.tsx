import React from "react";

export function SuccessCheck() {
  return (
    <div className="w-[100px] my-[50px] mx-auto">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="inline-block align-top h-[100px] w-[100px] opacity-100 overflow-visible"
      >
        <g strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
          {/* Outline Circle */}
          <circle
            cx="12"
            cy="12"
            r="11.5"
            className="fill-none [stroke-width:1px] stroke-[#F09727] [stroke-dasharray:72px,72px] [stroke-dashoffset:72px] animate-success-circle-outline opacity-0"
          />
          {/* Filled Circle */}
          <circle
            cx="12"
            cy="12"
            r="11.5"
            className="fill-[#F09727] stroke-none opacity-0 animate-success-circle-fill"
          />
          {/* Tick Mark */}
          <polyline
            points="17,8.5 9.5,15.5 7,13"
            className="fill-none stroke-white [stroke-width:1px] [stroke-dasharray:15px,15px] [stroke-dashoffset:-14px] animate-success-tick opacity-0"
          />
        </g>
      </svg>
    </div>
  );
}
