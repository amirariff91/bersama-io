import type { CollectionConfig, PayloadRequest } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Articles: CollectionConfig = {
  slug: 'articles',
  access: {
    read: () => true,
    create: ({ req }: { req: PayloadRequest }) => Boolean(req.user),
    update: ({ req }: { req: PayloadRequest }) => Boolean(req.user),
    delete: ({ req }: { req: PayloadRequest }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'publishedAt', 'status'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly slug (e.g. rafizi-johor-speech)',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: { description: 'Max 2 sentences for RSS display' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      admin: { description: 'Author name for Google News byline' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: ['berita', 'analisis', 'agenda', 'johor', 'lain-lain'],
    },
    {
      name: 'agendaTag',
      type: 'relationship',
      relationTo: 'agenda-items',
      hasMany: true,
      admin: { description: 'For policy thread tracking' },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isGoogleNews',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Include in Google News sitemap' },
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published', 'archived'],
      defaultValue: 'draft',
    },
  ],
}
