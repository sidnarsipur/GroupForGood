import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import getGroupName from './getGroupNames';
import findCharity from './findCharity';
import '../styles/GroupScreen.css';

const GroupScreen = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleGetGroupNames = async () => {
    try {
      const groupNames = await getGroupName(groupId);
      return groupNames;
    } catch (error) {
      console.error("Failed to get group names:", error);
      alert("Failed to get group names. Please try again.");
    }
  };

  const handleFindCharity = async () => {
    try {
      const groupNames = await handleGetGroupNames();
      const charities = await findCharity(groupNames);
      console.log("Charities:", charities);
    } catch (error) {
      console.error("Failed to find charity:", error);
      alert("Failed to find charity. Please try again.");
    }
  };

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          setGroup(groupDoc.data());
        } else {
          setError('Group not found');
        }
      } catch (err) {
        setError('Failed to fetch group');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="group-screen">
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      <div className="group-code">Group Code: {group.joinCode}</div>
      <div className ="group-details">
        <h1>{group.name}</h1>
        <p>{group.description}</p>
        <h2 className="members">Members</h2>
        <ul>
        {group.members && group.members.length > 0 ? (
        group.members.map((member, index) => (
            <li key={index}>{member}</li>
        ))
  ) : (
    <li>No members in this group</li>
  )}
</ul>
      </div>
      <button className="find-charity-button" onClick={handleFindCharity}>Find a Common Charity</button>
    </div>
  );  
};

export default GroupScreen;
