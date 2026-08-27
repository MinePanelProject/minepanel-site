import type { Phase, PhaseItem, RoadmapTrack, SiteData } from './types';
import { SITE_CONTENT } from './site-content';
import { BADGE_LABEL, EMPTY_STATE, NORMAL_STATUS } from './fallbacks';

/** Guard helpers for the untyped upstream JSON. */

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asString(v: unknown): string | null {
	return typeof v === 'string' ? v : null;
}


export function normalizeStatus(s: unknown): 'done' | 'wip' | 'planned' | 'future' {
	if (typeof s === 'string' && Object.hasOwn(NORMAL_STATUS, s)) {
		return NORMAL_STATUS[s] as 'done' | 'wip' | 'planned' | 'future';
	}
	return 'planned';
}

export function clampProgress(p: unknown): number | null {
	if (p == null) return null;
	const n = Number(p);
	if (!Number.isFinite(n)) return null;
	return Math.min(100, Math.max(0, n));
}


export function parsePhaseItems(v: unknown): PhaseItem[] {
	if (!Array.isArray(v)) return [];
	const out: PhaseItem[] = [];
	for (const raw of v) {
		if (!isRecord(raw)) continue;
		const text = asString(raw.text);
		if (text === null) continue;
		out.push({ text, done: raw.done === true });
	}
	return out;
}

export function parsePhases(v: unknown): Phase[] {
	if (!Array.isArray(v)) return [];
	const rawPhases: Phase[] = [];
	for (const raw of v) {
		if (!isRecord(raw)) continue;
		const id = asString(raw.id);
		const label = asString(raw.label);
		const name = asString(raw.name);
		const description = asString(raw.description);
		if (id === null || label === null || name === null || description === null) continue;
		const status = normalizeStatus(raw.status);
		rawPhases.push({
			id,
			label,
			name,
			status,
			badge: BADGE_LABEL[status] ?? id,
			description,
			items: parsePhaseItems(raw.items),
			progress: clampProgress(raw.progress),
			progressLabel: asString(raw.progressLabel),
			collapsed: true
		});
	}
	// default collapsed state: wip phases stay open; the first phase right
	// after a completed phase stays open; everything else collapses.
	const isDone = (p: Phase) => p.status === 'done';
	const firstAfterCompleted = rawPhases.findIndex(
		(p, i) => !isDone(p) && i > 0 && isDone(rawPhases[i - 1])
	);
	rawPhases.forEach((p, i) => {
		p.collapsed = p.status !== 'wip' && i !== firstAfterCompleted;
	});
	return rawPhases;
}

function phaseCountText(phases: Phase[] | null): string {
	if (!phases || phases.length === 0) return '[ TBD ]';
	const n = phases.length;
	return '[ ' + n + (n === 1 ? ' PHASE ]' : ' PHASES ]');
}

/**
 * Parse a roadmap envelope ({ updatedAt?, phases? }). Returns phases only
 * when at least one valid phase exists; returns the envelope's own updatedAt.
 * Handles both the current 404 (null) and a future published envelope.
 */
export function parseTrackEnvelope(v: unknown): { phases: Phase[] | null; updatedAt: string | null } {
	if (!isRecord(v)) return { phases: null, updatedAt: null };
	const phases = parsePhases(v.phases);
	return { phases: phases.length > 0 ? phases : null, updatedAt: parseUpdatedAt(v.updatedAt) };
}

export function buildTrack(
	key: RoadmapTrack['key'],
	name: string,
	subtitle: string,
	repoLabel: string,
	empty: { title: string; copy: string },
	phases: Phase[] | null,
	updatedAt: string | null
): RoadmapTrack {
	const hasData = phases !== null && phases.length > 0;
	const sourceNote = hasData
		? updatedAt
			? `[ live data - last updated: ${updatedAt} ]`
			: '[ live roadmap data ]'
		: key === 'backend'
			? '[ roadmap data unavailable ]'
			: '[ public roadmap not published ]';
	return {
		key,
		name,
		subtitle,
		repoLabel,
		emptyTitle: empty.title,
		emptyCopy: empty.copy,
		stateText: phaseCountText(phases),
		sourceNote,
		phases: hasData ? phases : null
	};
}

export function parseUpdatedAt(v: unknown): string | null {
	return asString(v);
}


export function buildSiteData(args: {
	backend: unknown;
	frontend: unknown;
	mobile: unknown;
}): SiteData {
	const backendTrack = parseTrackEnvelope(args.backend);
	const frontendTrack = parseTrackEnvelope(args.frontend);
	const mobileTrack = parseTrackEnvelope(args.mobile);
	const updatedAt = backendTrack.updatedAt;

	return {
		updatedAt,
		content: SITE_CONTENT,
		tracks: [
			buildTrack(
				'backend',
				'Backend',
				'Core API',
				'[ Backend / Core API ]',
				EMPTY_STATE.backend,
				backendTrack.phases,
				updatedAt
			),
			buildTrack(
				'frontend',
				'Web',
				'Dashboard',
				'[ Dashboard / Web ]',
				EMPTY_STATE.frontend,
				frontendTrack.phases,
				frontendTrack.updatedAt
			),
			buildTrack(
				'mobile',
				'Mobile',
				'App',
				'[ Mobile App ]',
				EMPTY_STATE.mobile,
				mobileTrack.phases,
				mobileTrack.updatedAt
			)
		]
	};
}
