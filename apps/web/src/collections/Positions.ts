import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Positions: CollectionConfig = {
  slug: 'positions',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'issueTitle',
    defaultColumns: ['issueTitle', 'evidenceType', 'date', 'status'],
  },
  fields: [
    {
      name: 'issueTitle',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'positionSummary',
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'evidenceUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'URL to primary source (speech, Hansard, press release)',
      },
    },
    {
      name: 'evidenceType',
      type: 'select',
      options: ['statement', 'hansard', 'press-release', 'social', 'interview'],
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'agendaTag',
      type: 'relationship',
      relationTo: 'agenda-items',
      admin: {
        description: 'Which of the 12 agenda items this relates to',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      defaultValue: 'draft',
    },
  ],
}
