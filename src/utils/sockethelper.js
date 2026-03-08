export function areObjectsDeepEqual(objA, objB) {
    if (objA === objB) {
      return true; // If they are the same object, they are equal
    }

    if (
      objA === null ||
      objB === null ||
      typeof objA !== "object" ||
      typeof objB !== "object"
    ) {
      return false; // If either object is null or not an object, they are not equal
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      const valueA = objA[key];
      const valueB = objB[key];

      if (!areObjectsDeepEqual(valueA, valueB)) {
        return false; // Recursively compare nested objects
      }
    }

    return true;
  }

  export function areObjectsDeepEqual1(objA, objB) {
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      const valueA = objA[key];
      const valueB = objB[key];

      if (typeof valueA === "object" && typeof valueB === "object") {
        if (!areObjectsDeepEqual(valueA, valueB)) {
          return false; // Recursively compare nested objects
        }
      } else if (valueA !== valueB) {
        return false; // Values are not equal
      }
    }

    return true;
  }

  export function areArraysEqual(array1, array2) {
    if (array1.length !== array2.length) {
      return false; // Arrays have different lengths, they can't be equal
    }

    for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false; // Elements at the same index are different, arrays are not equal
      }
    }

    return true; // All elements are equal
  }
  export const retrieveData = async () => {
    // try {
    //   const data = await AsyncStorage.getItem("KeepLoggedIn"); // Await the promise
    //   const loginEmail = await AsyncStorage.getItem("loginEmail");
    //   // console.log("Retrieved data:", data); // Log the retrieved data
    //   // console.log("Login Email:", loginEmail); // Log the retrieved data/
    //   setIsLogin(JSON.parse(data));
    //   setUser(loginEmail);

    //   // Convert the string "true" to a boolean
    // } catch (error) {
    //   console.error("Error retrieving data:", error);
    // }
  };

 export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }