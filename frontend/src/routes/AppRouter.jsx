import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../home/Home";
import ClassroomForm from "../classroom/ClassroomForm";
import StudentForm from "../students/StudentForm";
import LoginForm from "../auth/LoginForm";
import PeriodForm from "../periods/PeriodForm";
import SeatingChart from "../seating/SeatingChart";
import SignupForm from "../auth/SignupForm";
import ProfileForm from "../profile/ProfileForm";
import PrivateRoute from "./PrivateRoutes";

//App router
const AppRouter = ({ login, signup }) => {
  return (
    <div className='pt-5'>
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/login' element={<LoginForm login={login} />} />

        <Route path='/signup' element={<SignupForm signup={signup} />} />

        <Route exact='true' path='/periods' element={<PrivateRoute />}>
          <Route exact='true' path='/periods' element={<PeriodForm />} />
        </Route>

        <Route
          exact='true'
          path='/periods/:periodId'
          element={<PrivateRoute />}>
          <Route
            exact='true'
            path='/periods/:periodId'
            element={<StudentForm />}
          />
        </Route>

        <Route exact='true' path='/classrooms' element={<PrivateRoute />}>
          <Route exact='true' path='/classrooms' element={<ClassroomForm />} />
        </Route>

        {/* <Route
          exact='true'
          path='/classrooms/:classroomId/seating-charts/:number'
          element={<PrivateRoute />}> */}
          <Route
            exact='true'
            path='classrooms/:classroomId/seating-charts/:number'
            element={<SeatingChart />}
          />
        {/* </Route> */}

        <Route path='/profile' element={<PrivateRoute />}>
          <Route path='/profile' element={<ProfileForm />} />
        </Route>

        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </div>
  );
};

export default AppRouter;
