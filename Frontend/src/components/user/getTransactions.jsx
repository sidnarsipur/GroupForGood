import { collection, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from '../firebaseConfig';

const getTransactions = async (userName) => {
    try {
        // Query the 'user' collection where 'user' field matches userName
        const q = query(collection(db, "user"), where("user", "==", userName));
        const querySnapshot = await getDocs(q);

        // Map through documents to extract the 'desc' property
        const transactionDescriptions = querySnapshot.docs.map(doc => doc.data().desc);

        return transactionDescriptions;
    } catch (e) {
        console.error("Error fetching transactions: ", e);
        throw e;
    }
}
