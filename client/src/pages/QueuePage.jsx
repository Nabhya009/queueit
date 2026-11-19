import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getQueueStatus, joinQueue, leaveQueue } from "../services/api";

// Polling instead of WebSocket: a few seconds of delay on position/ETA is
// acceptable, and polling needs no extra library or open connection.
const POLL_INTERVAL_MS = 5000;

const QueuePage = () => {
  const { id } = useParams();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getQueueStatus(id);
      setStatus(data);
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
      await fetchStatus();
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
  }, [fetchStatus]);

  const handleJoin = async () => {
    setActionPending(true);
    try {
      await joinQueue(id);
      await fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionPending(false);
    }
  };

  const handleLeave = async () => {
    setActionPending(true);
    try {
      await leaveQueue(id);
      await fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionPending(false);
    }
  };

  if (loading) {
    return <p className="status-message">Loading queue...</p>;
  }
  if (error && !status) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="page centered">
      <h1>{status.name}</h1>
      {error && <p className="error-message">{error}</p>}

      {!status.you && (
        <div className="queue-panel">
          <p>{status.isActive ? `${status.queueLength} people waiting.` : "This queue is currently closed."}</p>
          <button type="button" disabled={!status.isActive || actionPending} onClick={handleJoin}>
            {actionPending ? "Joining..." : "Join Queue"}
          </button>
        </div>
      )}

      {status.you?.status === "waiting" && (
        <div className="queue-panel">
          <p className="token-number">Token #{status.you.tokenNumber}</p>
          <p>Position in line: {status.you.position}</p>
          <p>Estimated wait: {Math.round(status.you.eta / 60)} min</p>
          <button type="button" disabled={actionPending} onClick={handleLeave}>
            {actionPending ? "Leaving..." : "Leave Queue"}
          </button>
        </div>
      )}

      {status.you && status.you.status !== "waiting" && (
        <div className="queue-panel">
          <p>
            Your last ticket (#{status.you.tokenNumber}) was <strong>{status.you.status}</strong>.
          </p>
          <button type="button" disabled={!status.isActive || actionPending} onClick={handleJoin}>
            {actionPending ? "Joining..." : "Join Again"}
          </button>
        </div>
      )}

      <Link to="/">Back to venues</Link>
    </div>
  );
};

export default QueuePage;
