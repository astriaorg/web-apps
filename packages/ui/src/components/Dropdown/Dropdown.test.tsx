import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Dropdown } from "./Dropdown"; // Adjust the import path as needed

describe("Dropdown Component", () => {
  test("renders with placeholder text", () => {
    render(
      <Dropdown
        options={mockOptions}
        onSelect={() => {}}
        placeholder="Select an item"
      />,
    );
    expect(screen.getByText("Select an item")).toBeInTheDocument();
  });

  test("opens dropdown when clicked", () => {
    render(<Dropdown options={mockOptions} onSelect={() => {}} />);
    const dropdownButtons = screen.getAllByRole("button");
    const dropdownButton = dropdownButtons[0];
    fireEvent.click(dropdownButton);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("closes dropdown when an option is selected", () => {
    const onSelect = jest.fn();
    render(<Dropdown options={mockOptions} onSelect={onSelect} />);

    const dropdownButtons = screen.getAllByRole("button");
    const dropdownButton = dropdownButtons[0];
    fireEvent.click(dropdownButton);

    const option = screen.getByText("Option 1");
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledWith("option1");
  });

  const mockOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  test("displays selected option", () => {
    render(
      <Dropdown
        options={mockOptions}
        defaultOption={mockOptions[1]} // Use "Option 2" as default
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  test("displays selected option after user clicks it", () => {
    render(<Dropdown options={mockOptions} onSelect={() => {}} />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Option 2"));
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  test("calls onSelect with correct value when option is clicked", () => {
    const onSelect = jest.fn();
    render(<Dropdown options={mockOptions} onSelect={onSelect} />);

    const dropdownButtons = screen.getAllByRole("button");
    const dropdownButton = dropdownButtons[0];
    fireEvent.click(dropdownButton);

    const option = screen.getByText("Option 3");
    fireEvent.click(option);

    expect(onSelect).toHaveBeenCalledWith("option3");
  });
});
