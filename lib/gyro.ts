// Shared device-orientation source. One window listener fans out to every
// Tilt card and the Cover parallax, so the whole page reacts to the phone
// being tilted as a single coherent 3D scene. iOS 13+ needs an explicit
// permission grant from a user gesture — enableGyro() is called from the
// Cover "Open" tap.

type Orientation = { beta: number; gamma: number };
type Listener = (o: Orientation) => void;

const listeners = new Set<Listener>();
let started = false;

function handle(e: DeviceOrientationEvent) {
  const beta = e.beta ?? 0; // front-back tilt, degrees
  const gamma = e.gamma ?? 0; // left-right tilt, degrees
  for (const l of listeners) l({ beta, gamma });
}

function start() {
  if (started || typeof window === "undefined") return;
  if (!("DeviceOrientationEvent" in window)) return;
  started = true;
  window.addEventListener("deviceorientation", handle, true);
}

/** Subscribe to orientation updates. Returns an unsubscribe fn. */
export function subscribeGyro(cb: Listener): () => void {
  listeners.add(cb);
  start();
  return () => {
    listeners.delete(cb);
  };
}

/** Request gyro permission (iOS) from a user gesture, then begin streaming. */
export async function enableGyro(): Promise<void> {
  if (typeof window === "undefined") return;
  const D = window.DeviceOrientationEvent as
    | (typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<"granted" | "denied">;
      })
    | undefined;
  if (D && typeof D.requestPermission === "function") {
    try {
      await D.requestPermission();
    } catch {
      /* denied or unavailable — pointer tilt still works */
    }
  }
  start();
}
