const baseUrl = (process.env.ODONTOTRACK_BASE_URL ?? "https://odonto-track.vercel.app").replace(/\/$/, "");

async function request(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  return { status: response.status, location: response.headers.get("location"), body: await response.text() };
}

const login = await request("/login");
if (login.status !== 200) throw new Error(`Login deveria responder 200, recebeu ${login.status}.`);
for (const text of ["Entrar no OdontoTrack", "Enviar link de acesso", "Continuar com Google"]) {
  if (!login.body.includes(text)) throw new Error(`Login publicado não expõe a ação esperada: ${text}.`);
}

const health = await request("/api/health");
if (health.status !== 200) throw new Error(`Health deveria responder 200, recebeu ${health.status}.`);

for (const path of ["/area", "/area/revisoes", "/area/cursos"]) {
  const response = await request(path);
  if (response.status !== 307 || response.location !== "/login") {
    throw new Error(`${path} precisa proteger a sessão e redirecionar para /login; recebeu ${response.status} ${response.location ?? "sem Location"}.`);
  }
}

console.log(`Production auth smoke passed for ${baseUrl}: login, Google/magic-link affordances, health and protected routes.`);
