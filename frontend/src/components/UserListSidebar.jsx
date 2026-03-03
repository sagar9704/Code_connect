import React from "react";

const UserListSidebar = ({ users }) => {
  return (
    <div className="user-sidebar">
      <h4>Participants</h4>
      <ul>
        {users.map((u, i) => (
          <li key={i}>
            <span className={`status ${u.online ? "online" : "offline"}`}></span>
            {u.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserListSidebar;
