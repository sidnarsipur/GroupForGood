import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../styles/GroupScreen.css';

const GroupScreen = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="group-screen">
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      <h1>{group.name}</h1>
      <p>{group.description}</p>
      <p>Group Code: {group.joinCode}</p>
      <h2>Members</h2>
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
  );
};

export default GroupScreen;