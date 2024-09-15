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
  const [activeModal, setActiveModal] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;
      try {
        const groupsQuery = query(collection(db, 'groups'), where('members', 'array-contains', user.fullName));
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
      const { id, joinCode } = await createGroup(newGroupName, newGroupDescription, user.fullName);
      alert(`Group created successfully! Join code: ${joinCode}`);
      setGroups([...groups, { id, name: newGroupName, description: newGroupDescription }]);
      setActiveModal(null);
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
      const groupId = await joinGroup(joinCode, user.fullName);
      alert("Successfully joined group!");
      // Fetch the group details and add to the groups list
      const groupDoc = await getDocs(doc(db, 'groups', groupId));
      const groupData = { id: groupId, ...groupDoc.data() };
      setGroups([...groups, groupData]);
      setActiveModal(null);
      setJoinCode('');
    } catch (error) {
      console.error("Failed to join group:", error);
      alert(error.message);
    }
  };

  const toggleModal = (modalType) => {
    setActiveModal(activeModal === modalType ? null : modalType);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <SignedIn>
        <header className="dashboard-header">
          <h1>Charity Sync</h1>
          <UserButton />
        </header>
        <main className="dashboard-main">
          {groups.length === 0 ? (
            <div className="dashboard-card no-groups">
              <p>You aren't in any groups. </p>
              <p>Join one or create one yourself!</p>
            </div>
          ) : (
            <div className="groups-list">
              {groups.map(group => (
                <div key={group.id} className="dashboard-card">
                  <h2>{group.name}</h2>
                  <p>{group.description}</p>
                </div>
              ))}
            </div>
          )}
          <div className="group-actions">
            <button className="action-button create-group-button" onClick={() => toggleModal('create')}>Create Group</button>
            <button className="action-button join-group-button" onClick={() => toggleModal('join')}>Join Group</button>
          </div>
        </main>

        {activeModal === 'create' && (
          <div className="modal">
            <div className="modal-content">
              <h2>Create New Group</h2>
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
                <div className="modal-actions">
                  <button type="submit">Create Group</button>
                  <button type="button" onClick={() => setActiveModal(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeModal === 'join' && (
          <div className="modal">
            <div className="modal-content">
              <h2>Join a Group</h2>
              <form onSubmit={handleJoinGroup}>
                <input
                  type="text"
                  placeholder="Enter 5-character join code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={5}
                  required
                />
                <div className="modal-actions">
                  <button type="submit">Join Group</button>
                  <button type="button" onClick={() => setActiveModal(null)}>Cancel</button>
                </div>
              </form>
            </div>
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