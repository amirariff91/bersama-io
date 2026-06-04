/**
 * Seed script — run with: bun scripts/seed.ts  (loads apps/web/.env.local)
 * Idempotent: skips records that already exist by slug/email.
 * Booting getPayload in dev also pushes the schema to the database.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { agendaItems } from '../src/data/agenda-seed'

async function main() {
  const payload = await getPayload({ config })

  // 1) Admin user — never seed a known/default credential. Require an explicit
  // password via env so this is safe to run against any DATABASE_URL.
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@bersama.io'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  if (existingUsers.totalDocs === 0) {
    if (!adminPassword || adminPassword.length < 12) {
      throw new Error(
        'SEED_ADMIN_PASSWORD is required (min 12 chars) to create the first admin user. ' +
          'Set it in the environment before running the seed.',
      )
    }
    await payload.create({
      collection: 'users',
      data: { email: adminEmail, password: adminPassword, name: 'Bersama Admin', role: 'admin' },
    })
    console.log(`✓ admin user created: ${adminEmail}`)
  } else {
    console.log('• admin user already exists, skipping')
  }

  // 2) Site settings global — ensure a default exists with campaign lock off
  try {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: { campaignPeriodLock: false } as Record<string, unknown>,
    })
    console.log('✓ site-settings ensured (campaignPeriodLock: false)')
  } catch (e) {
    console.warn('• site-settings update skipped:', (e as Error).message)
  }

  // 3) 12 agenda items (localized: create in ms, then patch en)
  let created = 0
  let skipped = 0
  for (const item of agendaItems) {
    const existing = await payload.find({
      collection: 'agenda-items',
      where: { slug: { equals: item.slug } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      skipped++
      continue
    }
    const doc = await payload.create({
      collection: 'agenda-items',
      locale: 'ms',
      data: {
        number: item.number,
        slug: item.slug,
        icon: item.icon,
        status: 'published',
        title: item.titleMs,
        summary: item.summaryMs,
      },
    })
    await payload.update({
      collection: 'agenda-items',
      id: doc.id,
      locale: 'en',
      data: {
        title: item.titleEn,
        summary: item.summaryEn,
      },
    })
    created++
  }
  console.log(`✓ agenda items: ${created} created, ${skipped} skipped`)

  console.log('Seed complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
