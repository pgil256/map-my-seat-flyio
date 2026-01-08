import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import useLocalStorage from "./hooks/LocalStorage";
import Navigation from "./navigation/Navigation";
import AppRouter from "./routes/AppRouter";
import SeatingApi from "./api";
import UserContext from "./auth/UserContext";
import jwt from "jsonwebtoken";
import LoadingSpinner from "./common/LoadingSpinner";
import { ToastProvider } from "./common/ToastContext";
export const TOKEN_STORAGE_ID = "seating-token";

function App() {
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);

  console.debug(
    "App",
    "infoLoaded=",
    infoLoaded,
    "currentUser=",
    currentUser,
    "token=",
    token
  );

  //Get data associated with user, assign user token as state
  useEffect(
    function loadUserInfo() {
      async function getCurrentUser() {
        if (token) {
          try {
            let { username } = jwt.decode(token);
            SeatingApi.token = token;
            let currentUser = await SeatingApi.getCurrentUser(username);
            setCurrentUser(currentUser);
          } catch (err) {
            console.error("App loadUserInfo: problem loading", err);
            setCurrentUser(null);
          }
        }
        setInfoLoaded(true);
      }
      setInfoLoaded(false);
      getCurrentUser();
    },
    [token]
  );

  //On log out, nullify token
  function logout() {
    setCurrentUser(null);
    setToken(null);
  }

  //On signup, send sign up data to api and create token
  async function signup(signupData) {
    try {
      let token = await SeatingApi.signup(signupData);
      setToken(token);
      return { success: true };
    } catch (errors) {
      console.error("signup failed", errors);
      return { success: false, errors };
    }
  }

  //On user login, create token
  async function login(loginData) {
    try {
      let token = await SeatingApi.login(loginData);
      setToken(token);
      return { success: true };
    } catch (errors) {
      console.error("login failed", errors);
      return { success: false, errors };
    }
  }

  if (!infoLoaded) return <LoadingSpinner />;

  //Modify homepage based on user context
  return (
      <BrowserRouter>
        <ToastProvider>
          <UserContext.Provider value={{ currentUser, setCurrentUser }}>
            <div id="main">
              <Navigation logout={logout} />
              <AppRouter login={login} signup={signup} />
            </div>
          </UserContext.Provider>
        </ToastProvider>
      </BrowserRouter>
  );
}


export default App
