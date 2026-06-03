import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    {
      name: 'campaignPeriodLock',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'ELECTION LAW: When enabled — ID card generation disabled, merch store suspended, Johor hub shows electoral disclaimer. Enable ONLY during formal campaign period.',
      },
    },
    { name: 'siteTitle', type: 'text', defaultValue: 'bersama.io' },
    { name: 'tagline', type: 'text', defaultValue: 'Suara Penyokong, Bebas & Berani' },
    { name: 'liveElectionMode', type: 'checkbox', defaultValue: false },
    { name: 'johorElectionDate', type: 'date' },
  ],
}
