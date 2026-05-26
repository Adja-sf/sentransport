import { useState, useEffect } from 'react';
import './Previsions.css';

function Previsions() {
  const [jours, setJours] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const API_KEY = process.env.REACT_APP_OWM_KEY;
    if (!API_KEY) {
      setErreur('Clé API manquante (.env)');
      return;
    }

    const url =
      `https://api.openweathermap.org/data/2.5/forecast`
      + `?q=Dakar&appid=${API_KEY}`
      + `&units=metric&lang=fr&cnt=24`;

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('Erreur : ' + r.status);
        return r.json();
      })
      .then(data => {
        // On garde une seule entrée par jour (midi = 12:00:00)
        const parJour = {};
        data.list.forEach(item => {
          const date = item.dt_txt.split(' ')[0];
          const heure = item.dt_txt.split(' ')[1];
          if (!parJour[date] || heure === '12:00:00') {
            parJour[date] = item;
          }
        });

        // On prend les 3 prochains jours (sans aujourd'hui)
        const today = new Date().toISOString().split('T')[0];
        const resultat = Object.entries(parJour)
          .filter(([date]) => date > today)
          .slice(0, 3)
          .map(([date, item]) => ({
            date,
            temp: Math.round(item.main.temp),
            description: item.weather[0].description,
            icone: item.weather[0].icon,
            humidite: item.main.humidity,
          }));

        setJours(resultat);
      })
      .catch(err => setErreur(err.message));
  }, []);

  function formaterDate(dateStr) {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  if (erreur) return null; // si erreur, on n'affiche rien (météo = bonus)
  if (jours.length === 0) return null;

  return (
    <div className="previsions">
      <h3 className="previsions-titre">Prévisions 3 prochains jours</h3>
      <div className="previsions-liste">
        {jours.map(jour => (
          <div key={jour.date} className="prevision-carte">
            <p className="prevision-date">{formaterDate(jour.date)}</p>
            <img
              src={`https://openweathermap.org/img/wn/${jour.icone}@2x.png`}
              alt={jour.description}
              className="prevision-icone"
            />
            <p className="prevision-temp">{jour.temp}°C</p>
            <p className="prevision-desc">{jour.description}</p>
            <p className="prevision-humidite">💧 {jour.humidite}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Previsions;