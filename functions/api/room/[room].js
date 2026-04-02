/**
 * Cloudflare Pages Function
 * Route: /api/room/:room
 *
 * Requires a KV binding named TEAMMAKER_KV (set in Cloudflare Pages -> Settings -> Functions -> KV bindings).
 */
export async function onRequest(context) {
  const { request, params, env } = context;
  const roomRaw = params.room || "";
  const room = String(roomRaw).toLowerCase();

  // Basic validation to prevent weird keys.
  if (!/^[a-z0-9_-]{1,40}$/.test(room)) {
    return json({ error: "invalid_room" }, 400);
  }

  const kv = env.TEAMMAKER_KV;
  if (!kv) {
    return json({ error: "kv_not_bound" }, 500);
  }

  const key = `room:${room}`;
  const method = request.method.toUpperCase();

  if (method === "GET") {
    const existing = await kv.get(key, "json");
    if (!existing) {
      // Default empty state; rev starts at 0.
      return json({ rev: 0, state: null }, 200);
    }
    return json(existing, 200);
  }

  if (method === "PUT") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    const incomingRev = typeof body?.rev === "number" ? body.rev : null;
    const incomingState = body?.state ?? null;

    // Load current
    const current = (await kv.get(key, "json")) || { rev: 0, state: null };
    const currentRev = typeof current.rev === "number" ? current.rev : 0;

    // Optimistic concurrency: if client is behind, reject with current.
    if (incomingRev !== null && incomingRev !== currentRev) {
      return json({ error: "rev_conflict", current }, 409);
    }

    const next = {
      rev: currentRev + 1,
      state: incomingState,
      updatedAt: new Date().toISOString(),
    };

    // KV values are capped in size; keep payload lean.
    const serialized = JSON.stringify(next);
    if (serialized.length > 900_000) {
      return json({ error: "payload_too_large" }, 413);
    }

    await kv.put(key, serialized);
    return json({ ok: true, rev: next.rev }, 200);
  }

  return json({ error: "method_not_allowed" }, 405);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

