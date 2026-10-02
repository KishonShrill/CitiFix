import type { Metadata } from "next";
import Link from "next/link";
import { FileText, AlertTriangle, CheckCircle2, Ban } from "lucide-react";
import TopNav from "@/components/terms-and-privacy/TopNav";

export const metadata: Metadata = {
    title: "Terms and Conditions",
    description: "Read the Terms and Conditions for using CitiFIX BetterIligan, a civic infrastructure reporting platform by BetterGov.",
    openGraph: {
        title: "Terms and Conditions | CitiFIX BetterIligan",
        description: "Official Terms and Conditions for the CitiFIX BetterIligan civic reporting application.",
    },
};

export default function TermsPage() {
    const effectiveDate = "October 2, 2026";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            {/* Top Navigation Bar */}
            <TopNav href={"/privacy"} text={"Privacy Policy"} />

            {/* Main Content Area */}
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
                {/* Hero Header */}
                <div className="mb-8 pb-8 border-b border-slate-200">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold mb-4">
                        <FileText size={14} />
                        <span>Official Terms of Service</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                        Terms and Conditions
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
                        Please read these Terms and Conditions carefully before using <strong>CitiFIX</strong>, an open civic infrastructure reporting application operated by <strong>BetterIliganCity</strong> under the <strong>BetterGov</strong> organization.
                    </p>

                    {/* Metadata Summary Card */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
                        <div>
                            <span className="text-slate-500 block">Operator:</span>
                            <span className="font-semibold text-slate-800">BetterIliganCity (BetterGov)</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Effective Date:</span>
                            <span className="font-semibold text-slate-800">{effectiveDate}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Territory:</span>
                            <span className="font-semibold text-slate-800">Iligan City, Philippines</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Contact:</span>
                            <a href="mailto:support@betteriligancity.org" className="font-semibold text-orange-600 hover:text-blue-500! hover:underline">
                                support@betteriligancity.org
                            </a>
                        </div>
                    </div>
                </div>

                {/* Critical Emergency Services Callout Banner */}
                <div className="mb-10 p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm">
                    <div className="flex items-start gap-3.5">
                        <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 shrink-0 mt-0.5">
                            <AlertTriangle size={22} />
                        </div>
                        <div className="space-y-1.5 text-xs sm:text-sm text-amber-950">
                            <h3 className="font-bold text-amber-900 text-sm sm:text-base">
                                CRITICAL NOTICE: NOT AN EMERGENCY RESPONSE SERVICE
                            </h3>
                            <p className="leading-relaxed">
                                <strong>CitiFIX is a community-driven civic tracking tool and is NOT an emergency dispatch or 911 service.</strong> Do NOT use this application to report active fires, medical emergencies, crimes in progress, severe flash flooding, downed live electrical wires, or immediate life-threatening situations.
                            </p>
                            <p className="font-semibold pt-1">
                                For urgent emergencies in Iligan City, call official hotlines directly (e.g., CDRRMO Iligan Rescue, Philippine National Police 911, or Bureau of Fire Protection).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Document Body */}
                <div className="space-y-12 text-slate-700 leading-relaxed">

                    {/* Section 1: Acceptance & Eligibility */}
                    <section id="acceptance" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">1</span>
                            Acceptance of Terms & Eligibility
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                By accessing, browsing, registering an account, or submitting reports through CitiFIX (&ldquo;the Service&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our <Link href="/privacy" className="text-orange-600 font-semibold underline">Privacy Policy</Link>.
                            </p>
                            <p>
                                <strong>Age Requirement:</strong> You must be at least <strong>18 years of age</strong> to create an account or submit civic reports. By using this service, you represent and warrant that you meet this minimum age requirement and possess the legal capacity to enter into these terms.
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Purpose of the Service */}
                    <section id="purpose" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">2</span>
                            Purpose & Nature of the Platform
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                CitiFIX is developed and maintained by <strong>BetterIliganCity</strong> (under the <strong>BetterGov</strong> civic tech initiative) as a public interest platform.
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li>The Platform serves as a collaborative bridge between citizens, community organizations, and local government units (LGUs) to highlight public infrastructure issues.</li>
                                <li><strong>No Official Government Guarantee:</strong> While verified report data is made publicly accessible to assist municipal planning and repair teams, BetterIliganCity is an independent civic technology organization. Submission of a report does not constitute a legal contract or guarantee that any public or private entity will repair or resolve the reported issue within a specific timeframe.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3: Accounts & Security */}
                    <section id="accounts" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">3</span>
                            User Accounts & Security
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                To submit infrastructure reports and track their status, you must register using email and password or an authorized OAuth provider (Google or GitHub).
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li><strong>Account Responsibility:</strong> You are solely responsible for maintaining the confidentiality of your credentials and for all activities occurring under your account.</li>
                                <li><strong>Accurate Information:</strong> You agree to provide truthful and accurate identification details. Impersonating another individual, entity, or public official is strictly prohibited.</li>
                                <li><strong>Notification of Breach:</strong> You agree to immediately notify BetterIliganCity at <a href="mailto:chriscent@betteriligancity.org" className="text-orange-600 underline font-medium">chriscent@betteriligancity.org</a> if you suspect any unauthorized access or compromise of your account.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4: Reporting Guidelines & Geofence */}
                    <section id="reporting-guidelines" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">4</span>
                            Civic Reporting Standards & Geographic Scope
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>When creating a report on CitiFIX, you agree to adhere to the following standards:</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle2 size={16} />
                                        Geographic Boundary (Iligan City)
                                    </h3>
                                    <p className="text-slate-600">
                                        Reports must be physically located within the territorial jurisdiction of Iligan City, validated via the platform&apos;s polygon boundary checks.
                                    </p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle2 size={16} />
                                        Factual & Accurate Information
                                    </h3>
                                    <p className="text-slate-600">
                                        Descriptions, categories, and severity levels must reflect genuine observations made in good faith regarding public infrastructure.
                                    </p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle2 size={16} />
                                        Relevant Photographic Evidence
                                    </h3>
                                    <p className="text-slate-600">
                                        Uploaded photos must be clear, authentic images depicting the specific hazard at the reported location (1–3 images, max 5MB each).
                                    </p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle2 size={16} />
                                        Respect for Private Spaces
                                    </h3>
                                    <p className="text-slate-600">
                                        Do not submit reports or photos targeting private interior property, private disputes, or personal grievances.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Content License Grant */}
                    <section id="content-licensing" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">5</span>
                            User-Generated Content & Photo License
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                You retain copyright ownership of any original text descriptions and photographs you upload to CitiFIX.
                            </p>
                            <p>
                                However, by submitting a civic report, you grant <strong>BetterIliganCity</strong>, <strong>BetterGov</strong>, relevant municipal and local government departments, and the general public a <strong>non-exclusive, worldwide, royalty-free, perpetual, and transferable license</strong> to:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-sm text-slate-600">
                                <li>Host, store, cache, display, and distribute the report title, description, geographic coordinates, and attached photos on public maps and API feeds.</li>
                                <li>Transmit report details and photos to municipal engineers, barangay officials, public utilities, and community volunteers for inspection, planning, and repair.</li>
                                <li>Publish civic aggregation metrics, maps, and statistical infographics derived from verified civic reports.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 6: Moderation Workflow & Media Destruction */}
                    <section id="moderation-workflow" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">6</span>
                            Staff Moderation & Image Deletion Rules
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>To maintain data quality and protect public safety, submitted reports undergo a moderation workflow:</p>

                            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm space-y-2">
                                <div className="flex items-center gap-2 font-mono text-xs text-orange-700 font-semibold">
                                    <span>SUBMITTED</span>
                                    <span>→</span>
                                    <span>UNDER REVIEW</span>
                                    <span>→</span>
                                    <span>VERIFIED / REJECTED / DUPLICATE</span>
                                </div>
                                <p className="text-slate-600">
                                    • <strong>Verified Reports:</strong> Approved by moderators and displayed publicly on the map with photo assets served via CDN.<br />
                                    • <strong>Rejected Reports:</strong> If a report is rejected (due to invalid location, spam, duplicate content, or inappropriate imagery), <strong>all associated image files are immediately and permanently destroyed from cloud storage</strong>.<br />
                                    • <strong>Admin Deletion:</strong> If a verified report is deleted by an administrator, the report record and all remote image files are permanently destroyed.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 7: Prohibited Conduct */}
                    <section id="prohibited-conduct" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">7</span>
                            Prohibited Conduct & Misuse
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>You agree NOT to engage in any of the following prohibited activities:</p>

                            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                                <li className="flex items-start gap-2 p-2 bg-red-50/60 rounded-lg border border-red-100">
                                    <Ban size={16} className="text-red-600 shrink-0 mt-0.5" />
                                    <span><strong>Falsification & Hoaxes:</strong> Submitting fabricated, deceptive, or staged hazard reports.</span>
                                </li>
                                <li className="flex items-start gap-2 p-2 bg-red-50/60 rounded-lg border border-red-100">
                                    <Ban size={16} className="text-red-600 shrink-0 mt-0.5" />
                                    <span><strong>Defamation & Harassment:</strong> Using report fields to accuse, insult, libel, or harass private citizens, neighbors, or public personnel.</span>
                                </li>
                                <li className="flex items-start gap-2 p-2 bg-red-50/60 rounded-lg border border-red-100">
                                    <Ban size={16} className="text-red-600 shrink-0 mt-0.5" />
                                    <span><strong>Unlawful & Abusive Imagery:</strong> Uploading explicit, violent, obscene, copyrighted, or non-infrastructure imagery.</span>
                                </li>
                                <li className="flex items-start gap-2 p-2 bg-red-50/60 rounded-lg border border-red-100">
                                    <Ban size={16} className="text-red-600 shrink-0 mt-0.5" />
                                    <span><strong>Commercial Advertising & Spam:</strong> Submitting promotional links, business ads, or repetitive duplicate postings.</span>
                                </li>
                                <li className="flex items-start gap-2 p-2 bg-red-50/60 rounded-lg border border-red-100">
                                    <Ban size={16} className="text-red-600 shrink-0 mt-0.5" />
                                    <span><strong>System Exploitation:</strong> Attempting to reverse engineer, scrape, bypass rate limits, inject malicious scripts, or disrupt platform infrastructure.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 8: Disclaimer of Warranties */}
                    <section id="disclaimers" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">8</span>
                            Disclaimer of Warranties & Limitation of Liability
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <div className="p-4 bg-slate-100/80 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm text-slate-700">
                                <p className="font-bold text-slate-900 uppercase">
                                    &ldquo;AS-IS&rdquo; AND &ldquo;AS-AVAILABLE&rdquo; PROVISION
                                </p>
                                <p>
                                    THE CITIFIX SERVICE, MAP DATA, AND REPORTING TOOLS ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                                </p>
                                <p>
                                    BETTERILIGANCITY AND BETTERGOV EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR ACCURATE AT ALL TIMES.
                                </p>
                                <p>
                                    UNDER NO CIRCUMSTANCES SHALL BETTERILIGANCITY, BETTERGOV, OR THEIR VOLUNTEERS, DEVELOPERS, OR AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OF, OR INABILITY TO USE, THE PLATFORM, OR FOR ANY ACTION OR INACTION TAKEN BY MUNICIPAL AUTHORITIES OR THIRD PARTIES REGARDING REPORTED HAZARDS.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 9: Termination & Anonymization */}
                    <section id="termination" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">9</span>
                            Account Suspension & Report Anonymization
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                <strong>Suspension & Termination:</strong> We reserve the right to suspend or terminate any user account immediately and without notice if we find violations of these Terms.
                            </p>
                            <p>
                                <strong>Anonymization on Closure:</strong> When an account is terminated or voluntarily erased, personal data is permanently deleted, while public infrastructure report records remain on the map with the author set to <em>Anonymous</em> to preserve municipal historical data.
                            </p>
                        </div>
                    </section>

                    {/* Section 10: Governing Law */}
                    <section id="governing-law" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">10</span>
                            Governing Law & Jurisdiction
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                These Terms and Conditions shall be governed by and construed in accordance with the laws of the <strong>Republic of the Philippines</strong>. Any legal action or proceeding arising out of or related to these Terms shall be instituted exclusively in the competent courts of <strong>Iligan City, Lanao del Norte, Philippines</strong>.
                            </p>
                        </div>
                    </section>

                    {/* Section 11: Contact */}
                    <section id="contact" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">11</span>
                            Contact & Legal Inquiries
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>For questions, terms feedback, or legal inquiries, please contact our team:</p>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-sm space-y-1 font-medium text-slate-800">
                                <p><strong>Initiative:</strong> BetterIliganCity (under BetterGov)</p>
                                <p><strong>Email:</strong> <a href="mailto:support@betteriligancity.org" className="text-orange-600 hover:underline hover:text-blue-500!">support@betteriligancity.org</a></p>
                                <p><strong>Location:</strong> Iligan City, Philippines</p>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Bottom Navigation */}
                <div className="mt-14 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} BetterIliganCity · BetterGov Civic Tech. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:text-slate-800 underline">Privacy Policy</Link>
                        <Link href="/" className="hover:text-slate-800 underline">Back to Map App</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
