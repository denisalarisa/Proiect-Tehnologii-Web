import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

function NewProject() {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState("");
  const [titlu, setTitlu] = useState("");
  const [descriere, setDescriere] = useState("");

  const [livrabile, setLivrabile] = useState([
    { titlu: "Proiect Initial", video_link: "" }
  ]);

  const [loading, setLoading] = useState(false);
  const [msgOk, setMsgOk] = useState("");
  const [msgErr, setMsgErr] = useState("");

  const curataMesaje = () => { setMsgOk(""); setMsgErr(""); };

  const schimbaLivrabil = (idx, camp, valoare) => {
    const copie = [...livrabile];
    copie[idx] = { ...copie[idx], [camp]: valoare };
    setLivrabile(copie);
  };

  const adaugaRand = () => {
    setLivrabile([...livrabile, { titlu: "Livrabil Nou", video_link: "" }]);
  };

  const stergeRand = (idx) => {
    const copie = livrabile.filter((_, i) => i !== idx);
    setLivrabile(copie.length > 0 ? copie : [{ titlu: "Livrabil Initial", video_link: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    curataMesaje();

    if (!studentId || !titlu.trim()) {
      setMsgErr("Completeaza ID-ul tau si titlul proiectului.");
      return;
    }

    // minim 1 livrabil cu link
    const ok = livrabile.some(l => (l.video_link || "").trim().length > 0);
    if (!ok) {
      setMsgErr("Adauga macar un livrabil cu link (video/server).");
      return;
    }

    setLoading(true);
    try {
      // 1) creare proiect
      const proiectRes = await api.post('/projects', {
        titlu: titlu.trim(),
        descriere: descriere.trim(),
        creator_id: studentId
      });

      const proiectId = proiectRes.data.proiect_id;

      // 2) creare livrabile (fiecare adaugare aloca automat juriu in backend)
      for (const l of livrabile) {
        if (!(l.video_link || "").trim()) continue;

        await api.post('/deliverables', {
          proiect_id: proiectId,
          titlu: (l.titlu || "Livrabil").trim(),
          video_link: l.video_link.trim()
        });
      }

      setMsgOk("Proiect creat + livrabile adaugate. Juriul se aloca automat.");
      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      setMsgErr("Eroare la crearea proiectului.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="h1">Adauga proiect</h1>
        <p className="p">
          Aici poti adauga un proiect si o serie de materiale.
        </p>

        {msgOk && <div className="alert alertOk">{msgOk}</div>}
        {msgErr && <div className="alert alertErr">{msgErr}</div>}

        <div className="card">
          <h2 className="cardTitle">Date proiect</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid2">
              <div className="field">
                <label>ID-ul tau de student</label>
                <input className="input" type="number" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="ex: 1" />
              </div>

              <div className="field">
                <label>Titlu proiect</label>
                <input className="input" value={titlu} onChange={(e) => setTitlu(e.target.value)} placeholder="ex: Proiect Web - Spark" />
              </div>
            </div>

            <div className="field" style={{ marginTop: 10 }}>
              <label>Descriere</label>
              <textarea value={descriere} onChange={(e) => setDescriere(e.target.value)} placeholder="Descriere scurta..." />
            </div>

            <hr className="sep" />

            <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>Proiecte</h3>
            <div className="alert" style={{ marginBottom: 12 }}>
              Tip: fiecare proiect pe care il creezi declanseaza alocarea automata a juriului.
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {livrabile.map((l, idx) => (
                <div key={idx} className="card" style={{ padding: 14 }}>
                  <div className="grid2">
                    <div className="field">
                      <label>Titlu Proiect</label>
                      <input
                        className="input"
                        value={l.titlu}
                        onChange={(e) => schimbaLivrabil(idx, "titlu", e.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Link video / server</label>
                      <input
                        className="input"
                        value={l.video_link}
                        onChange={(e) => schimbaLivrabil(idx, "video_link", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, gap: 10, flexWrap: "wrap" }}>
                    <span className="badge">Rand #{idx + 1}</span>
                    <button type="button" className="btn btnDanger btnSmall" onClick={() => stergeRand(idx)}>
                      Sterge
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <button type="button" className="btn btnGhost" onClick={adaugaRand}>
                + Adauga proiect
              </button>

              <button type="submit" className="btn btnPrimary" disabled={loading}>
                {loading ? "Se creeaza..." : "Creeaza proiect"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewProject;
