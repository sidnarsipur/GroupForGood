// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn, UserButton, useUser } from "@clerk/clerk-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig';
import createGroup from './createGroup';
import joinGroup from './joinGroup';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;
      try {
        const groupsQuery = query(collection(db, 'groups'), where('members', 'array-contains', user.id));
        const groupSnapshot = await getDocs(groupsQuery);
        const groupList = groupSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGroups(groupList);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch groups');
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const { id, joinCode } = await createGroup(newGroupName, newGroupDescription, user.id);
      alert(`Group created successfully! Join code: ${joinCode}`);
      setGroups([...groups, { id, name: newGroupName, description: newGroupDescription }]);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    try {
      const groupId = await joinGroup(joinCode, user.id);
      alert("Successfully joined group!");
      // Fetch the group details and add to the groups list
      const groupDoc = await getDocs(doc(db, 'groups', groupId));
      const groupData = { id: groupId, ...groupDoc.data() };
      setGroups([...groups, groupData]);
      setShowJoinModal(false);
      setJoinCode('');
    } catch (error) {
      console.error("Failed to join group:", error);
      alert(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <SignedIn>
        <header className="dashboard-header">
          <h1>Group Charity</h1>
          <UserButton />
        </header>
        <main className="dashboard-main">
          {groups.length === 0 ? (
            <div className="dashboard-card no-groups">
              <p>You aren't in any groups. Join one or create one yourself!</p>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.id} className="dashboard-card">
                <h2>{group.name}</h2>
                <p>{group.description}</p>
              </div>
            ))
          )}
        </main>
        <button className="create-group-button" onClick={() => setShowCreateModal(true)}>+</button>
        <button className="join-group-button" onClick={() => setShowJoinModal(true)}>Join</button>

        {showCreateModal && (
          <div className="modal">
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
              />
              <textarea
                placeholder="Group Description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                required
              />
              <button type="submit">Create Group</button>
              <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
            </form>
          </div>
        )}

        {showJoinModal && (
          <div className="modal">
            <form onSubmit={handleJoinGroup}>
              <input
                type="text"
                placeholder="Enter 5-character join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={5}
                required
              />
              <button type="submit">Join Group</button>
              <button type="button" onClick={() => setShowJoinModal(false)}>Cancel</button>
            </form>
          </div>
        )}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
};

export default Dashboard;