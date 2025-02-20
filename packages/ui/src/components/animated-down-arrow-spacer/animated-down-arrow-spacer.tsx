export const AnimatedArrowSpacer = ({
  isAnimating,
}: {
  isAnimating: boolean;
}) => {
  return (
    <div className="my-4">
      {[100, 80, 60, 40, 20, 10, 5, 1].map((width, index) => (
        <div
          key={width}
          className={`mt-1 border-t-[3px] p-[1px] border-white transition ${
            isAnimating ? "animate-light-up-orange" : ""
          }`}
          style={{
            width: `${width}%`,
            margin: "0 auto",
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};
