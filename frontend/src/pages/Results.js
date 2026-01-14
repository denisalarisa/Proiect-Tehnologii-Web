import React, { useEffect, useState } from 'react';
import api from '../api/axios';

function esteNumar(x) {
  const n = Number(x);
  return Number.isFinite(n);
}

function Results() {
  const [items, setItems] = useState([]);
  const [openProjectId, setOpenProjectId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      setErr("");
      setLoading(true);

      try {
        const res = await api.get('/projects');
        const proiecte = Array.isArray(res.data) ? res.data : [];

        // pentru fiecare proiect, calculam rezultate pe livrabile
        const complete = await Promise.all(proiecte.map(async (p) => {
          const livs = p.livrabils || p.livrabile || [];

          const rezultateLiv = await Promise.all(livs.map(async (l) => {
            try {
              const r = await api.get(`/results/${l.livrabil_id}`);
              return {
                livrabil_id: l.livrabil_id,
                titlu: l.titlu,
                video_link: l.video_link,
                media_finala: r.data.media_finala,
                note_eliminate: r.data.note_eliminate || null,
                message: r.data.message || ""
              };
            } catch {
              return {
                livrabil_id: l.livrabil_id,
                titlu: l.titlu,
                video_link: l.video_link,
                media_finala: "N/A",
                note_eliminate: null,
                message: "In asteptare"
              };
            }
          }));

          // media proiectului = media mediilor livrabilelor care sunt numere
          const numeric = rezultateLiv
            .map(x => x.media_finala)
            .filter(m => esteNumar(m))
            .map(m => Number(m));

          const mediaProiect = numeric.length > 0
            ? (numeric.reduce((a,b) => a+b, 0) / numeric.length).toFixed(2)
            : "N/A";

          return {
            proiect_id: p.proiect_id,
            titlu: p.titlu,
            descriere: p.descriere,
            nr_livrabile: livs.length,
            media_proiect: mediaProiect,
            livrabile: rezultateLiv
          };
        }));

        // sortare (cele cu media sus, N/A jos)
        complete.sort((a, b) => {
          const an = esteNumar(a.media_proiect) ? Number(a.media_proiect) : -1;
          const bn = esteNumar(b.media_proiect) ? Number(b.media_proiect) : -1;
          return bn - an;
        });

        setItems(complete);
      } catch (e) {
        setErr("Nu pot incarca proiectele. Verifica backend-ul.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <h1 className="h1">Clasament / Rezultate</h1>
        <p className="p">
          Media finala se calculeaza excluzand cea mai mare si cea mai mica nota (cand exista minim 3 note).
        </p>

        {loading && <div className="alert">Se incarca...</div>}
        {err && <div className="alert alertErr">{err}</div>}

        {!loading && !err && (
          <div className="card">
            <h2 className="cardTitle">Clasament proiecte</h2>

            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Proiect</th>
                  <th>Livrabile</th>
                  <th>Media proiect</th>
                  <th>Detalii</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p, idx) => (
                  <tr key={p.proiect_id}>
                    <td style={{ width: 50 }}><b>{idx + 1}</b></td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{p.titlu}</div>
                      <div style={{ color: "var(--muted)", fontSize: 13 }}>{p.descriere}</div>
                    </td>
                    <td><span className="badge">{p.nr_livrabile}</span></td>
                    <td>
                      <span className={"badge " + (esteNumar(p.media_proiect) ? "badgeStrong" : "")}>
                        {p.media_proiect}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btnGhost btnSmall"
                        onClick={() => setOpenProjectId(openProjectId === p.proiect_id ? null : p.proiect_id)}
                      >
                        {openProjectId === p.proiect_id ? "Ascunde" : "Arata"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {openProjectId && (
              <div style={{ marginTop: 14 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>Detalii livrabile</h3>

                {items
                  .find(x => x.proiect_id === openProjectId)
                  ?.livrabile?.length ? (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Livrabil</th>
                          <th>Media</th>
                          <th>Note eliminate</th>
                          <th>Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.find(x => x.proiect_id === openProjectId).livrabile.map(l => (
                          <tr key={l.livrabil_id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{l.titlu}</div>
                              {l.message && <div style={{ color: "var(--muted)", fontSize: 12 }}>{l.message}</div>}
                            </td>
                            <td>
                              <span className={"badge " + (esteNumar(l.media_finala) ? "badgeStrong" : "")}>
                                {l.media_finala}
                              </span>
                            </td>
                            <td>
                              {l.note_eliminate ? (
                                <span className="badge">
                                  min {l.note_eliminate[0]} / max {l.note_eliminate[1]}
                                </span>
                              ) : (
                                <span className="badge">-</span>
                              )}
                            </td>
                            <td>
                              <a href={l.video_link} target="_blank" rel="noreferrer">
                                deschide
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="alert">
                      Proiectul nu are livrabile.
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Results;
