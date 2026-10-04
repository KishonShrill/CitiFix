import type { Metadata } from "next";
import Link from "next/link";
import { FileText, AlertTriangle, CheckCircle2, Ban } from "lucide-react";
import TopNav from "@/components/terms-and-privacy/TopNav";

export const metadata: Metadata = {
    title: "Terms and Conditions",
    description: "Read the Terms and Conditions for using CitiFIX BetterIligan, an open civic infrastructure reporting platform by BetterIliganCity (BetterGov).",
    openGraph: {
        title: "Terms and Conditions | CitiFIX BetterIligan",
        description: "Official Terms and Conditions for the CitiFIX BetterIligan civic infrastructure reporting platform.",
    },
};

export default function TermsPage() {
    const effectiveDate = "October 4, 2026";

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
                        Please read these Terms and Conditions carefully before accessing or using <strong>CitiFIX</strong>, an open civic infrastructure reporting and community tracking platform operated by <strong>BetterIliganCity</strong> under the <strong>BetterGov</strong> civic technology initiative.
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
                            <span className="text-slate-500 block">Territory & Jurisdiction:</span>
                            <span className="font-semibold text-slate-800">Iligan City, Philippines</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Support Contact:</span>
                            <a href="mailto:support@betteriligancity.org" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
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
                                CRITICAL NOTICE: NOT AN EMERGENCY RESPONSE DISPATCH SYSTEM
                            </h3>
                            <p className="leading-relaxed">
                                <strong>CitiFIX is a community-driven civic tracking tool and is NOT an emergency dispatch or 911 service.</strong> Do NOT use this platform to report active fires, medical emergencies, crimes in progress, severe flash flooding, downed live electrical wires, or immediate life-threatening situations.
                            </p>
                            <p className="font-semibold pt-1">
                                For urgent emergencies in Iligan City, please contact official emergency hotlines directly (e.g., CDRRMO Iligan Rescue, Philippine National Police 911, or the Bureau of Fire Protection).
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
                                By accessing, browsing, registering an account, or submitting civic reports through CitiFIX (&ldquo;the Service&rdquo; or &ldquo;the Platform&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our <Link href="/privacy" className="text-orange-600 font-semibold underline hover:text-orange-700">Privacy Policy</Link>.
                            </p>
                            <p>
                                <strong>Age Requirement:</strong> You must be at least <strong>18 years of age</strong> to create an account, link authentication providers, or submit civic reports. By using this service, you represent and warrant that you meet this minimum age requirement and possess the legal capacity to enter into these terms.
                            </p>
                            <p>
                                If you do not agree to all terms and conditions set forth herein, you must immediately discontinue using the Platform.
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Nature of the Platform */}
                    <section id="purpose" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">2</span>
                            Purpose & Non-Government Relationship
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                CitiFIX is developed and maintained by <strong>BetterIliganCity</strong>, a municipal civic technology initiative under the <strong>BetterGov</strong> organization.
                            </p>
                            <ul className="list-disc list-inside space-y-2 pl-2">
                                <li><strong>Civic Bridge:</strong> The Platform serves as an open civic monitoring tool designed to help citizens document, visualize, and track public infrastructure issues (such as road damage, water leaks, uncollected waste, and faulty streetlights) in Iligan City.</li>
                                <li><strong>Independent Civic Initiative:</strong> BetterIliganCity operates independently. While verified hazard data is shared openly with community stakeholders and local government units (LGUs) to aid municipal planning and repair teams, <strong>submitting a report does not create a binding legal obligation or contract for any government office or third party to perform repairs within a specific timeframe</strong>.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3: Accounts & Security */}
                    <section id="accounts" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">3</span>
                            User Accounts, Authentication & Security
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                To submit infrastructure reports and track their status in &ldquo;My Reports,&rdquo; you must authenticate using email credentials or authorized third-party OAuth providers (Google or GitHub).
                            </p>
                            <ul className="list-disc list-inside space-y-2 pl-2">
                                <li><strong>Account Linking:</strong> You may link or unlink supported OAuth providers to your primary email address. You are responsible for ensuring that all linked accounts belong to you.</li>
                                <li><strong>Credential Confidentiality:</strong> You are solely responsible for safeguarding your login credentials and for any activities or actions taken under your account. Passwords are cryptographically hashed and never stored in plain text.</li>
                                <li><strong>Accurate Information:</strong> You agree to provide truthful and authentic registration information. Impersonating another citizen, municipal official, or government entity is strictly prohibited.</li>
                                <li><strong>Security Notifications:</strong> If you detect or suspect unauthorized access to your account or any security vulnerability in the platform, you must immediately notify our team at <a href="mailto:support@betteriligancity.org" className="text-orange-600 font-semibold underline hover:text-orange-700">support@betteriligancity.org</a>.</li>
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
                            <p>When creating an infrastructure report on CitiFIX, you agree to adhere to the following community standards:</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle2 size={16} />
                                        Iligan City Geographic Geofence
                                    </h3>
                                    <p className="text-slate-600">
                                        All reports must be physically located within the territorial boundaries of Iligan City, validated via the platform&apos;s polygon geofencing system.
                                    </p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle2 size={16} />
                                        Factual Accuracy & Good Faith
                                    </h3>
                                    <p className="text-slate-600">
                                        Titles, descriptions, categories, and severity levels must represent genuine, truthful observations of public hazards made in good faith.
                                    </p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle2 size={16} />
                                        Authentic Photographic Evidence
                                    </h3>
                                    <p className="text-slate-600">
                                        Uploaded photos must be clear, unaltered images depicting the hazard at the specified pin location (1 to 3 photos, maximum 5MB each, JPEG/PNG/WebP).
                                    </p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle2 size={16} />
                                        Respect for Private Spaces
                                    </h3>
                                    <p className="text-slate-600">
                                        Do not submit reports or capture photos targeting private interior property, private commercial disputes, or personal interpersonal grievances.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: User Content License Grant */}
                    <section id="content-licensing" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">5</span>
                            User-Generated Content & License Grant
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                You retain copyright ownership of any original descriptive text and photographs you submit to CitiFIX.
                            </p>
                            <p>
                                However, to enable the civic purpose of the platform, by submitting a report you grant <strong>BetterIliganCity</strong>, <strong>BetterGov</strong>, relevant municipal and local government departments, utility entities, and the general public a <strong>non-exclusive, worldwide, royalty-free, perpetual, and transferable license</strong> to:
                            </p>
                            <ul className="list-disc list-inside space-y-1.5 pl-2 text-sm text-slate-600">
                                <li>Store, cache, display, reproduce, and publicly distribute the report title, description, category, severity, geographic coordinates, and attached photos on public interactive maps and open API endpoints.</li>
                                <li>Transmit report details and photographic attachments to municipal engineers, barangay officials, public utilities, and community responders for inspection, scheduling, and infrastructure repairs.</li>
                                <li>Compile and publish anonymized civic metrics, aggregate hazard statistics, and analytical infographics derived from report data for civic research and public policy awareness.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 6: Moderation Workflow & Media Destruction */}
                    <section id="moderation-workflow" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">6</span>
                            Staff Moderation, Discord Alerts & Media Destruction
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>To ensure high data quality, prevent spam, and protect public integrity, submitted reports pass through a defined moderation lifecycle:</p>

                            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm space-y-3">
                                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-orange-700 font-semibold">
                                    <span className="px-2 py-0.5 rounded bg-orange-100">SUBMITTED</span>
                                    <span>→</span>
                                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">UNDER REVIEW</span>
                                    <span>→</span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">VERIFIED</span>
                                    <span>/</span>
                                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700">REJECTED</span>
                                    <span>/</span>
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700">DUPLICATE</span>
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                                    <li><strong>Internal Discord Alerts:</strong> When a report is submitted or updated, an automated notification is dispatched via secure webhook to an internal Discord channel for authorized moderators to inspect photos, details, and submitter info to verify legitimacy.</li>
                                    <li><strong>Verified Reports:</strong> Once approved by moderators, reports are published to the public interactive map with photo assets served via our content delivery network.</li>
                                    <li><strong>Permanent Media Destruction on Rejection:</strong> If a report is rejected (e.g. due to invalid location, duplicate submission, spam, or abusive imagery), <strong>all uploaded photo files are permanently destroyed from cloud storage immediately</strong>.</li>
                                    <li><strong>Permanent Admin Deletion:</strong> If a verified report is deleted by staff administrators, all database records and remote image files in cloud storage are permanently purged.</li>
                                </ul>
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
                            <p>You agree NOT to engage in any of the following prohibited activities on CitiFIX:</p>

                            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                                <li className="flex items-start gap-2 p-2.5 bg-red-50/70 rounded-lg border border-red-100">
                                    <Ban size={16} className="text-red-600 shrink-0 mt-0.5" />
                                    <span><strong>Falsification & Hoaxes:</strong> Submitting fabricated, staged, or deceptive infrastructure hazard reports.</span>
                                </li>
                                <li className="flex items-start gap-2 p-2.5 bg-red-50/70 rounded-lg border border-red-100">
                                    <Ban size={16} className="text-red-600 shrink-0 mt-0.5" />
                                    <span><strong>Defamation & Harassment:</strong> Using report titles, descriptions, or addresses to defame, harass, insult, or target private citizens, neighbors, or public workers.</span>
                                </li>
                                <li className="flex items-start gap-2 p-2.5 bg-red-50/70 rounded-lg border border-red-100">
                                    <Ban size={16} className="text-red-600 shrink-0 mt-0.5" />
                                    <span><strong>Inappropriate & Explicit Imagery:</strong> Uploading photos containing pornography, violence, hate speech, identifiable personal portraits without consent, vehicle license plates, or copyrighted non-civic material.</span>
                                </li>
                                <li className="flex items-start gap-2 p-2.5 bg-red-50/70 rounded-lg border border-red-100">
                                    <Ban size={16} className="text-red-600 shrink-0 mt-0.5" />
                                    <span><strong>Commercial Advertising & Spam:</strong> Submitting promotional links, business marketing, or repetitive bulk submissions.</span>
                                </li>
                                <li className="flex items-start gap-2 p-2.5 bg-red-50/70 rounded-lg border border-red-100">
                                    <Ban size={16} className="text-red-600 shrink-0 mt-0.5" />
                                    <span><strong>System Exploitation:</strong> Attempting to reverse engineer, scrape, bypass rate limits, inject malicious scripts/SQL, or disrupt platform infrastructure and edge servers.</span>
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
                                    THE CITIFIX PLATFORM, MAP INTERFACES, GEODATA, AND CIVIC REPORTING TOOLS ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                                </p>
                                <p>
                                    BETTERILIGANCITY AND BETTERGOV EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, COMPLETELY ACCURATE, SECURE, OR FREE FROM TRANSMISSION ERRORS.
                                </p>
                                <p>
                                    UNDER NO CIRCUMSTANCES SHALL BETTERILIGANCITY, BETTERGOV, OR THEIR VOLUNTEERS, DEVELOPERS, MODERATORS, OR AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OF OR INABILITY TO USE THE PLATFORM, OR FOR ANY ACTION, DELAY, OR INACTION BY MUNICIPAL AUTHORITIES OR UTILITY PROVIDERS REGARDING REPORTED HAZARDS.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 9: Termination & Anonymization */}
                    <section id="termination" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">9</span>
                            Account Suspension, Voluntary Deletion & Report Anonymization
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                <strong>Account Suspension:</strong> We reserve the right to suspend, terminate, or restrict any user account immediately and without prior notice if we identify violations of these Terms or intentional misuse of the civic reporting system.
                            </p>
                            <p>
                                <strong>Self-Service Account Deletion:</strong> You may delete your account at any time via the profile interface. When an account is deleted:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-sm text-slate-600">
                                <li>All personal identity records (name, email, password hash, OAuth tokens, active sessions) are permanently erased from the database.</li>
                                <li>To preserve the integrity and continuity of municipal infrastructure history, existing submitted reports remain on the platform with the submitter attribute permanently set to <em>Anonymous (NULL)</em>.</li>
                            </ul>
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
                                These Terms and Conditions shall be governed by, interpreted, and construed in accordance with the laws of the <strong>Republic of the Philippines</strong>, including the <em>Data Privacy Act of 2012 (RA 10173)</em> and the <em>Cybercrime Prevention Act of 2012 (RA 10175)</em>.
                            </p>
                            <p>
                                Any legal action, suit, or proceeding arising out of or relating to these Terms shall be brought exclusively before the proper courts of <strong>Iligan City, Lanao del Norte, Philippines</strong>.
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
                            <p>For questions regarding these Terms and Conditions or civic inquiries, please reach out to our team:</p>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-sm space-y-1.5 font-medium text-slate-800">
                                <p><strong>Initiative:</strong> BetterIliganCity (under <a href="https://bettergov.ph" className="text-orange-600 hover:text-orange-700 hover:underline">BetterGov</a>)</p>
                                <p><strong>Support Email:</strong> <a href="mailto:support@betteriligancity.org" className="text-orange-600 hover:text-orange-700 hover:underline">support@betteriligancity.org</a></p>
                                <p><strong>Location:</strong> Iligan City, Lanao del Norte, Philippines</p>
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
