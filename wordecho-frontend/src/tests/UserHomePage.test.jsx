import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserHomePage from "../pages/UserHomePage.jsx";

describe("UserHomePage Component", () => {
  const mockUser = { name: "Test User", id: 1 };

  it("renders the user's dashboard", () => {
    render(
      <MemoryRouter>
        <UserHomePage user={mockUser} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome, Test User!/i)).toBeInTheDocument();
  });

  it("displays the create blog button", () => {
    render(
      <MemoryRouter>
        <UserHomePage user={mockUser} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Create a Blog/i)).toBeInTheDocument();
  });

  it("redirects to the create blog page on button click", () => {
    render(
      <MemoryRouter>
        <UserHomePage user={mockUser} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Create a Blog/i));
    expect(window.location.pathname).toBe("/create-blog");
  });
});
