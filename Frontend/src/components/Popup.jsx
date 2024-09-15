import React from "react";
import "../styles/Popup.css";

const Popup = ({ message, onClose }) => {
	const emoji = message.toLowerCase().includes("success") ? "✅" : "❗";

	return (
		<div className="popup-overlay">
			<div className="popup-content">
				<div className="popup-emoji">{emoji}</div>
				<h2>{message}</h2>
				<button onClick={onClose}>Okay</button>
			</div>
		</div>
	);
};

export default Popup;
