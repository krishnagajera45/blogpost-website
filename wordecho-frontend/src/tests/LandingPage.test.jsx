import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage.jsx";

describe("LandingPage Component", () => {
  it("renders the landing page content for unauthenticated users", () => {
    render(
      <MemoryRouter>
        <LandingPage user={null} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome to My Blog/i)).toBeInTheDocument();
    expect(screen.getByText(/Join us to explore exciting blogs and share your own stories./i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign Up Now/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Log In/i })).toBeInTheDocument();
  });

  it("renders the landing page content for authenticated users", () => {
    const user = { name: "ab" };
    render(
      <MemoryRouter>
        <LandingPage user={user} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome to My Blog/i)).toBeInTheDocument();
    expect(screen.getByText(/Hi John Doe, explore the latest blogs and insights tailored for you!/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Go to Your Dashboard/i })).toBeInTheDocument();
  });
});
