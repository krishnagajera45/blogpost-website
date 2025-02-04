import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import CreateBlog from "../pages/CreateBlog.jsx";

jest.mock("axios");

describe("CreateBlog Page", () => {
  it("renders the blog creation form", () => {
    render(
      <MemoryRouter>
        <CreateBlog />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Blog Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Blog Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Save Blog/i)).toBeInTheDocument();
  });

  it("allows input into form fields", () => {
    render(
      <MemoryRouter>
        <CreateBlog />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Blog Title/i), { target: { value: "My Blog" } });
    fireEvent.change(screen.getByLabelText(/Blog Description/i), { target: { value: "Blog content goes here" } });

    expect(screen.getByLabelText(/Blog Title/i).value).toBe("My Blog");
    expect(screen.getByLabelText(/Blog Description/i).value).toBe("Blog content goes here");
  });

  it("submits blog data successfully", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter>
        <CreateBlog />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Blog Title/i), { target: { value: "My Blog" } });
    fireEvent.change(screen.getByLabelText(/Blog Description/i), { target: { value: "Blog content goes here" } });
    fireEvent.click(screen.getByText(/Save Blog/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8000/api/blogs/",
        { title: "My Blog", content: "Blog content goes here" },
        expect.any(Object)
      );
    });
  });

  it("displays an error message if submission fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("Submission failed"));

    render(
      <MemoryRouter>
        <CreateBlog />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Blog Title/i), { target: { value: "My Blog" } });
    fireEvent.change(screen.getByLabelText(/Blog Description/i), { target: { value: "Blog content goes here" } });
    fireEvent.click(screen.getByText(/Save Blog/i));

    await waitFor(() => {
      expect(screen.getByText(/Failed to create blog/i)).toBeInTheDocument();
    });
  });
});
