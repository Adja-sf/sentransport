import { useState, useEffect } from 'react';
import './App.css';

import Header from './Header';
import Recherche from './Recherche';
import Meteo from './Meteo';
import SignalerIncident from './SignalerIncident';
import LigneBus from './LigneBus';
import DetailLigne from './DetailLigne';
import Carte from './Carte';
import Footer from './Footer';

function App() {
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [ligneSelectionnee, setLigneSelectionnee] = useState(null);

  function chargerLignes() {
    setChargement(true);
    setErreur(null);

    fetch("http://localhost:5000/lignes")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur serveur : " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        setLignes(data);
        setChargement(false);
      })
      .catch((error) => {
        setErreur(error.message);
        setChargement(false);
      });
  }

  useEffect(() => {
    chargerLignes();
  }, []);

  function handleClickLigne(ligne) {
    if (ligneSelectionnee && ligneSelectionnee.id === ligne.id) {
      setLigneSelectionnee(null);
      return;
    }

    fetch(`http://localhost:5000/lignes/${ligne.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ligne introuvable");
        }
        return response.json();
      })
      .then((data) => {
        setLigneSelectionnee(data);
      })
      .catch((error) => {
        console.error("Erreur chargement détail :", error.message);
      });
  }

  const q = recherche.toLowerCase();

  const lignesFiltrees = lignes.filter((l) =>
    (l.depart || "").toLowerCase().includes(q) ||
    (l.arrivee || "").toLowerCase().includes(q) ||
    String(l.numero || "").includes(recherche)
  );

  if (chargement) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <p className="message-chargement">Chargement des lignes...</p>
        </main>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <div className="message-erreur">
            <p>Impossible de charger les lignes.</p>
            <p className="erreur-detail">{erreur}</p>
            <p>Vérifiez que le serveur Flask est lancé.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />

      <main className="contenu">
        <Meteo />

        <Recherche valeur={recherche} onChange={setRecherche} />

        <button className="btn-recharger" onClick={chargerLignes}>
          🔄 Recharger
        </button>

        <p className="resultat-recherche">
          {lignesFiltrees.length} ligne
          {lignesFiltrees.length > 1 ? "s" : ""} trouvée
          {lignesFiltrees.length > 1 ? "s" : ""}
        </p>

        {lignesFiltrees.length === 0 ? (
          <p className="aucun-resultat">
            Aucune ligne trouvée pour "{recherche}"
          </p>
        ) : (
          lignesFiltrees.map((ligne) => (
            <LigneBus
              key={ligne.id}
              numero={ligne.numero}
              depart={ligne.depart}
              arrivee={ligne.arrivee}
              arrets={ligne.arrets}
              estSelectionnee={
                ligneSelectionnee && ligneSelectionnee.id === ligne.id
              }
              onClick={() => handleClickLigne(ligne)}
            />
          ))
        )}

        {ligneSelectionnee && (
          <DetailLigne ligne={ligneSelectionnee} />
        )}

        <Carte />
        <SignalerIncident />
      </main>

      <Footer />
    </div>
  );
}

export default App;