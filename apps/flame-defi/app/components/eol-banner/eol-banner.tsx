"use client";

import { useConfig } from "config";

/**
 * EOL Banner component to notify users about Flame's end of life.
 */
export const EolBanner = () => {
  const { feedbackFormURL } = useConfig();

  return (
    <div className="w-full bg-red-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left">
        <div className="flex-1">
          <span className="font-semibold">⚠️ Important Notice:</span> Flame is
          ending support and shutting down by{" "}
          <strong>September 30, 2025</strong>. You can still deposit TIA for
          gas, withdraw all assets, close LP positions, and swap tokens.
          However, you can no longer create new LP positions or add liquidity.
        </div>
        {feedbackFormURL && (
          <a
            href={feedbackFormURL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-4 py-2 bg-white text-red-600 font-medium rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Share Feedback
          </a>
        )}
      </div>
    </div>
  );
};
