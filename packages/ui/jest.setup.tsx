// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Add global Jest type declarations
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveTextContent: (content: string | RegExp) => R;
      toBeInTheDocument: () => R;
      toHaveClass: (className: string) => R;
    }
  }
}
