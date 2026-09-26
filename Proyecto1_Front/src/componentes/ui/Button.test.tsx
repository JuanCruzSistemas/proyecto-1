import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label and responds to a click", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Actualizar</Button>);

    const button = screen.getByRole("button", { name: "Actualizar" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});