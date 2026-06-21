const BASE_URL = "https://exercisedb.p.rapidapi.com";

async function fetchExercisesByMuscle(muscle: string) {
  const apiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY!;
  
  const url = `${BASE_URL}/exercises?bodyPart=${muscle}&rapidapi-key=${apiKey}&limit=10`;

  const res = await fetch(url);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(text);
  }

  return JSON.parse(text);
}