import type { CollectionConfig, PayloadRequest } from 'payload'

export const Members: CollectionConfig = {
  slug: 'members',
  access: {
    read: ({ req }: { req: PayloadRequest }) => Boolean(req.user),
    create: ({ req }: { req: PayloadRequest }) => Boolean(req.user), // Only internal server-side via getPayload()
    update: ({ req }: { req: PayloadRequest }) => Boolean(req.user),
    delete: ({ req }: { req: PayloadRequest }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'subscribedAt', 'isActive'],
    description: 'PDPA: Access restricted to authenticated admins only.',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'subscribedAt',
      type: 'date',
    },
    {
      name: 'consentText',
      type: 'textarea',
      admin: {
        description: 'Exact consent text shown to user at signup — PDPA requirement',
      },
    },
    {
      name: 'ipHash',
      type: 'text',
      admin: { description: 'SHA-256 hash of IP — never store raw IP' },
    },
    {
      name: 'listmonkId',
      type: 'number',
      admin: { description: 'Listmonk subscriber ID for sync' },
    },
    {
      name: 'language',
      type: 'select',
      options: ['ms', 'en'],
      defaultValue: 'ms',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
