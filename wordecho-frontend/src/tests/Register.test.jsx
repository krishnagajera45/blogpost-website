import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import Signup from "../pages/Signup.jsx";

jest.mock("axios");

describe("Signup Component", () => {
  it("renders the signup form", () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  it("allows input into form fields", () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "xyz" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "xyz@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "xyz" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "xyz" } });

    expect(screen.getByLabelText(/Name/i).value).toBe("xyz");
    expect(screen.getByLabelText(/Email/i).value).toBe("xyz@example.com");
    expect(screen.getByLabelText(/Password/i).value).toBe("xyz");
    expect(screen.getByLabelText(/Confirm Password/i).value).toBe("xyz");
  });

  it("submits signup data successfully", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "johndoe@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "securepassword" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "securepassword" } });
    fireEvent.click(screen.getByText(/Sign Up/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8000/api/users/",
        { name: "xyz", email: "xyz@example.com", password: "xyz" },
        expect.any(Object)
      );
    });
  });

  it("displays an error message if signup fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("Signup failed"));

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "xyz" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "xyz@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "xyz" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "xyz" } });
    fireEvent.click(screen.getByText(/Sign Up/i));

    await waitFor(() => {
      expect(screen.getByText(/Registration failed. Please try again./i)).toBeInTheDocument();
    });
  });
});
