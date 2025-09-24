import { useState, useEffect, useContext } from "react";
import UserContext from "../auth/UserContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner.jsx";
import SeatingApi from "../api.js";
import { Center, Heading, Button } from "@chakra-ui/react";

//Renders button based on the periods for the current user
//Each button will render a seating chart based on the data collected in Classroom.js and ClassroomForm.js
const ClassroomRedirect = (props) => {
  const classroomId = props.classroomId;
  const [periods, setPeriods] = useState([]);
  const [infoLoading, setInfoLoading] = useState(true);
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const username = currentUser.username;

  const getPeriodsOnMount = async (isMounted) => {
    try {
      const periods = await SeatingApi.getPeriods(username);
      if (isMounted) {
        setPeriods(periods);
        setInfoLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getPeriodsOnMount(isMounted);

    return () => {
      isMounted = false;
    };
  }, [username]);

  const getSeatingChart = (e, number) => {
    e.preventDefault();
    navigate(`/classrooms/${classroomId}/seating-charts/${number}`);
  };

  return (
    <div>
      {infoLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Center>
            <Heading mb={2} size={"md"}>
              Create Seating Chart:
            </Heading>
          </Center>
          {periods && Object.values(periods).length ? (
            Object.values(periods).map((period) => (
              <Button
                size="md"
                m={2}
                colorScheme="blue"
                onClick={(e) => getSeatingChart(e, period.number)}
                value={period.number}
                key={period.number}
              >
                Period {period.number}
              </Button>
            ))
          ) : (
            <p>No periods added yet</p>
          )}
        </>
      )}
    </div>
  );
};
export default ClassroomRedirect;
