import type { Graph } from 'schema-dts';
import { MINEPANEL_REPOSITORIES, SITE_CONTENT, SITE_URL } from './site-content';

export const STRUCTURED_DATA: Graph = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'WebSite',
			'@id': `${SITE_URL}/#website`,
			url: `${SITE_URL}/`,
			name: 'MinePanel',
			description: SITE_CONTENT.metadata.seoDescription,
			inLanguage: 'en'
		},
		{
			'@type': 'SoftwareApplication',
			'@id': `${SITE_URL}/#software`,
			name: 'MinePanel',
			url: `${SITE_URL}/`,
			description: SITE_CONTENT.metadata.seoDescription,
			applicationCategory: 'DeveloperApplication',
			applicationSubCategory: 'Minecraft server management',
			operatingSystem: 'Linux',
			isAccessibleForFree: true,
			license: 'https://opensource.org/license/mit/',
		}
	]
};
