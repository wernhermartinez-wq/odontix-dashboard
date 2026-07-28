/**
 * nexaro.ts — Cliente para el VPS Nexaro (PostgREST)
 *
 * NO usa una clave estática. El JWT que autoriza contra PostgREST se obtiene
 * dinámicamente en cada sesión intercambiando el access_token de Supabase por
 * un token propio del VPS, vía la Edge Function `nexaro-token`
 * (ver supabase/functions/nexaro-token/). El JWT secret de Supabase nunca
 * llega a este cliente ni al VPS — mitigación del hallazgo C1 de la
 * auditoría de seguridad (secreto compartido entre dos dominios de confianza).
 *
 * Configurar en Vercel → Environment Variables:
 *   VITE_NEXARO_URL = https://api.odontix.eu (PostgREST del VPS)
 *
 * ESTADO: activar cuando el VPS tenga PostgREST + la Edge Function
 * nexaro-token desplegados (Fase 1).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

const nexaroUrl = import.meta.env.VITE_NEXARO_URL as string | undefined;

// Margen de refresco: pedir un token nuevo si al actual le queda menos de esto
const REFRESH_MARGIN_MS = 60_000;

let cachedToken: string | null = null;
let cachedTokenExpiresAt = 0; // epoch ms

/**
 * Intercambia la sesión activa de Supabase por un token del VPS (de vida
 * corta, ~15 min) llamando a la Edge Function nexaro-token. Devuelve null
 * si no hay sesión de Supabase activa (usuario no logueado).
 */
async function exchangeForNexaroToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return null;
  }

  const { data, error } = await supabase.functions.invoke<{ nexaro_token: string; expires_in: number }>(
    'nexaro-token',
  );

  if (error || !data?.nexaro_token) {
    console.error('[nexaro] No se pudo obtener token del VPS:', error);
    return null;
  }

  cachedToken = data.nexaro_token;
  cachedTokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

/** Devuelve un token del VPS válido, refrescándolo si está por expirar. */
async function getValidNexaroToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedTokenExpiresAt - REFRESH_MARGIN_MS) {
    return cachedToken;
  }
  return exchangeForNexaroToken();
}

/** Limpia el token cacheado — llamar al cerrar sesión. */
export function clearNexaroToken(): void {
  cachedToken = null;
  cachedTokenExpiresAt = 0;
}

/**
 * fetch que inyecta el token del VPS (no el de Supabase) en cada request
 * a PostgREST, refrescándolo automáticamente cuando hace falta.
 */
async function nexaroFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await getValidNexaroToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

// El segundo argumento de createClient (apikey) no es relevante para
// PostgREST puro — la autorización real va por el header Authorization,
// inyectado dinámicamente en nexaroFetch.
export const nexaro: SupabaseClient | null = nexaroUrl
  ? createClient(nexaroUrl, 'not-used-postgrest-ignores-apikey', {
      global: { fetch: nexaroFetch },
      auth: { persistSession: false },
    })
  : null;

if (!nexaro && import.meta.env.DEV) {
  console.warn(
    '[nexaro] VPS Nexaro no configurado. ' +
    'Agrega VITE_NEXARO_URL en .env.local para conectar al VPS.',
  );
}

/**
 * Helper: obtiene el cliente activo para datos de plataforma (admin).
 * Prioriza nexaro (VPS) si está disponible, fallback a supabase.
 * Eliminar el fallback cuando la migración esté completa.
 */
export function getNexaroOrSupabase(supabaseFallback: SupabaseClient): SupabaseClient {
  return nexaro ?? supabaseFallback;
}
