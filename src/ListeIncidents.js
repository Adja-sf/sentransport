import { useState, useEffect } from 'react';
import './ListeIncidents.css';

function ListeIncidents({ refresh }) {
  const [incidents, setIncidents] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    setChargement(true);
    fetch('http://localhost:5000/incidents')
      .then(r => {
        if (!r.ok) throw new Error('Erreur serveur : ' + r.status);
        return r.json();
      })
      .then(data => {
        setIncidents(data);
        setChargement(false);
      })
      .catch(err => {
        setErreur(err.message);
        setChargement(false);
      });
  }, [refresh]);

  if (chargement) return <div className="liste-incidents">Chargement...</div>;
  if (erreur) return <div className="liste-incidents liste-erreur">Erreur : {erreur}</div>;

  return (
    <div className="liste-incidents">
      <h2 className="liste-titre">Incidents signalés</h2>
      {incidents.length === 0 ? (
        <p className="liste-vide">Aucun incident signalé pour l'instant.</p>
      ) : (
        <ul className="liste">
          {incidents.map(inc => (
            <li key={inc.id} className="incident-item">
              <div className="incident-header">
                <span className="incident-badge">Ligne {inc.ligne}</span>
                <span className="incident-id">#{inc.id}</span>
              </div>
              <p className="incident-desc">{inc.description}</p>
              <p className="incident-lieu">📍 {inc.lieu}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListeIncidents;