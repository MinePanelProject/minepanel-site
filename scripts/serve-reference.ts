/**
 * Serves the untouched root index.html (the pixel-perfect reference) on
 * http://127.0.0.1:8099 so the parity suite can compare it against the
 * migrated Pages output.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = 8099;

const server = createServer(async (req, res) => {
	try {
		const url = new URL(req.url ?? '/', 'http://localhost');
		let path = url.pathname === '/' ? '/index.html' : url.pathname;
		// serve only the known root assets; everything else 404s
		const file = resolve(root, `.${path}`);
		if (!file.startsWith(root)) {
			res.writeHead(403);
			res.end();
			return;
		}
		const body = await readFile(file);
		const ext = path.split('.').pop() ?? '';
		const types = {
			html: 'text/html; charset=utf-8',
			png: 'image/png',
			svg: 'image/svg+xml',
			js: 'text/javascript',
			md: 'text/plain'
		};
		res.writeHead(200, { 'content-type': types[ext] ?? 'application/octet-stream' });
		res.end(body);
	} catch {
		res.writeHead(404);
		res.end('not found');
	}
});

server.listen(PORT, '127.0.0.1', () => {
	process.stdout.write(`reference server on http://127.0.0.1:${PORT}\n`);
});
