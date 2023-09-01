import { useState, useEffect } from "react";

//Stores user key in app as state to maintain user context in between page render
function useLocalStorage(key, firstValue = null) {
  const initialValue = localStorage.getItem(key) || firstValue;

  const [item, setItem] = useState(initialValue);

  useEffect(
    function setKeyInLocalStorage() {
      console.debug("hooks useLocalStorage useEffect", "item=", item);
      if (item === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, item);
      }
    },
    [key, item]
  );
  return [item, setItem];
}

export default useLocalStorage;
