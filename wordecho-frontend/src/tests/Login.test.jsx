import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login.jsx";

jest.mock("axios");

describe("Login Page", () => {
  const setUserMock = jest.fn();

  it("renders the login form", () => {
    render(
      <MemoryRouter>
        <Login setUser={setUserMock} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Let Me In!/i)).toBeInTheDocument();
  });

  it("submits login data successfully", async () => {
    // Mock successful axios post response for token
    axios.post.mockResolvedValueOnce({ data: { access_token: "mock-token" } });
    // Mock successful axios get response for user profile
    axios.get.mockResolvedValueOnce({ data: { name: "Test User" } });

    render(
      <MemoryRouter>
        <Login setUser={setUserMock} />
      </MemoryRouter>
    );

    // Fill in the login form
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "ab@g.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "ab" } });
    fireEvent.click(screen.getByText(/Let Me In!/i));

    // Wait for axios calls to be made and validate them
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8000/token",
        expect.any(URLSearchParams),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      expect(axios.get).toHaveBeenCalledWith(
        "http://localhost:8000/api/users/me",
        { headers: { Authorization: "Bearer mock-token" } }
      );
      expect(setUserMock).toHaveBeenCalledWith({ name: "Test User" });
    });
  });

  it("shows an error message if login fails", async () => {
    // Mock axios post rejection
    axios.post.mockRejectedValueOnce(new Error("Login failed"));

    render(
      <MemoryRouter>
        <Login setUser={setUserMock} />
      </MemoryRouter>
    );

    // Fill in the login form with incorrect credentials
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "ab@g.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "abc" } });
    fireEvent.click(screen.getByText(/Let Me In!/i));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Login failed. Please check your credentials/i)).toBeInTheDocument();
    });
  });
});
