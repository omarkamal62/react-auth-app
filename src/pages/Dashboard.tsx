import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import axios from "axios";

import { useAuth } from "../contexts/AuthContext";
import { getAuthToken } from "../utils/auth";

interface UserData {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { logout } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the token from localStorage
        const token = getAuthToken();

        if (!token) {
          navigate("/login");
          return;
        }

        // Set the Authorization header
        const response = await api.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(response.data);
      } catch (error: unknown) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again later.");

        // Use proper type checking for the error
        if (axios.isAxiosError(error)) {
          // Handle Axios errors with type safety
          if (error.response?.status === 401) {
            logout();
            navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h2>Dashboard</h2>
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            </Card.Header>
            <Card.Body className="p-5">
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading user data...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : userData ? (
                <div>
                  <h3 className="mb-4">Welcome, {userData.name}!</h3>

                  <Card className="mb-4">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Account Information</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row className="mb-3">
                        <Col sm={4} className="fw-bold text-muted">
                          Name:
                        </Col>
                        <Col sm={8}>{userData.name}</Col>
                      </Row>
                      <Row className="mb-3">
                        <Col sm={4} className="fw-bold text-muted">
                          Email:
                        </Col>
                        <Col sm={8}>{userData.email}</Col>
                      </Row>
                      <Row className="mb-3">
                        <Col sm={4} className="fw-bold text-muted">
                          User ID:
                        </Col>
                        <Col sm={8}>{userData._id}</Col>
                      </Row>
                      <Row>
                        <Col sm={4} className="fw-bold text-muted">
                          Member Since:
                        </Col>
                        <Col sm={8}>
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <p className="text-muted text-center">
                    You're logged in to the secure area of the application.
                  </p>
                </div>
              ) : (
                <p className="text-center">No user data available.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
