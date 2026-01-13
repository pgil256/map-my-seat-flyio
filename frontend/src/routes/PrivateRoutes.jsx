import  { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import UserContext from "../auth/UserContext";
import { useDemo } from "../demo/DemoContext";

// Protects certain routes for users who are logged in only
const PrivateRoute = ({ path, children }) => {
  const { currentUser } = useContext(UserContext);
  const { isDemo } = useDemo();

  // Allow access if user is logged in OR in demo mode
  return (currentUser || isDemo) ? <Outlet/> : <Navigate to="/login" />;
};

export default PrivateRoute;
