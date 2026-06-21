const BASE_URL = "https://exercisedb.p.rapidapi.com";

export type ApiExercise = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
};

// Busca ejercicios por nombre en ExerciseDB (RapidAPI).
export async function fetchExercisesByName(
  searchWord: string,
): Promise<ApiExercise[]> {
  const apiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY!;
  const url = `${BASE_URL}/exercises/name/${encodeURIComponent(
    searchWord,
  )}?rapidapi-key=${apiKey}&limit=10`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt);
  }
  return res.json();
}
