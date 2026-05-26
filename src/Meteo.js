import { useState, useEffect } from 'react';
import './Meteo.css';
import Previsions from './Previsions';

function Meteo() {
    const [meteo, setMeteo] = useState(null);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        const API_KEY = process.env.REACT_APP_OWM_KEY;

        if (!API_KEY) {
            setErreur("Cle API manquante (.env)");
            return;
        }

        const url =
            `https://api.openweathermap.org/data/2.5/weather`
            + `?q=Dakar&appid=${API_KEY}`
            + `&units=metric&lang=fr`;

        fetch(url)
            .then((r) => {
                if (!r.ok) {
                    throw new Error("Erreur : " + r.status);
                }
                return r.json();
            })
            .then((data) => {
                setMeteo({
                    temperature: Math.round(data.main.temp),
                    description: data.weather[0].description,
                    condition: data.weather[0].main,
                    humidite: data.main.humidity,
                    icone: data.weather[0].icon,
                });
            })
            .catch((err) => setErreur(err.message));
    }, []);

    if (erreur) {
        return (
            <div className="meteo meteo-erreur">
                <p>Meteo indisponible</p>
                <p className="meteo-detail">{erreur}</p>
            </div>
        );
    }

    if (!meteo) {
        return (
            <div className="meteo">
                <p>Chargement météo...</p>
            </div>
        );
    }

    const alerte = getAlerte(meteo.condition);

    function getAlerte(condition) {
        if (condition === "Rain" || condition === "Drizzle") {
            return {
                message: "Pluie detectee - risque de retards",
                classe: "alerte-pluie",
            };
        }

        if (condition === "Thunderstorm") {
            return {
                message: "Orage en cours - soyez prudents",
                classe: "alerte-orage",
            };
        }

        return null;
    }

    return (
        <div className="meteo">
            <div className="meteo-info">
                <img
                    className="meteo-icone"
                    src={`https://openweathermap.org/img/wn/${meteo.icone}.png`}
                    alt="icone meteo"
                />

                <span className="meteo-temp">
                    {meteo.temperature}°C
                </span>

                <span className="meteo-desc">
                    {meteo.description}
                </span>

                <span className="meteo-humidite">
                    Humidité: {meteo.humidite}%
                </span>
            </div>

            {alerte && (
                <div className={`meteo-alerte ${alerte.classe}`}>
                    {alerte.message}
                </div>
            )}
             <Previsions /> 
        </div>
    );
}

export default Meteo;