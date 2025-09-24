import  { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import UserContext from "../auth/UserContext";

// Protects certain routes for users who are logged in only
const PrivateRoute = ({ path, children }) => {
  const { currentUser } = useContext(UserContext);

  return currentUser? <Outlet/> : <Navigate to="/login" />;
};

export default PrivateRoute;
