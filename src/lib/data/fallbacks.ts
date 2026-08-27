/** Exact empty-state copy from the original site — source of truth. */
export const EMPTY_STATE = {
	backend: {
		title: '[ ROADMAP DATA UNAVAILABLE ]',
		copy: 'The Backend / Core API roadmap could not be loaded. Refresh to try again.'
	},
	frontend: {
		title: '[ ROADMAP COMING SOON ]',
		copy: 'Public Dashboard / Web milestones have not been published yet.'
	},
	mobile: {
		title: '[ ROADMAP COMING SOON ]',
		copy: 'Public Mobile App milestones have not been published yet.'
	}
} as const;

export const BADGE_LABEL: Record<string, string> = {
	done: 'Completed',
	wip: 'In Progress',
	planned: 'Planned',
	future: 'Future'
};

export const NORMAL_STATUS: Record<string, string> = {
	completed: 'done',
	done: 'done',
	wip: 'wip',
	planned: 'planned',
	future: 'future'
};

