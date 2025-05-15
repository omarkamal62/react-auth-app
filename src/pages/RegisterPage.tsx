import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import api from "../api/axios";

interface FormState {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string[];
  name?: string[];
  password?: string[];
  confirmPassword?: string[];
  general?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormState>({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field-specific errors when user starts typing again
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      // Send registration data to the backend
      await api.post("/api/users/register", {
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      // Show success message
      setSuccessMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: unknown) {
      // Handle error responses from API

      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;

        // Handle validation errors
        if (responseData.validationErrors) {
          setErrors(responseData.validationErrors as FormErrors);
        }
        // Handle conflict errors (like email already registered)
        else if (responseData.statusCode === 409) {
          setErrors({
            email: [responseData.message || "Email is already registered"],
          });
        }
        // Handle other errors
        else {
          setErrors({
            general:
              responseData.message ||
              responseData.error ||
              "Registration failed. Please try again.",
          });
        }
      } else {
        setErrors({
          general: "Network error. Please check your connection and try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h2>Create an Account</h2>
            </Card.Header>
            <Card.Body className="p-4">
              {successMessage && (
                <Alert variant="success">{successMessage}</Alert>
              )}

              {errors.general && (
                <Alert variant="danger">{errors.general}</Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium text-start w-100">
                    Email address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && (
                    <Form.Control.Feedback
                      type="invalid"
                      className="w-100 text-start"
                    >
                      {errors.email[0]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium text-start w-100">
                    Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                    placeholder="Enter your name"
                    required
                  />
                  {errors.name && (
                    <Form.Control.Feedback
                      className="w-100 text-start"
                      type="invalid"
                    >
                      {errors.name[0]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium text-start w-100">
                    Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      placeholder="Enter your password"
                      required
                    />
                    <InputGroup.Text
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer" }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                    {errors.password && (
                      <Form.Control.Feedback
                        type="invalid"
                        className="w-100 text-start"
                      >
                        {errors.password[0]}
                      </Form.Control.Feedback>
                    )}
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Must be at least 8 characters with a letter, number and
                    special character.
                  </Form.Text>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2"
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center py-3 bg-light">
              Already have an account? <Link to="/login">Sign in</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
