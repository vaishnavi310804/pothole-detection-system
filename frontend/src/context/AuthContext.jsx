import { createContext, useContext, useState } from "react";
import { loginUser as apiLogin, registerUser as apiRegister } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("okdriver_token") || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("okdriver_user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("okdriver_user");
      localStorage.removeItem("okdriver_token");
      return null;
    }
  });
  const [loading] = useState(false);

  const login = async (credentials) => {
    const data = await apiLogin(credentials);
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("okdriver_token", data.token);
      localStorage.setItem("okdriver_user", JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await apiRegister(userData);
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("okdriver_token", data.token);
      localStorage.setItem("okdriver_user", JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("okdriver_token");
    localStorage.removeItem("okdriver_user");
  };

  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
