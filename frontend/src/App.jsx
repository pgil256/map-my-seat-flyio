import { useState, useEffect, useCallback } from "react";
import { BrowserRouter } from "react-router-dom";
import useLocalStorage from "./hooks/LocalStorage";
import Navigation from "./navigation/Navigation";
import AppRouter from "./routes/AppRouter";
import SeatingApi, { ApiError } from "./api";
import UserContext from "./auth/UserContext";
import { jwtDecode } from "jwt-decode";
import LoadingSpinner from "./common/LoadingSpinner";
import { ToastProvider, useAppToast } from "./common/ToastContext";
import ErrorBoundary from "./common/ErrorBoundary";
import { DemoProvider, useDemo } from "./demo/DemoContext";
import DemoBanner from "./demo/DemoBanner";
export const TOKEN_STORAGE_ID = "seating-token";

function AppContent({ token, setToken }) {
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const toast = useAppToast();
  const { isDemo, demoData, exitDemo } = useDemo();

  console.debug(
    "App",
    "infoLoaded=",
    infoLoaded,
    "currentUser=",
    currentUser,
    "token=",
    token,
    "isDemo=",
    isDemo
  );

  useEffect(
    function loadUserInfo() {
      async function getCurrentUser() {
        // In demo mode, use demo user
        if (isDemo) {
          setCurrentUser(demoData.user);
          setInfoLoaded(true);
          return;
        }

        if (token) {
          try {
            let { username } = jwtDecode(token);
            SeatingApi.token = token;
            let currentUser = await SeatingApi.getCurrentUser(username);
            setCurrentUser(currentUser);
          } catch (err) {
            console.error("App loadUserInfo: problem loading", err);
            setCurrentUser(null);
            setToken(null);
            if (err instanceof ApiError) {
              toast.error(err.message);
            }
          }
        }
        setInfoLoaded(true);
      }
      setInfoLoaded(false);
      getCurrentUser();
    },
    [token, setToken, toast, isDemo, demoData.user]
  );

  const logout = useCallback(() => {
    if (isDemo) {
      exitDemo();
    }
    setCurrentUser(null);
    setToken(null);
    toast.info("You have been logged out");
  }, [setToken, toast, isDemo, exitDemo]);

  async function signup(signupData) {
    try {
      let token = await SeatingApi.signup(signupData);
      setToken(token);
      toast.success("Account created successfully!");
      return { success: true };
    } catch (err) {
      console.error("signup failed", err);
      const message = err instanceof ApiError ? err.message : "Signup failed";
      toast.error(message);
      return { success: false, errors: [message] };
    }
  }

  async function login(loginData) {
    try {
      let token = await SeatingApi.login(loginData);
      setToken(token);
      toast.success("Welcome back!");
      return { success: true };
    } catch (err) {
      console.error("login failed", err);
      const message = err instanceof ApiError ? err.message : "Login failed";
      toast.error(message);
      return { success: false, errors: [message] };
    }
  }

  if (!infoLoaded) return <LoadingSpinner />;

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <DemoBanner />
      <div id="main">
        <Navigation logout={logout} />
        <AppRouter login={login} signup={signup} />
      </div>
    </UserContext.Provider>
  );
}

function App() {
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <DemoProvider>
            <AppContent token={token} setToken={setToken} />
          </DemoProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
