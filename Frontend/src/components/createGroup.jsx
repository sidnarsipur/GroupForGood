import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebaseConfig';
import generateJoinCode from './generateJoinCode';

const createGroup = async (name, description, userId) => {
  try {
    const joinCode = await generateJoinCode();
    const docRef = await addDoc(collection(db, "groups"), {
      name: name,
      description: description,
      joinCode: joinCode,
      createdBy: userId,
      createdAt: serverTimestamp(),
      members: [userId],
      events: [],
      charityGoal: {
        amount: 0,
        currency: "USD",
        deadline: null
      },
      totalDonations: 0
    });
    console.log("Group created with ID: ", docRef.id);
    return { id: docRef.id, joinCode: joinCode };
  } catch (e) {
    console.error("Error adding group: ", e);
    throw e;
  }
};

export default createGroup;