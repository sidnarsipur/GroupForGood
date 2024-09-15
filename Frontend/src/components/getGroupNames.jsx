import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';

// Function to get the names of everyone in a group by its groupID
const getGroupName = async (groupID) => {
  try {
    console.log("Getting group names for group ID:", groupID);
    const groupDocRef = doc(db, 'groups', groupID);
    const groupSnapshot = await getDoc(groupDocRef);

    if (groupSnapshot.exists()) {
      // Assuming 'members' is an array of names in the document data
      const groupMemberNames = groupSnapshot.data().members;
      console.log("Group member names:", groupMemberNames);
      return groupMemberNames;
    } else {
      console.log("No such group found!");
      return [];
    }
  } catch (e) {
    console.error("Error getting group names: ", e);
    throw e;
  }
};

export default getGroupName;
