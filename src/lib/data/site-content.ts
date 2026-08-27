import type { Feature, SiteContent, SiteTeamMember, StackEntry, TeamMember } from './types';

const teamSource = [
	{
		name: 'Cristian',
		username: 'okazakee',
		role: 'Founder / Full-stack',
		github: 'https://github.com/okazakee',
		githubId: 17621558
	},
	{
		name: 'Marco',
		username: 'MarcoBllfr',
		role: 'Mobile Dev',
		github: 'https://github.com/okazakee',
		githubId: 122992858
	},
	{
		name: 'Giulia',
		username: 'hikarii2',
		role: 'Designer UI/UX',
		github: 'https://github.com/hikarii2',
		githubId: 242011098
	}
] satisfies SiteTeamMember[];

const team = teamSource.map(
	(member): TeamMember => ({
		...member,
		avatarSrc: `https://avatars.githubusercontent.com/u/${member.githubId}?v=4&size=128`
	})
);

export const SITE_CONTENT = {
	metadata: {
		title: 'MinePanel - Self-Hosted Minecraft Server Manager',
		tagline: 'Self-hosted Minecraft server management, the right way.',
		description:
			'A single <code>docker compose up</code> brings up the entire stack on your own machine. No external services. No cloud lock-in. Full control.',
		seoDescription:
			'Self-hosted Minecraft server management panel. Run the backend, database, and Minecraft servers on your own hardware with Docker.',
		heroDescription: {
			before: 'A single ',
			command: 'docker-compose up',
			after: ' brings up the stack on your own machine. No cloud lock-in. Full control.'
		}
	},
	githubHref: 'https://github.com/MinePanelProject',
	features: [
		{
			icon: '⚡',
			title: 'One-Command Deploy',
			description:
				'The full stack - backend, database and MC servers - runs on your hardware with a single command. Zero external dependencies.',
			coming: false,
			accent: null
		},
		{
			icon: '🐳',
			title: 'Docker-Native',
			description:
				'Each Minecraft server runs in its own isolated container, controlled through a local Docker socket (rootful by default; rootless via DOCKER_SOCKET).',
			coming: false,
			accent: null
		},
		{
			icon: '🔗',
			title: 'Multi-Backend',
			description:
				'Point the frontend at independent self-hosted backends. CHIPS Partitioned cookies are the primary cross-origin mechanism where supported; the PKCE fallback remains reserved.',
			coming: true,
			accent: 'yellow'
		},
		{
			icon: '🛡️',
			title: 'Role System',
			description:
				'Three roles: ADMIN, MOD, USER. MODs get granular per-server permissions without full admin access - built-in PBAC.',
			coming: false,
			accent: null
		},
		{
			icon: '📡',
			title: 'Real-Time Events',
			description:
				'Host metrics (CPU, RAM, disk) pushed to admins via WebSocket. Live per-server stats, console logs, and player events land in later phases.',
			coming: false,
			accent: null
		},
		{
			icon: '🔒',
			title: 'Security First',
			description:
				'JWT via HttpOnly cookies, rate limiting, Helmet security headers, input validation, and Docker socket guardrails.',
			coming: false,
			accent: null
		},
		{
			icon: '📱',
			title: 'Mobile App',
			description:
				'KMP app for iOS and Android. Not just for admins - players get their own portal: server status, access requests, push notifications, and profile.',
			coming: true,
			accent: 'aqua'
		},
		{
			icon: '👤',
			title: 'Player Portal',
			description:
				'Unlike other MC panels, MinePanel is built for players too. Browse your servers, request access, view your Minecraft profile and playtime - all in one place.',
			coming: true,
			accent: 'yellow'
		}
	] satisfies Feature[],
	stack: [
		{ label: 'TypeScript 5', type: 'lang' },
		{ label: 'NestJS v11', type: 'lang' },
		{ label: 'Bun 1.3', type: 'lang' },
		{ label: 'PostgreSQL 16', type: 'db' },
		{ label: 'Drizzle ORM', type: 'db' },
		{ label: 'Docker / Dockerode', type: 'infra' },
		{ label: 'Caddy (auto-HTTPS)', type: 'infra' },
		{ label: 'JWT · HttpOnly Cookies', type: 'auth' },
		{ label: '2FA · TOTP', type: 'auth' },
		{ label: 'Socket.IO (WebSocket)', type: 'lang' },
		{ label: 'Helmet · Throttler', type: 'auth' },
		{ label: 'RCON via docker exec (rcon-cli)', type: 'infra' },
		{ label: 'GitHub Actions CI/CD', type: 'infra' }
	] satisfies StackEntry[],
	team
} satisfies SiteContent;
