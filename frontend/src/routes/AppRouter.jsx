import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../home/Home";
import LoginForm from "../auth/LoginForm";
import SignupForm from "../auth/SignupForm";
import PrivateRoute from "./PrivateRoutes";
import PageSkeleton from "../common/PageSkeleton";

// Lazy load heavier components for better initial load performance
const ClassroomForm = lazy(() => import("../classroom/ClassroomForm"));
const ClassroomList = lazy(() => import("../classroom/ClassroomList"));
const StudentForm = lazy(() => import("../students/StudentForm"));
const PeriodForm = lazy(() => import("../periods/PeriodForm"));
const SeatingChart = lazy(() => import("../seating/SeatingChart"));
const ProfileForm = lazy(() => import("../profile/ProfileForm"));

//App router
const AppRouter = ({ login, signup }) => {
  return (
    <div className='pt-5'>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path='/' element={<Home />} />

          <Route path='/login' element={<LoginForm login={login} />} />

          <Route path='/signup' element={<SignupForm signup={signup} />} />

          <Route exact='true' path='/periods' element={<PrivateRoute />}>
            <Route exact='true' path='/periods' element={
              <Suspense fallback={<PageSkeleton variant="form" />}>
                <PeriodForm />
              </Suspense>
            } />
          </Route>

          <Route
            exact='true'
            path='/periods/:periodId'
            element={<PrivateRoute />}>
            <Route
              exact='true'
              path='/periods/:periodId'
              element={
                <Suspense fallback={<PageSkeleton variant="form" />}>
                  <StudentForm />
                </Suspense>
              }
            />
          </Route>

          <Route exact='true' path='/classrooms' element={<PrivateRoute />}>
            <Route exact='true' path='/classrooms' element={
              <Suspense fallback={<PageSkeleton variant="form" />}>
                <ClassroomForm />
              </Suspense>
            } />
          </Route>

          <Route path='/classrooms/:username' element={<PrivateRoute />}>
            <Route path='/classrooms/:username' element={
              <Suspense fallback={<PageSkeleton variant="grid" />}>
                <ClassroomList />
              </Suspense>
            } />
          </Route>

          <Route path='/classrooms/:username/:classroomId' element={<PrivateRoute />}>
            <Route path='/classrooms/:username/:classroomId' element={
              <Suspense fallback={<PageSkeleton variant="form" />}>
                <ClassroomForm />
              </Suspense>
            } />
          </Route>

          <Route
            exact='true'
            path='classrooms/:classroomId/seating-charts/:number'
            element={
              <Suspense fallback={<PageSkeleton variant="seating" />}>
                <SeatingChart />
              </Suspense>
            }
          />

          <Route path='/profile' element={<PrivateRoute />}>
            <Route path='/profile' element={
              <Suspense fallback={<PageSkeleton variant="form" />}>
                <ProfileForm />
              </Suspense>
            } />
          </Route>

          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default AppRouter;
