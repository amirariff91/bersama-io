import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'eventType', 'status'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
    },
    {
      name: 'location',
      type: 'text',
      localized: true,
    },
    {
      name: 'locationUrl',
      type: 'text',
      admin: { description: 'Google Maps link' },
    },
    {
      name: 'eventType',
      type: 'select',
      options: ['ceramah', 'press-conference', 'election', 'other'],
    },
    {
      name: 'isJohorElection',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'status',
      type: 'select',
      options: ['upcoming', 'ongoing', 'past', 'cancelled'],
    },
  ],
}
