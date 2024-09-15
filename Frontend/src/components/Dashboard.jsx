import React, { useState, useEffect } from "react";
import {
	SignedIn,
	SignedOut,
	RedirectToSignIn,
	UserButton,
	useUser,
} from "@clerk/clerk-react";
import {
	collection,
	query,
	where,
	getDocs,
	getDoc,
	doc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import createGroup from "./createGroup";
import joinGroup from "./joinGroup";
import "../styles/Dashboard.css";
import Popup from "./popup";

const Dashboard = () => {
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeModal, setActiveModal] = useState(null);
	const [newGroupName, setNewGroupName] = useState("");
	const [newGroupDescription, setNewGroupDescription] = useState("");
	const [joinCode, setJoinCode] = useState("");
	const { user } = useUser();
	const [showPopup, setShowPopup] = useState(false);

	useEffect(() => {
		const fetchGroups = async () => {
			if (!user) return;
			try {
				const groupsQuery = query(
					collection(db, "groups"),
					where("members", "array-contains", user.fullName)
				);
				const groupSnapshot = await getDocs(groupsQuery);
				const groupList = groupSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setGroups(groupList);
				setLoading(false);
			} catch (err) {
				setError("Failed to fetch groups");
				setLoading(false);
			}
		};

		fetchGroups();
	}, [user]);

	const handleCreateGroup = async (e) => {
		e.preventDefault();
		try {
			const { id, joinCode } = await createGroup(
				newGroupName,
				newGroupDescription,
				user.fullName
			);
			alert(`Group created successfully! Join code: ${joinCode}`);
			setGroups([
				...groups,
				{ id, name: newGroupName, description: newGroupDescription },
			]);
			setActiveModal(null);
			console.log("Group ID:", id);
			setNewGroupName("");
			setNewGroupDescription("");
		} catch (error) {
			console.error("Failed to create group:", error);
			{
				showPopup && (
					<Popup
						message="Successfully joined group!"
						onClose={handleClosePopup}
					/>
				);
			}
		}
	};

	const handleClosePopup = () => {
		setShowPopup(false);
	};

	const handleJoinGroup = async (e) => {
		e.preventDefault();
		try {
			const groupId = await joinGroup(joinCode, user.fullName);
			setShowPopup(true);
			// Fetch the group details and add to the groups list
			const groupDoc = await getDoc(doc(db, "groups", groupId));
			const groupData = { id: groupId, ...groupDoc.data() };
			setGroups([...groups, groupData]);
			console.log("Group ID:", groupId);
			setActiveModal(null);
			setJoinCode("");
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
				<div className="dashboard-withoutSignIn">
					<header className="dashboard-header">
						<h1>Charity Sync</h1>
						{/* <div class="userButton"><UserButton/></div> */}
					</header>
					<main className="dashboard-main">
						<div className="group-actions">
							<button
								className="action-button create-group-button"
								onClick={() => toggleModal("create")}
							>
								➕ &nbsp; Create Group
							</button>
							<button
								className="action-button join-group-button"
								onClick={() => toggleModal("join")}
							>
								👥 &nbsp; Join Group
							</button>
						</div>
						{groups.length === 0 ? (
							<div className="dashboard-card no-groups">
								<p>You aren't in any groups. </p>
								<p>Join one or create one yourself!</p>
							</div>
						) : (
							<div className="groups-list">
								{groups.map((group) => (
									<Link
										key={group.id}
										to={`/group/${group.id}`}
										className="groupInfo"
									>
										<h2>{group.name}</h2>
										<p>{group.description}</p>
									</Link>
								))}
							</div>
						)}
					</main>

					{activeModal === "create" && (
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
										<button type="button" onClick={() => setActiveModal(null)}>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>
					)}

					{activeModal === "join" && (
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
										<button type="button" onClick={() => setActiveModal(null)}>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>
					)}
					{showPopup && (
						<Popup
							message="Successfully joined group!"
							onClose={handleClosePopup}
						/>
					)}
				</div>
			</SignedIn>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
		</div>
	);
};

export default Dashboard;
