export interface WeatherResult {
  temperature: number;
  rainChanceNext3h: number;
  description: string;
  fetchedAt: number;
}

interface CacheEntry {
  result: WeatherResult;
  at: number;
}

const CACHE_TTL = 10 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

function describeCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snowfall';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export async function fetchWeather(
  lat: number,
  lng: number,
  spotId: string
): Promise<WeatherResult> {
  const cached = cache.get(spotId);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return cached.result;
  }

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,precipitation,weather_code` +
    `&hourly=precipitation_probability` +
    `&forecast_days=1&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather request failed');
  const data = await res.json();

  const temperature: number = data.current?.temperature_2m ?? 0;
  const weatherCode: number = data.current?.weather_code ?? 0;
  const description = describeCode(weatherCode);

  const hourlyProb: number[] = data.hourly?.precipitation_probability ?? [];
  const nowIdx = data.current?.time
    ? Math.max(
        0,
        (data.hourly?.time ?? []).indexOf(data.current.time)
      )
    : 0;
  const next3 = hourlyProb.slice(nowIdx, nowIdx + 3).filter(
    (v) => typeof v === 'number'
  );
  const rainChanceNext3h =
    next3.length > 0
      ? Math.round(Math.max(...next3))
      : 0;

  const result: WeatherResult = {
    temperature: Math.round(temperature),
    rainChanceNext3h,
    description,
    fetchedAt: Date.now(),
  };

  cache.set(spotId, { result, at: Date.now() });
  return result;
}

export type SurfaceCondition = 'Surface likely dry' | 'Damp' | 'Wet';

export function judgeSurface(
  weather: WeatherResult,
  shelter: 'Open' | 'Partly covered' | 'Covered'
): SurfaceCondition {
  const rain = weather.rainChanceNext3h;
  if (shelter === 'Covered') {
    if (rain >= 80) return 'Damp';
    return 'Surface likely dry';
  }
  if (shelter === 'Partly covered') {
    if (rain >= 70) return 'Wet';
    if (rain >= 40) return 'Damp';
    return 'Surface likely dry';
  }
  if (rain >= 60) return 'Wet';
  if (rain >= 30) return 'Damp';
  return 'Surface likely dry';
}
