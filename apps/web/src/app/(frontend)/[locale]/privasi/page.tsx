import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/metadata'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const isMs = locale === 'ms'
  return buildMetadata({
    title: isMs ? 'Dasar Privasi (PDPA)' : 'Privacy Policy (PDPA)',
    description: isMs
      ? 'Dasar privasi bersama.io — bagaimana kami mengumpul, menggunakan dan melindungi data peribadi anda mengikut PDPA Malaysia.'
      : 'bersama.io privacy policy — how we collect, use and protect your personal data under Malaysia\'s PDPA.',
    locale: isMs ? 'ms' : 'en',
    slug: 'privasi',
  })
}

export default async function PrivasiPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isMs = locale === 'ms'

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-bersama-blue text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {isMs ? 'Dasar Privasi' : 'Privacy Policy'}
          </h1>
          <p className="text-blue-100">
            {isMs ? 'Berkuat kuasa: Jun 2026' : 'Effective: June 2026'}
          </p>
        </div>
      </section>

      {/* Disclaimer banner */}
      <div className="bg-bersama-yellow/20 border-b border-bersama-yellow/40 py-3 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-editorial-dark font-medium">
            ⚠️{' '}
            {isMs
              ? 'bersama.io adalah platform penyokong TIDAK RASMI dan tidak berkaitan dengan Parti Bersama Malaysia atau mana-mana ahlinya.'
              : 'bersama.io is an UNOFFICIAL supporter platform and is not affiliated with Parti Bersama Malaysia or any of its members.'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

        {/* 1. Pengawal Data */}
        <section>
          <h2 className="text-xl font-bold text-editorial-dark mb-4 pb-2 border-b border-gray-200">
            {isMs ? '1. Pengawal Data' : '1. Data Controller'}
          </h2>
          <div className="prose prose-sm text-gray-700 space-y-2">
            <p>
              {isMs
                ? 'Platform ini dikendalikan oleh bersama.io. Pengarang bertanggungjawab: Hazim.'
                : 'This platform is operated by bersama.io. Named editor responsible: Hazim.'}
            </p>
            <p>
              {isMs
                ? 'Untuk sebarang pertanyaan berkaitan privasi, hubungi kami di:'
                : 'For any privacy-related enquiries, contact us at:'}
            </p>
            <p className="font-medium">
              <a href="mailto:privacy@bersama.io" className="text-bersama-blue hover:underline">
                privacy@bersama.io
              </a>
            </p>
          </div>
        </section>

        {/* 2. Data yang dikumpul */}
        <section>
          <h2 className="text-xl font-bold text-editorial-dark mb-4 pb-2 border-b border-gray-200">
            {isMs ? '2. Data yang Kami Kumpul' : '2. Data We Collect'}
          </h2>
          <div className="space-y-4 text-gray-700 text-sm">
            <p>{isMs ? 'Kami mengumpul data berikut:' : 'We collect the following data:'}</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold border border-gray-200">
                    {isMs ? 'Data' : 'Data'}
                  </th>
                  <th className="text-left p-3 font-semibold border border-gray-200">
                    {isMs ? 'Wajib?' : 'Required?'}
                  </th>
                  <th className="text-left p-3 font-semibold border border-gray-200">
                    {isMs ? 'Tujuan' : 'Purpose'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { data: isMs ? 'Alamat e-mel' : 'Email address', req: isMs ? 'Ya' : 'Yes', purpose: isMs ? 'Penghantaran surat berita' : 'Newsletter delivery' },
                  { data: isMs ? 'Nama (pilihan)' : 'Name (optional)', req: isMs ? 'Tidak' : 'No', purpose: isMs ? 'Pemperibadian sapaan' : 'Personalised greeting' },
                  { data: isMs ? 'Hash IP (tidak boleh nyah-anonymize)' : 'IP hash (non-reversible)', req: isMs ? 'Automatik' : 'Automatic', purpose: isMs ? 'Audit keselamatan & anti-spam' : 'Security audit & anti-spam' },
                  { data: isMs ? 'Teks persetujuan' : 'Consent text', req: isMs ? 'Automatik' : 'Automatic', purpose: isMs ? 'Pematuhan PDPA' : 'PDPA compliance' },
                  { data: isMs ? 'Tarikh langganan' : 'Subscription date', req: isMs ? 'Automatik' : 'Automatic', purpose: isMs ? 'Rekod audit' : 'Audit record' },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 border border-gray-200">{row.data}</td>
                    <td className="p-3 border border-gray-200">{row.req}</td>
                    <td className="p-3 border border-gray-200">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 italic">
              {isMs
                ? '* Kami TIDAK mengumpul nombor kad pengenalan (IC), nombor telefon, atau data kewangan.'
                : '* We do NOT collect IC numbers, phone numbers, or financial data.'}
            </p>
          </div>
        </section>

        {/* 3. Tujuan pemprosesan */}
        <section>
          <h2 className="text-xl font-bold text-editorial-dark mb-4 pb-2 border-b border-gray-200">
            {isMs ? '3. Tujuan Pemprosesan Data' : '3. Data Processing Purposes'}
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li>{isMs ? 'Penghantaran surat berita dan kemaskini platform' : 'Newsletter delivery and platform updates'}</li>
            <li>{isMs ? 'Penambahbaikan platform (analitik agregat, bukan individu)' : 'Platform improvement (aggregate analytics, not individual tracking)'}</li>
            <li>{isMs ? 'Keselamatan dan pencegahan penipuan' : 'Security and fraud prevention'}</li>
            <li>{isMs ? 'Pematuhan undang-undang Malaysia (PDPA 2010)' : 'Compliance with Malaysian law (PDPA 2010)'}</li>
          </ul>
        </section>

        {/* 4. Pihak ketiga */}
        <section>
          <h2 className="text-xl font-bold text-editorial-dark mb-4 pb-2 border-b border-gray-200">
            {isMs ? '4. Perkongsian dengan Pihak Ketiga' : '4. Third-Party Sharing'}
          </h2>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              {isMs
                ? 'Data anda mungkin diproses oleh pembekal perkhidmatan berikut:'
                : 'Your data may be processed by the following service providers:'}
            </p>
            {[
              { name: 'Resend', location: isMs ? 'Amerika Syarikat' : 'United States', purpose: isMs ? 'Penghantaran e-mel transaksional' : 'Transactional email delivery', url: 'https://resend.com/privacy' },
              { name: 'Listmonk', location: isMs ? 'Pelayan sendiri (Singapura)' : 'Self-hosted (Singapore)', purpose: isMs ? 'Pengurusan senarai surat berita' : 'Newsletter list management', url: null },
              { name: 'OneSignal', location: isMs ? 'Amerika Syarikat' : 'United States', purpose: isMs ? 'Notifikasi push web & aplikasi' : 'Web & app push notifications', url: 'https://onesignal.com/privacy_policy' },
              { name: 'Google Analytics 4', location: isMs ? 'Amerika Syarikat' : 'United States', purpose: isMs ? 'Analitik trafik web (data dianonim)' : 'Web traffic analytics (data anonymised)', url: 'https://policies.google.com/privacy' },
              { name: 'Microsoft Clarity', location: isMs ? 'Amerika Syarikat' : 'United States', purpose: isMs ? 'Analitik pengalaman pengguna' : 'User experience analytics', url: 'https://privacy.microsoft.com/privacystatement' },
            ].map((provider) => (
              <div key={provider.name} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-editorial-dark">{provider.name}</span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-xs text-gray-500">{provider.location}</span>
                  </div>
                  {provider.url && (
                    <a href={provider.url} target="_blank" rel="noopener noreferrer" className="text-xs text-bersama-blue hover:underline flex-shrink-0">
                      {isMs ? 'Dasar privasi' : 'Privacy policy'}
                    </a>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{provider.purpose}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Pemindahan rentas sempadan */}
        <section>
          <h2 className="text-xl font-bold text-editorial-dark mb-4 pb-2 border-b border-gray-200">
            {isMs ? '5. Pemindahan Data Rentas Sempadan' : '5. Cross-Border Data Transfer'}
          </h2>
          <div className="text-gray-700 text-sm space-y-3">
            <p>
              {isMs
                ? 'Sesetengah pembekal perkhidmatan kami beroperasi di luar Malaysia (terutamanya Amerika Syarikat). Dengan melanggan, anda secara eksplisit bersetuju data anda dipindahkan dan diproses di luar Malaysia.'
                : 'Some of our service providers operate outside Malaysia (primarily the United States). By subscribing, you explicitly consent to your data being transferred to and processed outside Malaysia.'}
            </p>
            <p>
              {isMs
                ? 'Persetujuan ini didapatkan semasa pendaftaran melalui borang langganan surat berita kami, selaras dengan Seksyen 129 Akta Perlindungan Data Peribadi 2010 (PDPA).'
                : 'This consent is obtained at registration via our newsletter subscription form, in line with Section 129 of the Personal Data Protection Act 2010 (PDPA).'}
            </p>
          </div>
        </section>

        {/* 6. Tempoh penyimpanan */}
        <section>
          <h2 className="text-xl font-bold text-editorial-dark mb-4 pb-2 border-b border-gray-200">
            {isMs ? '6. Tempoh Penyimpanan Data' : '6. Data Retention Period'}
          </h2>
          <div className="text-gray-700 text-sm space-y-3">
            <p>
              {isMs
                ? 'Data anda disimpan selagi anda aktif sebagai pelanggan surat berita. Proses pemadaman adalah seperti berikut:'
                : 'Your data is retained as long as you are an active newsletter subscriber. The deletion process is as follows:'}
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>{isMs ? '2 tahun tanpa aktiviti → notis pemadaman dihantar ke e-mel anda' : '2 years of inactivity → deletion notice sent to your email'}</li>
              <li>{isMs ? '30 hari untuk bertindak balas kepada notis' : '30 days to respond to the notice'}</li>
              <li>{isMs ? 'Tiada respons → data dipadam secara kekal' : 'No response → data permanently deleted'}</li>
            </ol>
            <p>
              {isMs
                ? 'Anda boleh meminta pemadaman data pada bila-bila masa dengan menghubungi privacy@bersama.io.'
                : 'You may request data deletion at any time by contacting privacy@bersama.io.'}
            </p>
          </div>
        </section>

        {/* 7. Hak pengguna */}
        <section>
          <h2 className="text-xl font-bold text-editorial-dark mb-4 pb-2 border-b border-gray-200">
            {isMs ? '7. Hak Anda' : '7. Your Rights'}
          </h2>
          <div className="text-gray-700 text-sm space-y-3">
            <p>{isMs ? 'Di bawah PDPA 2010, anda berhak untuk:' : 'Under PDPA 2010, you have the right to:'}</p>
            <ul className="list-disc list-inside space-y-2">
              <li>{isMs ? 'Akses data peribadi yang kami simpan tentang anda' : 'Access personal data we hold about you'}</li>
              <li>{isMs ? 'Pembetulan data yang tidak tepat' : 'Correction of inaccurate data'}</li>
              <li>{isMs ? 'Pemadaman data anda' : 'Deletion of your data'}</li>
              <li>{isMs ? 'Menarik balik persetujuan pada bila-bila masa' : 'Withdraw consent at any time'}</li>
            </ul>
            <p>
              {isMs
                ? 'Untuk menggunakan mana-mana hak ini, e-mel kami di:'
                : 'To exercise any of these rights, email us at:'}
            </p>
            <p>
              <a href="mailto:privacy@bersama.io" className="text-bersama-blue font-medium hover:underline">
                privacy@bersama.io
              </a>
            </p>
          </div>
        </section>

        {/* 8. Kuki */}
        <section>
          <h2 className="text-xl font-bold text-editorial-dark mb-4 pb-2 border-b border-gray-200">
            {isMs ? '8. Kuki (Cookies)' : '8. Cookies'}
          </h2>
          <div className="text-gray-700 text-sm space-y-2">
            <p>
              {isMs
                ? 'Kami menggunakan kuki analitik (GA4, Microsoft Clarity) untuk memahami cara pengguna berinteraksi dengan platform kami. Kuki ini tidak mengenal pasti individu secara peribadi.'
                : 'We use analytics cookies (GA4, Microsoft Clarity) to understand how users interact with our platform. These cookies do not personally identify individuals.'}
            </p>
          </div>
        </section>

        {/* Footer note */}
        <div className="bg-gray-100 rounded-xl p-6 text-sm text-gray-600">
          <p className="font-semibold text-editorial-dark mb-2">
            {isMs ? 'Penafian Penting' : 'Important Disclaimer'}
          </p>
          <p>
            {isMs
              ? 'bersama.io adalah platform penyokong yang dikendalikan secara bebas oleh peminat Parti Bersama Malaysia. Kami TIDAK berkaitan dengan parti, pemimpin, atau mana-mana entiti rasminya. Sebarang keputusan politik atau kenyataan di sini adalah pandangan penyokong, bukan pendirian rasmi parti.'
              : 'bersama.io is a supporter platform independently operated by fans of Parti Bersama Malaysia. We are NOT affiliated with the party, its leaders, or any of its official entities. Any political opinions or statements here are supporter views, not the party\'s official position.'}
          </p>
          <p className="mt-3 text-xs text-gray-400">
            {isMs ? 'Dikemas kini: Jun 2026' : 'Last updated: June 2026'}
          </p>
        </div>
      </div>
    </main>
  )
}
