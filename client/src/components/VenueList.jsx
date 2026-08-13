import { Link } from "react-router-dom";

// Shared by HomePage and AdminHomePage — identical markup, the only
// difference is where a queue link points (join flow vs admin dashboard).
const VenueList = ({ venues, linkPrefix }) => (
  <div className="venue-list">
    {venues.map((venue) => (
      <div key={venue._id} className="venue-card">
        <h2>{venue.name}</h2>
        <p className="venue-location">{venue.location}</p>
        <ul className="queue-list">
          {venue.queues.map((queue) => (
            <li key={queue._id} className="queue-list-item">
              <Link to={`${linkPrefix}/${queue._id}`}>{queue.name}</Link>
              <span className={queue.isActive ? "badge badge-active" : "badge badge-inactive"}>
                {queue.isActive ? `${queue.queueLength} waiting` : "closed"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

export default VenueList;
