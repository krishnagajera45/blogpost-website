import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BlogPage from "../pages/BlogPage.jsx";


describe("BlogPage Component", () => {
  const mockBlog = {
    id: 1,
    title: "Sample Blog Title",
    content: "This is the content of the blog.",
  };

  it("renders the blog page content", () => {
    render(
      <MemoryRouter>
        <BlogPage blog={mockBlog} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Sample Blog Title/i)).toBeInTheDocument();
    expect(screen.getByText(/This is the content of the blog./i)).toBeInTheDocument();
  });

  it("allows navigation back to the user homepage", () => {
    render(
      <MemoryRouter>
        <BlogPage blog={mockBlog} />
      </MemoryRouter>
    );

    const backButton = screen.getByRole("button", { name: /Back to Blogs/i });
    fireEvent.click(backButton);

    expect(window.location.pathname).toBe("/user-home");
  });
});
