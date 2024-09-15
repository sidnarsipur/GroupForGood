import { collection, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from '../firebaseConfig';

const joinGroup = async (joinCode, userId) => {
  try {
    const q = query(collection(db, "groups"), where("joinCode", "==", joinCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("No group found with this join code");
    }

    const groupDoc = querySnapshot.docs[0];
    const groupRef = groupDoc.ref;

    // Check if user is already a member
    if (groupDoc.data().members.includes(userId)) {
      throw new Error("You are already a member of this group");
    }

    await updateDoc(groupRef, {
      members: arrayUnion(userId)
    });

    console.log("Successfully joined group");
    return groupDoc.id;
  } catch (e) {
    console.error("Error joining group: ", e);
    throw e;
  }
};

export default joinGroup;