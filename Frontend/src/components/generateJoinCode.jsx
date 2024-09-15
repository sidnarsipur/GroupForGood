import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig';

const generateJoinCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  while (true) {
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    // Check if this code already exists
    const q = query(collection(db, "groups"), where("joinCode", "==", result));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If no group with this code exists, we can use it
      return result;
    }

    // If the code already exists, generate a new one
    result = '';
  }
};

export default generateJoinCode;