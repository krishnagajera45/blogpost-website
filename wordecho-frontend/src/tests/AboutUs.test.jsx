import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AboutUs from "../pages/AboutUs.jsx";

describe("AboutUs Component", () => {
  beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation((message) => {
      if (message.includes("React Router Future Flag Warning")) return;
      console.warn(message);
    });
  });

  afterAll(() => {
    console.warn.mockRestore();
  });

  it("renders the About Us page content", () => {
    render(
      <MemoryRouter>
        <AboutUs />
      </MemoryRouter>
    );

    expect(screen.getByText(/About Our Blog/i)).toBeInTheDocument();
    expect(screen.getByText(/Why We Blog/i)).toBeInTheDocument();
    // expect(screen.getByText(/Our Mission/i)).toBeInTheDocument();
    // expect(screen.getByText(/Our Vision/i)).toBeInTheDocument();
  });
});
