import type { CollectionConfig } from 'payload'

export const NewsItems: CollectionConfig = {
  slug: 'news-items',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sourceName', 'publishedAt', 'isVisible'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Max 2 sentences — never full article text (copyright)',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      required: true,
      admin: { description: 'Original article URL — always link out' },
    },
    {
      name: 'sourceName',
      type: 'text',
      required: true,
      admin: { description: "e.g. 'Free Malaysia Today', 'Malay Mail'" },
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
    {
      name: 'agendaTags',
      type: 'relationship',
      relationTo: 'agenda-items',
      hasMany: true,
    },
    {
      name: 'language',
      type: 'select',
      options: ['ms', 'en'],
      defaultValue: 'ms',
    },
    {
      name: 'isVisible',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide without deleting' },
    },
    {
      name: 'syncedAt',
      type: 'date',
      admin: { description: 'When this was fetched from RSS' },
    },
  ],
}
