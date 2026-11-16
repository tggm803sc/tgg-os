const MAX_EDGE = 1080;

function scaled(width: number, height: number) {
  const longest = Math.max(width, height) || MAX_EDGE;
  const scale = Math.min(1, MAX_EDGE / longest);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function captureVideoFrame(
  video: HTMLVideoElement,
  filterCss: string,
  mirror: boolean,
): string | null {
  const sourceWidth = video.videoWidth || 720;
  const sourceHeight = video.videoHeight || 1280;
  const { width, height } = scaled(sourceWidth, sourceHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.save();
  if (mirror) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  if (filterCss && filterCss !== 'none') ctx.filter = filterCss;
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.82);
}

export async function fileToSnap(file: File, filterCss: string): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = scaled(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  if (filterCss && filterCss !== 'none') ctx.filter = filterCss;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.82);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  let line = '';
  let cursor = y;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, cursor);
      line = word;
      cursor += lineHeight;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, cursor);
}

/** Builds a poster-style placeholder photo so the crew's snaps look lived-in offline. */
export function syntheticSnap(opts: { kicker: string; title: string; hue: number }): string {
  const width = 720;
  const height = 1280;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, `hsl(${opts.hue} 72% 24%)`);
  base.addColorStop(0.55, `hsl(${(opts.hue + 36) % 360} 84% 52%)`);
  base.addColorStop(1, `hsl(${(opts.hue + 82) % 360} 64% 10%)`);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width * 0.74, height * 0.26, 8, width * 0.74, height * 0.26, width * 0.9);
  glow.addColorStop(0, 'rgba(255,255,255,0.46)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const pool = ctx.createRadialGradient(width * 0.2, height * 0.78, 20, width * 0.2, height * 0.78, width * 0.8);
  pool.addColorStop(0, 'rgba(0,0,0,0.42)');
  pool.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = pool;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 1500; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.07})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
  }

  const shade = ctx.createLinearGradient(0, height * 0.45, 0, height);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.72)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, height * 0.45, width, height * 0.55);

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = '700 30px Archivo, system-ui, sans-serif';
  ctx.fillText(opts.kicker.toUpperCase(), 56, height * 0.52);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 96px Archivo, system-ui, sans-serif';
  wrapText(ctx, opts.title.toUpperCase(), 56, height * 0.52 + 108, width - 112, 104);

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '600 24px Archivo, system-ui, sans-serif';
  ctx.fillText('TGG SNAP', 56, height - 56);

  return canvas.toDataURL('image/jpeg', 0.8);
}
