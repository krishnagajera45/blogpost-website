import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContactUs from "../pages/ContactUs"; // Ensure the correct relative path
import Swal from "sweetalert2";

jest.mock("sweetalert2");

describe("ContactUs Component", () => {
  it("renders the Contact Us form", () => {
    render(
      <MemoryRouter>
        <ContactUs />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Message/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit/i)).toBeInTheDocument();
  });

  it("allows input into the form fields", () => {
    render(
      <MemoryRouter>
        <ContactUs />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Your Email/i), { target: { value: "johndoe@example.com" } });
    fireEvent.change(screen.getByLabelText(/Your Message/i), { target: { value: "This is a test message." } });

    expect(screen.getByLabelText(/Your Name/i).value).toBe("John Doe");
    expect(screen.getByLabelText(/Your Email/i).value).toBe("johndoe@example.com");
    expect(screen.getByLabelText(/Your Message/i).value).toBe("This is a test message.");
  });

  it("handles form submission", async () => {
    // Mock the axios request response
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <ContactUs />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Your Email/i), { target: { value: "johndoe@example.com" } });
    fireEvent.change(screen.getByLabelText(/Your Message/i), { target: { value: "This is a test message." } });
    fireEvent.click(screen.getByText(/Submit/i));

    // Check if Swal.fire has been called with the success message
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "success",
        title: "Thank you!",
        text: "Your message has been received. We will get back to you shortly.",
      });
    });
  });

  it("handles form submission failure", async () => {
    // Mock the axios request to fail
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockRejectedValue(new Error("Submission failed"));

    render(
      <MemoryRouter>
        <ContactUs />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Your Email/i), { target: { value: "johndoe@example.com" } });
    fireEvent.change(screen.getByLabelText(/Your Message/i), { target: { value: "This is a test message." } });
    fireEvent.click(screen.getByText(/Submit/i));

    // Check if Swal.fire has been called with the error message
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Please try again later.",
      });
    });
  });
});
