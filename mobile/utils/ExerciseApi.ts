const BASE_URL = "https://exercisedb.p.rapidapi.com";

export type ApiExercise = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
};

type SearchConfig = {
  endpoint: "name" | "target" | "bodyPart";
  value: string;
};

const normalize = (input: string) =>
  input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getSearchConfig = (input: string): SearchConfig => {
  const clean = normalize(input);

  const map: Record<string, SearchConfig> = {
    pecho: { endpoint: "bodyPart", value: "chest" },
    pectoral: { endpoint: "bodyPart", value: "chest" },
    pectorales: { endpoint: "bodyPart", value: "chest" },

    espalda: { endpoint: "bodyPart", value: "back" },
    dorsal: { endpoint: "bodyPart", value: "back" },
    dorsales: { endpoint: "bodyPart", value: "back" },

    hombro: { endpoint: "bodyPart", value: "shoulders" },
    hombros: { endpoint: "bodyPart", value: "shoulders" },

    cuadriceps: { endpoint: "target", value: "quads" },
    cuadricep: { endpoint: "target", value: "quads" },
    quads: { endpoint: "target", value: "quads" },

    femoral: { endpoint: "target", value: "hamstrings" },
    femorales: { endpoint: "target", value: "hamstrings" },
    isquios: { endpoint: "target", value: "hamstrings" },

    gluteo: { endpoint: "target", value: "glutes" },
    gluteos: { endpoint: "target", value: "glutes" },

    biceps: { endpoint: "target", value: "biceps" },
    triceps: { endpoint: "target", value: "triceps" },

    abdominales: { endpoint: "target", value: "abs" },
    abdomen: { endpoint: "target", value: "abs" },

    pantorrilla: { endpoint: "target", value: "calves" },
    pantorrillas: { endpoint: "target", value: "calves" },
    gemelos: { endpoint: "target", value: "calves" },

    sentadilla: { endpoint: "name", value: "squat" },
    squat: { endpoint: "name", value: "squat" },
    banca: { endpoint: "name", value: "bench" },
    banco: { endpoint: "name", value: "bench" },
    press: { endpoint: "name", value: "press" },
    muerto: { endpoint: "name", value: "deadlift" },
    peso_muerto: { endpoint: "name", value: "deadlift" },
  };

  return map[clean] ?? { endpoint: "name", value: clean };
};

export async function fetchExercisesSmart(input: string): Promise<ApiExercise[]> {
  const apiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY!;
  const config = getSearchConfig(input);

  const path =
    config.endpoint === "name"
      ? `/exercises/name/${encodeURIComponent(config.value)}`
      : config.endpoint === "target"
        ? `/exercises/target/${encodeURIComponent(config.value)}`
        : `/exercises/bodyPart/${encodeURIComponent(config.value)}`;

  const url = `${BASE_URL}${path}?rapidapi-key=${apiKey}&limit=20`;

  const res = await fetch(url);

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt);
  }

  return res.json();
}