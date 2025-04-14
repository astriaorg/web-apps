"use client";

import { useState } from "react";
import { ClipboardIcon } from "../../../icons";

export const CopyToClipboardButton = ({
  textToCopy,
}: {
  textToCopy?: string;
}) => {
  const [copyStatus, setCopyStatus] = useState("");
  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus(""), 500);
  };

  if (!textToCopy) {
    return <></>;
  }

  return (
    <button
      type="button"
      key={textToCopy}
      onClick={() => copyToClipboard(textToCopy)}
      className="hover:text-white transition flex relative items-center justify-center w-5 h-5"
    >
      <div
        className={`mr-7 absolute transition text-xs whitespace-nowrap ${
          copyStatus ? "opacity-100" : "opacity-0"
        }`}
      >
        {copyStatus}
      </div>
      <span
        className={`absolute transition-opacity duration-300 ${
          copyStatus ? "opacity-0" : "opacity-100"
        }`}
      >
        <ClipboardIcon className="cursor-pointer" size={21} />
      </span>
    </button>
  );
};
