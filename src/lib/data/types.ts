export interface Feature {
	icon: string;
	title: string;
	description: string;
	coming: boolean;
	/** 'aqua' | 'yellow' only; anything else is neutral */
	accent: 'aqua' | 'yellow' | null;
}

export interface StackEntry {
	label: string;
	/** 'lang' | 'db' | 'infra' | 'auth' only; anything else is untyped */
	type: string | null;
}

export interface SiteTeamMember {
	name: string;
	username: string;
	role: string;
	github: string;
	githubId: number;
}

export interface TeamMember extends SiteTeamMember {
	/** dynamically loaded GitHub avatar URL */
	avatarSrc: string;
}
export interface SiteMetadata {
	title: string;
	tagline: string;
	description: string;
	seoDescription: string;
	heroDescription: {
		before: string;
		command: string;
		after: string;
	};
}

export interface SiteContent {
	metadata: SiteMetadata;
	githubHref: string;
	features: Feature[];
	stack: StackEntry[];
	team: TeamMember[];
}

export interface PhaseItem {
	text: string;
	done: boolean;
}

export type PhaseStatus = 'done' | 'wip' | 'planned' | 'future';

export interface Phase {
	id: string;
	label: string;
	name: string;
	status: PhaseStatus;
	badge: string;
	description: string;
	items: PhaseItem[];
	progress: number | null;
	progressLabel: string | null;
	collapsed: boolean;
}

export interface RoadmapTrack {
	key: 'backend' | 'frontend' | 'mobile';
	name: string;
	subtitle: string;
	repoLabel: string;
	emptyTitle: string;
	emptyCopy: string;
	/** phase count text, e.g. '[ 6 PHASES ]' or '[ TBD ]' */
	stateText: string;
	/** source note text shown when this tab is active */
	sourceNote: string;
	/** null = render empty state */
	phases: Phase[] | null;
}

export interface SiteData {
	updatedAt: string | null;
	content: SiteContent;
	tracks: RoadmapTrack[];
}

