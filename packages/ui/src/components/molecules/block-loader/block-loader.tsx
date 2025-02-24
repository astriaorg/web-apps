import React from "react";

// “Top” face
// backgroundColor: "#DD5022",

// “Left” face
// backgroundColor: "#E67525",

// “Right” face
// backgroundColor: "#F09727",

export function BlockLoader({ className }: { className?: string }) {
  // Generate the keyframe rules for each combination (h1–h3, w1–w3, l1–l3)
  const keyframesCSS = generateKeyframes();

  return (
    <>
      {/* Inject the generated CSS */}
      <style>{keyframesCSS}</style>

      {/* Optional: wrap in a full‐screen container with a dark background and centered content */}
      <div className={`flex items-center justify-center ${className}`}>
        {/* The loader container (fixed size and scaled by 0.5) */}
        <div className="relative h-[100px] w-[86px] transform scale-50">
          {/** For each “row” (h value 1–3), output a container (the original HTML used h1Container, etc.) */}
          {[1, 2, 3].map((h) => (
            <div key={`h${h}Container`} className={`h${h}Container`}>
              {/** For each row, loop through all w and l combinations */}
              {[1, 2, 3].map((w) =>
                [1, 2, 3].map((l) => (
                  <div
                    key={`cube-h${h}w${w}l${l}`}
                    className={`absolute w-[86px] h-[100px] h${h} w${w} l${l}`}
                  >
                    {/** “Top” face */}
                    <div
                      className="absolute h-[50px] w-[50px] top"
                      style={{
                        backgroundColor: "#DD5022",
                        transform:
                          "rotate(210deg) skew(-30deg) translate(-75px, -22px) scaleY(0.86)",
                        transformOrigin: "0 0",
                        zIndex: 2,
                      }}
                    ></div>
                    {/** “Left” face */}
                    <div
                      className="absolute h-[50px] w-[50px] left"
                      style={{
                        backgroundColor: "#E67525",
                        transform:
                          "rotate(90deg) skewX(-30deg) scaleY(0.86) translate(25px, -50px)",
                        transformOrigin: "0 0",
                      }}
                    ></div>
                    {/** “Right” face */}
                    <div
                      className="absolute h-[50px] w-[50px] right"
                      style={{
                        backgroundColor: "#F09727",
                        transform:
                          "rotate(-30deg) skewX(-30deg) translate(49px, 65px) scaleY(0.86)",
                        transformOrigin: "0 0",
                      }}
                    ></div>
                  </div>
                )),
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Generate the keyframe animation CSS rules.
 *
 * For each combination of h (row), w, and l (columns and “layers”) the rule
 * sets a z-index and assigns an animation name (and common timing/duration).
 *
 * Then, for each animation we compute the transform values at 0%, 14%, 28%, 43%,
 * 57%, 71%, 85% and 100%.
 *
 * (Note: In the original Sass these calculations were written using percentage arithmetic.
 * Here we “simulate” that by treating, for example,
 *
 *     ($w * -50% - 50%) + ($l * 50% + 50%)
 *
 * as:
 *
 *     50 * (l - w)   // then appending "%" to the number.
 *
 * Similarly the Y translations are computed as:
 *
 *     50h + 25w + 25l – 200, etc.
 *
 * Adjust these formulas as needed.
 */
function generateKeyframes() {
  let css = "";
  for (let h = 1; h <= 3; h++) {
    for (let w = 1; w <= 3; w++) {
      for (let l = 1; l <= 3; l++) {
        css += `
/* Cube with classes h${h} w${w} l${l} */
.h${h}.w${w}.l${l} {
  z-index: -${h};
  animation-name: h${h}w${w}l${l};
  animation-timing-function: ease;
  animation-duration: 2s;
  animation-iteration-count: infinite;
}
@keyframes h${h}w${w}l${l} {
  0% {
    transform: translate(${50 * (l - w)}%, ${50 * h + 25 * w + 25 * l - 200}%);
  }
  14% {
    transform: translate(${100 * l - 50 * w - 100}%, ${50 * h + 25 * w + 50 * l - 250}%);
  }
  28% {
    transform: translate(${100 * l - 100 * w}%, ${50 * h + 50 * w + 50 * l - 300}%);
  }
  43% {
    transform: translate(${100 * l - 100 * w}%, ${100 * h + 50 * w + 50 * l - 400}%);
  }
  57% {
    transform: translate(${50 * l - 100 * w + 100}%, ${100 * h + 50 * w + 25 * l - 350}%);
  }
  71% {
    transform: translate(${50 * l - 50 * w}%, ${100 * h + 25 * w + 25 * l - 300}%);
  }
  85% {
    transform: translate(${50 * l - 50 * w}%, ${50 * h + 25 * w + 25 * l - 200}%);
  }
  100% {
    transform: translate(${50 * l - 50 * w}%, ${50 * h + 25 * w + 25 * l - 200}%);
  }
}
`;
      }
    }
  }
  return css;
}
