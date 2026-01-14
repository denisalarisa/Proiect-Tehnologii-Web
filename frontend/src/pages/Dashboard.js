import React, { useState } from 'react';
import api from '../api/axios';

function normalizareNota(text) {
  //se accepta si "9,5" -> "9.5"
  return String(text || '').trim().replace(',', '.');
}

function notaValida(text) {
  const t = normalizareNota(text);

  // maxim 2 zecimale
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return { ok: false, msg: "Nota trebuie sa aiba maxim 2 zecimale (ex: 9.25)." };

  const x = Number(t);
  if (!Number.isFinite(x)) return { ok: false, msg: "Nota nu este un numar valid." };
  if (x < 1 || x > 10) return { ok: false, msg: "Nota trebuie sa fie intre 1 si 10." };

  return { ok: true, val: x };
}

function Dashboard() {
  const [studentId, setStudentId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [myProjects, setMyProjects] = useState([]);

  const [openLivrabilId, setOpenLivrabilId] = useState(null);
  const [notaText, setNotaText] = useState("");

  const [livTitlu, setLivTitlu] = useState("");
  const [livLink, setLivLink] = useState("");
  const [livProiectId, setLivProiectId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [msgOk, setMsgOk] = useState("");
  const [msgErr, setMsgErr] = useState("");

  const curataMesaje = () => { setMsgOk(""); setMsgErr(""); };

  const incarcaTot = async () => {
    curataMesaje();
    if (!studentId) {
      setMsgErr("Introdu un ID de student ca sa incarcam sarcinile.");
      return;
    }

    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        api.get(`/my-tasks/${studentId}`),
        api.get(`/projects`)
      ]);

      setTasks(Array.isArray(tRes.data) ? tRes.data : []);

      // proiectele mele = creator_id == studentId
      const toate = Array.isArray(pRes.data) ? pRes.data : [];
      const aleMele = toate.filter(p => String(p.creator_id) === String(studentId));
      setMyProjects(aleMele);

      setMsgOk("Date incarcate. Notele sunt anonime (nu se afiseaza identitatea juriului).");
    } catch (e) {
      setMsgErr("Eroare la incarcare. Verifica backend-ul si ID-ul.");
    } finally {
      setLoading(false);
    }
  };

  const trimiteNota = async (livrabilId) => {
    curataMesaje();

    const v = notaValida(notaText);
    if (!v.ok) {
      setMsgErr(v.msg);
      return;
    }

    try {
      await api.post('/grades', {
        student_id: studentId,
        livrabil_id: livrabilId,
        valoare: normalizareNota(notaText)
      });

      setMsgOk("Nota a fost trimisa cu succes. (Anonim)");
      setNotaText("");
      setOpenLivrabilId(null);
    } catch (e) {
      const mesaj = e?.response?.data?.error || "Nu s-a putut trimite nota.";
      setMsgErr(mesaj);
    }
  };

  const adaugaLivrabil = async () => {
    curataMesaje();
    if (!livProiectId) {
      setMsgErr("Alege un proiect pentru care vrei sa adaugi livrabil.");
      return;
    }
    if (!livTitlu.trim() || !livLink.trim()) {
      setMsgErr("Completeaza titlul livrabilului si link-ul (video/server).");
      return;
    }

    try {
      await api.post('/deliverables', {
        proiect_id: livProiectId,
        titlu: livTitlu.trim(),
        video_link: livLink.trim()
      });

      setMsgOk("Livrabil adaugat. Juriul se aloca automat in backend.");
      setLivTitlu("");
      setLivLink("");
      setLivProiectId(null);

      // refresh la lista proiectelor mele ca sa vezi livrabilul
      const pRes = await api.get('/projects');
      const toate = Array.isArray(pRes.data) ? pRes.data : [];
      const aleMele = toate.filter(p => String(p.creator_id) === String(studentId));
      setMyProjects(aleMele);
    } catch (e) {
      setMsgErr("Eroare la adaugare livrabil.");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="h1">Pagina de start</h1>
        <p className="p">
          Introdu ID-ul tau de student. Vei vedea sarcinile unde esti selectat in juriu
          si proiectele tale.
        </p>

        {msgOk && <div className="alert alertOk">{msgOk}</div>}
        {msgErr && <div className="alert alertErr">{msgErr}</div>}

        <div className="card">
          <h2 className="cardTitle">Identificare</h2>
          <div className="fieldRow">
            <div className="field">
              <label>ID student</label>
              <input
                className="input"
                type="number"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="ex: 2 sau 3 etc."
              />
            </div>

            <button className="btn btnPrimary" onClick={incarcaTot} disabled={loading}>
              {loading ? "Se incarca..." : "Afiseaza"}
            </button>

            <span className="badge">
              Notare: 1-10 
            </span>
          </div>
        </div>

        <div className="grid2" style={{ marginTop: 14 }}>
         
          <div className="card">
            <h2 className="cardTitle">Proiecte alocate pentru jurizare</h2>
            <p className="p" style={{ marginTop: -4 }}>
              Poti acorda nota doar daca ai fost selectat in juriu pentru proiect.
            </p>

            {tasks.length === 0 ? (
              <div className="alert">
                Dupa ce incarci datele, aici apar sarcinile tale.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {tasks.map(t => {
                  const proiect = t?.livrabil?.proiect;
                  const liv = t?.livrabil;

                  return (
                    <div key={t.jury_id} className="card" style={{ padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 800 }}>{proiect?.titlu || "Proiect"}</div>
                          <div style={{ color: "var(--muted)", fontSize: 13 }}>
                            Proiect: <b>{liv?.titlu || "-"}</b>
                          </div>
                        </div>
                        <span className="badge badgeStrong">Juriu</span>
                      </div>

                      <hr className="sep" />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <a className="btn btnGhost btnSmall"
                           href={liv?.video_link || "#"}
                           target="_blank"
                           rel="noreferrer"
                        >
                          Deschide link
                        </a>

                        <button
                          className="btn btnPrimary btnSmall"
                          onClick={() => setOpenLivrabilId(openLivrabilId === t.livrabil_id ? null : t.livrabil_id)}
                        >
                          {openLivrabilId === t.livrabil_id ? "Inchide" : "Acorda nota"}
                        </button>
                      </div>

                      {openLivrabilId === t.livrabil_id && (
                        <div style={{ marginTop: 12 }}>
                          <div className="fieldRow">
                            <div className="field" style={{ minWidth: 180 }}>
                              <label>Nota (1-10)</label>
                              <input
                                className="input"
                                type="text"
                                value={notaText}
                                onChange={(e) => setNotaText(e.target.value)}
                                placeholder="ex: 9.25"
                              />
                            </div>

                            <button className="btn btnPrimary" onClick={() => trimiteNota(t.livrabil_id)}>
                              Trimite
                            </button>
                          </div>

                          <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 12 }}>
                            Tip: poti scrie si cu virgula (ex: 9,5). Nota e anonima.
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          
          <div className="card">
            <h2 className="cardTitle">Proiectele mele</h2>
            <p className="p" style={{ marginTop: -4 }}>
              Aici apar proiectele create de tine. Poti adauga proiecte (video/server).
            </p>

            {myProjects.length === 0 ? (
              <div className="alert">
                Nu ai proiecte (sau nu ai incarcat datele). Daca ai creat un proiect, va aparea aici.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {myProjects.map(p => {
                  const lista = p.livrabils || p.livrabile || [];
                  return (
                    <div key={p.proiect_id} className="card" style={{ padding: 14 }}>
                      <div style={{ fontWeight: 800 }}>{p.titlu}</div>
                      <div style={{ color: "var(--muted)", fontSize: 13 }}>{p.descriere}</div>

                      <hr className="sep" />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span className="badge">Proiecte: {lista.length}</span>
                        <button
                          className="btn btnGhost btnSmall"
                          onClick={() => setLivProiectId(p.proiect_id)}
                        >
                          Selecteaza pentru proiect
                        </button>
                      </div>

                      {lista.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Titlu proiect</th>
                                <th>Link</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lista.map(l => (
                                <tr key={l.livrabil_id}>
                                  <td>{l.titlu}</td>
                                  <td>
                                    <a href={l.video_link} target="_blank" rel="noreferrer">
                                      {l.video_link}
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <hr className="sep" />

        
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
