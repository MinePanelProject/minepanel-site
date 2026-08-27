import type { Feature, Phase, PhaseItem, RoadmapTrack, SiteData, StackEntry, TeamMember } from './types';
import { BADGE_LABEL, EMPTY_STATE, FEATURE_ACCENT, NORMAL_STATUS, STACK_TYPES } from './fallbacks';

/** Guard helpers for the untyped upstream JSON. */

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asString(v: unknown): string | null {
	return typeof v === 'string' ? v : null;
}

/** Validate a GitHub URL — https: only, exact github.com host. */
export function isSafeGitHubUrl(v: unknown): v is string {
	if (typeof v !== 'string') return false;
	try {
		const u = new URL(v);
		return u.protocol === 'https:' && u.hostname === 'github.com';
	} catch {
		return false;
	}
}

/** Validate a GitHub username — letters, digits, hyphen; 1-39 chars. */
export function isValidUsername(v: unknown): v is string {
	return typeof v === 'string' && /^[a-zA-Z0-9-]{1,39}$/.test(v);
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

export function parseFeatures(v: unknown): Feature[] {
	if (!Array.isArray(v)) return [];
	const out: Feature[] = [];
	for (const raw of v) {
		if (!isRecord(raw)) continue;
		const icon = asString(raw.icon);
		const title = asString(raw.title);
		const description = asString(raw.description);
		if (icon === null || title === null || description === null) continue;
		const color = asString(raw.color);
		out.push({
			icon,
			title,
			description,
			coming: raw.coming === true,
			accent: color !== null && Object.hasOwn(FEATURE_ACCENT, color) ? FEATURE_ACCENT[color] : null
		});
	}
	return out;
}

export function parseStack(v: unknown): StackEntry[] {
	if (!Array.isArray(v)) return [];
	const out: StackEntry[] = [];
	for (const raw of v) {
		if (!isRecord(raw)) continue;
		const label = asString(raw.label);
		if (label === null) continue;
		const type = asString(raw.type);
		out.push({
			label,
			type: type !== null && Object.hasOwn(STACK_TYPES, type) ? STACK_TYPES[type] : null
		});
	}
	return out;
}

const GITHUB_AVATAR_IDS: Record<string, number> = {
	okazakee: 17621558,
	MarcoBllfr: 122992858,
	hikarii2: 242011098
};

export function parseTeam(v: unknown): TeamMember[] {
	if (!Array.isArray(v)) return [];
	const out: TeamMember[] = [];
	for (const raw of v) {
		if (!isRecord(raw)) continue;
		const name = asString(raw.name);
		if (name === null) continue;
		const role = asString(raw.role) ?? '';
		const username = asString(raw.username);
		const github = asString(raw.github);
		const validUser = username !== null && isValidUsername(username);
		const validLink = github !== null && isSafeGitHubUrl(github);
		const sourceGithubId =
			typeof raw.githubId === 'number' && Number.isSafeInteger(raw.githubId) && raw.githubId > 0
				? raw.githubId
				: null;
		const githubId =
			sourceGithubId ??
			(validUser && username !== null && Object.hasOwn(GITHUB_AVATAR_IDS, username)
				? GITHUB_AVATAR_IDS[username]
				: null);
		// Original contract: link + avatar only when BOTH a valid username and
		// a safe GitHub URL exist. Otherwise the card renders as a non-link
		// placeholder (the username text may still be shown).
		const both = validUser && validLink;
		out.push({
			name,
			username: validUser ? username : null,
			role,
			github: both ? github : null,
			githubId: both ? githubId : null,
			avatarSrc: both
				? githubId !== null
					? `https://avatars.githubusercontent.com/u/${githubId}?v=4&size=128`
					: `https://avatars.githubusercontent.com/${username}?size=128`
				: null
		});
	}
	return out;
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

export function parseGithubHref(v: unknown, fallback: string): string {
	if (typeof v === 'string' && isSafeGitHubUrl(v)) return v;
	return fallback;
}

export function buildSiteData(args: {
	backend: unknown;
	frontend: unknown;
	mobile: unknown;
	fallbackGithub: string;
}): SiteData {
	const backendRec = isRecord(args.backend) ? args.backend : null;
	const updatedAt = backendRec ? parseUpdatedAt(backendRec.updatedAt) : null;
	const meta = backendRec && isRecord(backendRec.meta) ? backendRec.meta : null;
	const githubHref = parseGithubHref(meta?.github ?? null, args.fallbackGithub);

	const backendTrack = parseTrackEnvelope(args.backend);
	const frontendTrack = parseTrackEnvelope(args.frontend);
	const mobileTrack = parseTrackEnvelope(args.mobile);

	return {
		updatedAt,
		features: backendRec ? parseFeatures(backendRec.features) : [],
		stack: backendRec ? parseStack(backendRec.techStack) : [],
		team: backendRec ? parseTeam(backendRec.team) : [],
		githubHref,
		tracks: [
			buildTrack(
				'backend',
				'Backend',
				'Core API',
				'[ Backend / Core API ]',
				EMPTY_STATE.backend,
				backendTrack.phases,
				backendTrack.updatedAt ?? updatedAt
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
