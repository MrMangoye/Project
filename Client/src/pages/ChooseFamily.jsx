import { Link } from "react-router-dom";

export default function ChooseFamily() {
  return (
    <div>
      <h2>No family linked yet</h2>
      <p>Please choose one of the options below:</p>
      <ul>
        <li><Link to="/setup-family">Create a new family</Link></li>
        <li><Link to="/join-family">Join an existing family</Link></li>
        <li>Or ask your family admin to add you</li>
      </ul>
    </div>
  );
}