import axios from "axios";
import Cookies from "js-cookie";

let BASEURL = "https://basura-d389d141409a.herokuapp.com/";

const apiService = axios.create({
  baseURL: BASEURL,
  timeout: 10000,
});

// Request interceptor

apiService.interceptors.request.use(
  (config: any) => {
    let auth: string;
    if (Cookies.get("access_token")) {
      auth = `Bearer ${Cookies.get("access_token")}`;
    } else {
      auth = "";
    }
    config.headers["Authorization"] = auth;
    return config;
  },
  (error: any) => {
    Promise.reject(error);
  }
);

let refreshTokenRetry = true;

// Response interceptor

apiService.interceptors.response.use(
  (response) => response, // Just return the response if it's successful
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is a 401 and if it's not a retry
    if (
      error.response.status === 401 &&
      error.response.data.msg === "Token has expired" &&
      refreshTokenRetry
    ) {
      refreshTokenRetry = false;
      try {
        // Attempt to refresh the token
        const refreshToken = Cookies.get("refresh_token"); // Or wherever you store it
        const response = await axios.post(
          `${BASEURL}/token/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        // Save the new token
        const newToken = response.data.access_token;
        Cookies.set("access_token", newToken);

        // Update the Authorization header and retry the original request
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiService(originalRequest); // Retry the original request
      } catch (refreshError) {
        // Handle token refresh failure (e.g., redirect to login)
        console.error("Token refresh failed:", refreshError);
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = "/auth"; // Redirect to login if refresh fails
      }
    } else if (
      error.response.status === 401 &&
      error.response.data.msg === "Missing Authorization Header"
    ) {
      window.location.href = "/auth";
    }

    // Return any error which is not due to authentication
    return Promise.reject(error);
  }
);

// Login Api
export const login = async (userDetails: any) => {
  try {
    const response = await apiService.post("login", userDetails);
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// User details
export const userDetails = async () => {
  try {
    const response = await apiService.get("user/details");
    return response;
  } catch (error) {
    console.error("Error fetching user details", error);
    throw error;
  }
};

// Add new employee
export const addEmployee = async (employeeDetails: any) => {
  try {
    const response = await apiService.post("add-employee", employeeDetails, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Error adding a new user employee", error);
    throw error;
  }
};

// Get list of employees
export const getEmployees = async () => {
  try {
    const response = await apiService.get("employees");
    return response;
  } catch (error) {
    console.error("Error fetching employees list", error);
    throw error;
  }
};

// Get employee details
export const getEmployeeDetails = async (empID: string) => {
  try {
    const response = await apiService.get(`employee/${empID}`);
    return response;
  } catch (error) {
    console.error("Error fetching employee details", error);
    throw error;
  }
};
