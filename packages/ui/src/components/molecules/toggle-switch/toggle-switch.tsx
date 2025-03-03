interface ToggleSwitchProps {
  toggleOptions: string[];
  className?: string;
  selectedOption: string;
  setSelectedOption: (option: string) => void;
}

export function ToggleSwitch({
  toggleOptions,
  className,
  selectedOption,
  setSelectedOption,
}: ToggleSwitchProps) {
  return (
    <div
      className={`w-full h-full flex relative rounded-[50px] bg-black overflow-hidden border border-solid border-border text-base ${className}`}
    >
      <div
        className="absolute inset-0 transition-transform duration-300 ease-in-out bg-grey-dark rounded-[50px] m-1"
        style={{
          transform: `translateX(calc(${toggleOptions.indexOf(selectedOption || "") * 100}% - ${toggleOptions.indexOf(selectedOption || "") * 8}px))`,
          width: `${100 / toggleOptions.length}%`,
        }}
      />
      {toggleOptions.map((option, i) => (
        <div
          key={i}
          onClick={() => setSelectedOption(option)}
          className={`
              flex items-center justify-center
              flex-1 py-2 px-4
              cursor-pointer relative
              font-medium
              ${selectedOption === option ? "text-white" : "text-grey-light"}
            `}
        >
          {option}
        </div>
      ))}
    </div>
  );
}
