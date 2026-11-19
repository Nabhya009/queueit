import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAdminQueueDetail, serveNext, skipNext, togglePause } from "../services/api";

// Polling, same interval as QueuePage (see the note there on polling vs WebSocket).
const POLL_INTERVAL_MS = 5000;

const AdminQueuePage = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const data = await getAdminQueueDetail(id);
      setDetail(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  // tick() is an async wrapper so the effect body has no synchronous setState.
  // `cancelled` stops setLoading from firing after the page is left.
  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      await fetchDetail();
      if (!cancelled) {
        setLoading(false);
      }
    };

    tick();
    const intervalId = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [fetchDetail]);

  const runAction = async (action) => {
    setActionPending(true);
    try {
      await action(id);
      await fetchDetail();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionPending(false);
    }
  };

  if (loading) {
    return <p className="status-message">Loading queue...</p>;
  }
  if (error && !detail) {
    return <p className="error-message">{error}</p>;
  }

  const hasWaiting = detail.waitingList.length > 0;

  return (
    <div className="page">
      <h1>{detail.name}</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="queue-panel">
        <p>Now serving: {detail.nowServing || "—"}</p>
        <p>{detail.isActive ? (detail.isPaused ? "Paused" : "Active") : "Closed"}</p>
        <div className="admin-actions">
          <button type="button" disabled={!hasWaiting || actionPending} onClick={() => runAction(serveNext)}>
            Serve Next
          </button>
          <button type="button" disabled={!hasWaiting || actionPending} onClick={() => runAction(skipNext)}>
            Skip Next
          </button>
          <button type="button" disabled={actionPending} onClick={() => runAction(togglePause)}>
            {detail.isPaused ? "Resume Queue" : "Pause Queue"}
          </button>
        </div>
      </div>

      <h2>Waiting ({detail.waitingList.length})</h2>
      {!hasWaiting && <p className="status-message">No one is waiting.</p>}
      {hasWaiting && (
        <table className="viewer-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Token</th>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {detail.waitingList.map((entry, index) => (
              <tr key={entry.tokenNumber}>
                <td>{index + 1}</td>
                <td>{entry.tokenNumber}</td>
                <td>{entry.name}</td>
                <td>{entry.email}</td>
                <td>{new Date(entry.joinedAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link to="/admin">Back to admin venues</Link>
    </div>
  );
};

export default AdminQueuePage;
