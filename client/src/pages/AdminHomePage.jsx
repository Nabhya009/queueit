import { useEffect, useState } from "react";
import { getVenues } from "../services/api";
import VenueList from "../components/VenueList";

const AdminHomePage = () => {
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVenues()
      .then(setVenues)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="status-message">Loading venues...</p>;
  }
  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="page">
      <h1>Admin — Venues</h1>
      {venues.length === 0 && <p className="status-message">No venues yet.</p>}
      <VenueList venues={venues} linkPrefix="/admin/queues" />
    </div>
  );
};

export default AdminHomePage;
