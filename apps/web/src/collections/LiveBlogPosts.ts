import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const LiveBlogPosts: CollectionConfig = {
  slug: 'live-blog-posts',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'seat',
    defaultColumns: ['content', 'type', 'seat', 'postedAt', 'isApproved'],
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'type',
      type: 'select',
      options: ['update', 'result', 'commentary', 'correction'],
      defaultValue: 'update',
    },
    {
      name: 'seat',
      type: 'text',
      admin: { description: 'Johor seat name if result-specific' },
    },
    {
      name: 'postedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'isApproved',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Must be approved by second admin before publishing',
      },
    },
  ],
}
