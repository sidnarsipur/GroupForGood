    import { db } from "../firebaseConfig"; // Firestore config
    import { collection, addDoc, getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore"; // Firestore methods

    export const joinGroup = async (groupID, userName) => {
        try {
          const groupDocRef = doc(db, "groups", groupID); // Get reference to the specific group
          const groupSnap = await getDoc(groupDocRef);
      
          if (!groupSnap.exists()) {
            console.error("Group not found");
            return {}; // Return empty object if group doesn't exist
          }
      
          // Update the group's 'members' array
          await updateDoc(groupDocRef, {
            members: arrayUnion(userName), // Correct way to add to array in Firestore
          });
      
          // Return the updated group document
          return groupSnap.data();
        } catch (error) {
          console.error("Error joining group: ", error);
          return {}; // Return empty object in case of error
        }
      };
    
    export const createGroup = async (name) => {
        try {
          const docRef = await addDoc(collection(db, "groups"), {
            members: [name],
          });
          return docRef.id; // Return the newly created group ID
        } catch (error) {
          console.error("Error creating group: ", error);
          return null; // Return null if there's an error
        }
      };