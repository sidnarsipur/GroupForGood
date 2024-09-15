import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebaseConfig';
import generateJoinCode from './generateJoinCode';

const createGroup = async (name, description, userName) => {
  try {
    const joinCode = await generateJoinCode();
    const docRef = await addDoc(collection(db, "groups"), {
      name: name,
      description: description,
      joinCode: joinCode,
      createdBy: userName,
      members: [userName]
    });
    console.log("Group created with ID: ", docRef.id);
    return { id: docRef.id, joinCode: joinCode };
  } catch (e) {
    console.error("Error adding group: ", e);
    throw e;
  }
};

export default createGroup;