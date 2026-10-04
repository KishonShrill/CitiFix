import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, Mail, Server, Database, Bell, MapPin, Trash2 } from "lucide-react";
import TopNav from "@/components/terms-and-privacy/TopNav";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Learn how CitiFIX BetterIligan (BetterGov) collects, protects, and handles personal information and civic reporting data under the Philippine Data Privacy Act (RA 10173).",
    openGraph: {
        title: "Privacy Policy | CitiFIX BetterIligan",
        description: "Official Privacy Policy for the CitiFIX BetterIligan civic infrastructure reporting platform.",
    },
};

export default function PrivacyPolicyPage() {
    const effectiveDate = "October 4, 2026";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            {/* Top Navigation Bar */}
            <TopNav href={"/terms"} text={"Terms and Conditions"} />

            {/* Main Content Area */}
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
                {/* Hero Header */}
                <div className="mb-10 pb-8 border-b border-slate-200">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold mb-4">
                        <Shield size={14} />
                        <span>Official Privacy Policy · RA 10173 Compliant</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                        Privacy Policy
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
                        This Privacy Policy explains how <strong>BetterIliganCity</strong> (under the <strong>BetterGov</strong> civic technology initiative) processes, protects, and handles personal information and civic infrastructure data collected through the <strong>CitiFIX</strong> platform.
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
                            <span className="text-slate-500 block">Governing Law:</span>
                            <span className="font-semibold text-slate-800">Philippine DPA (RA 10173)</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Privacy Contact:</span>
                            <a href="mailto:support@betteriligancity.org" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
                                support@betteriligancity.org
                            </a>
                        </div>
                    </div>
                </div>

                {/* Document Body */}
                <div className="space-y-12 text-slate-700 leading-relaxed">

                    {/* Section 1: Introduction & Governance */}
                    <section id="introduction" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">1</span>
                            Introduction & Statutory Governance
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                <strong>CitiFIX</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the Platform&rdquo;) is an open civic reporting system operated by <strong>BetterIliganCity</strong>, a municipal civic tech group under <strong>BetterGov</strong>. Our goal is to empower residents of Iligan City to document, track, and advocate for the resolution of public infrastructure hazards—such as damaged roads, broken streetlights, water pipe leaks, drainage blockages, and waste disposal issues.
                            </p>
                            <p>
                                We are committed to transparency and the responsible stewardship of data. All personal data collected through CitiFIX is processed in accordance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> of the Philippines, its Implementing Rules and Regulations (IRR), and applicable guidelines issued by the National Privacy Commission (NPC).
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Core Privacy Principles */}
                    <section id="principles" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">2</span>
                            Core Privacy Principles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                                <div className="p-2 w-fit rounded-lg bg-emerald-100 text-emerald-700 mb-3">
                                    <Lock size={18} />
                                </div>
                                <h3 className="font-semibold text-slate-900 text-sm mb-1">Public Reporter Anonymity</h3>
                                <p className="text-xs text-slate-600 leading-normal">
                                    Your name, email address, and personal user ID are strictly redacted from public maps and public API feeds.
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                                <div className="p-2 w-fit rounded-lg bg-blue-100 text-blue-700 mb-3">
                                    <MapPin size={18} />
                                </div>
                                <h3 className="font-semibold text-slate-900 text-sm mb-1">Volatile Client GPS</h3>
                                <p className="text-xs text-slate-600 leading-normal">
                                    Your browser GPS position stays strictly in local device RAM to pan your map view and is never sent to or stored on our servers.
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                                <div className="p-2 w-fit rounded-lg bg-orange-100 text-orange-700 mb-3">
                                    <Trash2 size={18} />
                                </div>
                                <h3 className="font-semibold text-slate-900 text-sm mb-1">Zero-Orphan Photo Policy</h3>
                                <p className="text-xs text-slate-600 leading-normal">
                                    When reports are rejected by staff or deleted, attached image files are permanently destroyed from cloud storage.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Data We Collect */}
                    <section id="data-collected" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">3</span>
                            Information We Collect
                        </h2>
                        <div className="space-y-4 text-sm sm:text-base">
                            <p>We process only the minimum information necessary to authenticate users, facilitate civic reporting, and maintain platform security:</p>

                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-900 text-sm">
                                    A. Account & Identification Information
                                </div>
                                <div className="p-4 space-y-2 text-sm text-slate-600">
                                    <p>When you register, sign in, or link OAuth accounts:</p>
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li><strong>Full Name:</strong> Provided during registration or retrieved from your authorized OAuth provider (Google or GitHub).</li>
                                        <li><strong>Email Address:</strong> Validated against allowed email provider domains and used for account authentication and security notices.</li>
                                        <li><strong>Hashed Credentials:</strong> Passwords are cryptographically hashed using industry-standard algorithms (scrypt/argon2id); plain text passwords are never stored.</li>
                                        <li><strong>OAuth Profile Avatar:</strong> Profile image URL provided by Google or GitHub for your personal profile badge.</li>
                                        <li><strong>System User Identifier:</strong> Internal unique ID generated for account management and session tracking.</li>
                                        <li><strong>User Role:</strong> Access tier assignment (<code>user</code>, <code>moderator</code>, or <code>admin</code>).</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-900 text-sm">
                                    B. Civic Infrastructure Report Data
                                </div>
                                <div className="p-4 space-y-2 text-sm text-slate-600">
                                    <p>When you submit a civic issue report, we store:</p>
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li><strong>Issue Title & Detailed Description:</strong> Factual summary of the infrastructure problem.</li>
                                        <li><strong>Taxonomy Classification:</strong> Category ID (e.g. Roads & Infrastructure) and Problem Type ID (e.g. Pothole, Streetlight Malfunction).</li>
                                        <li><strong>Severity Assessment:</strong> Selected level (<code>low</code>, <code>medium</code>, <code>high</code>, <code>critical</code>).</li>
                                        <li><strong>Report Pin Coordinates:</strong> Latitude and Longitude of the placed map pin within the Iligan City geofence.</li>
                                        <li><strong>Location Descriptors:</strong> Street address and Barangay name (resolved via reverse geocoding or user input).</li>
                                        <li><strong>Photographic Evidence:</strong> 1 to 3 photos (JPEG, PNG, WebP; max 5MB each) uploaded to cloud storage.</li>
                                        <li><strong>Lifecycle Timestamps:</strong> Creation, update, verification, and publication timestamps.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-900 text-sm">
                                    C. Technical, Session & Security Audit Data
                                </div>
                                <div className="p-4 space-y-2 text-sm text-slate-600">
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li><strong>Session Tokens & Expiry:</strong> Secure session identifiers stored in the database to maintain authenticated state.</li>
                                        <li><strong>IP Address & User-Agent:</strong> Captured in active session records to monitor account integrity, detect abuse, and prevent automated spam.</li>
                                        <li><strong>Immutable Audit Logs:</strong> Records administrative and moderation actions (e.g., verifying, reviewing, rejecting, or deleting reports, and account deletions) with actor IDs and timestamps.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Device Location vs Report Pin Location */}
                    <section id="location-distinction" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">4</span>
                            Device Geolocation vs. Report Pin Location & Reverse Geocoding
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>We maintain a strict technical separation between your personal device location and the location of reported civic hazards:</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                                <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                                        <Eye size={16} className="text-slate-500" />
                                        Your Device GPS Location (Private & Ephemeral)
                                    </h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        When you allow browser location access, GPS coordinates are processed exclusively in your device&apos;s local memory to pan the map to your current vicinity. <strong>Your device GPS is never transmitted to our backend API, never logged, and never stored in any database.</strong>
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-50/70 rounded-xl border border-orange-200">
                                    <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                                        <MapPin size={16} className="text-orange-600" />
                                        Report Pin Location (Public upon Verification)
                                    </h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        The pin you place on the map marks the exact public location of the hazard. This coordinate is validated against the official Iligan City boundary polygon, stored in the database, and <strong>displayed publicly on the map once verified</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                                <strong className="text-slate-900 block">Reverse Geocoding Disclosure (OpenStreetMap Nominatim):</strong>
                                <p>
                                    To assist in identifying the nearest street name and Barangay, the platform queries the OpenStreetMap Nominatim reverse geocoding service using the placed pin coordinates. <strong>No personal user identifiers, session tokens, or account details are sent to Nominatim</strong>—only the numeric latitude and longitude of the pin.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Public vs Private Visibility */}
                    <section id="visibility" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">5</span>
                            Public vs. Internal vs. Private Visibility Matrix
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>To ensure civic transparency while protecting individual citizen privacy, CitiFIX enforces strict projection rules:</p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                                    <thead>
                                        <tr className="bg-slate-100/80 text-slate-800 border-b border-slate-200">
                                            <th className="p-3 font-semibold">Data Element</th>
                                            <th className="p-3 font-semibold">Public Map & Feed</th>
                                            <th className="p-3 font-semibold">Authorized Staff (Admin & Discord)</th>
                                            <th className="p-3 font-semibold">Reporting Citizen (My Reports)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600">
                                        <tr>
                                            <td className="p-3 font-medium text-slate-900">Reporter Name & Email</td>
                                            <td className="p-3 text-red-600 font-bold">REDACTED (No)</td>
                                            <td className="p-3 text-slate-800 font-medium">Visible (Authenticity Verification)</td>
                                            <td className="p-3 text-slate-800 font-medium">Visible (Self)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-slate-900">Reporter Account ID</td>
                                            <td className="p-3 text-red-600 font-bold">REDACTED (No)</td>
                                            <td className="p-3 text-slate-800 font-medium">Visible (Moderation Queue)</td>
                                            <td className="p-3 text-slate-800 font-medium">Visible (Self)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-slate-900">Verified Report Details & Coordinates</td>
                                            <td className="p-3 text-emerald-600 font-bold">YES (Public)</td>
                                            <td className="p-3 text-emerald-600 font-bold">YES</td>
                                            <td className="p-3 text-emerald-600 font-bold">YES</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-slate-900">Verified Photos (Cloudinary CDN)</td>
                                            <td className="p-3 text-emerald-600 font-bold">YES (Public)</td>
                                            <td className="p-3 text-emerald-600 font-bold">YES</td>
                                            <td className="p-3 text-emerald-600 font-bold">YES</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-slate-900">Submitted / Under Review Reports</td>
                                            <td className="p-3 text-red-600 font-bold">NO (Pending)</td>
                                            <td className="p-3 text-slate-800 font-medium">Visible (Moderation Queue)</td>
                                            <td className="p-3 text-emerald-600 font-bold">YES</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-slate-900">Password Hashes & Tokens</td>
                                            <td className="p-3 text-red-600 font-bold">NEVER</td>
                                            <td className="p-3 text-red-600 font-bold">NEVER</td>
                                            <td className="p-3 text-slate-500">Secure Cookie Only</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Section 6: Image Handling & Cloud Storage */}
                    <section id="images-media" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">6</span>
                            Photographic Evidence & Cloudinary Media Lifecycle
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                Photographic evidence validates civic hazard reports and prevents spurious entries:
                            </p>
                            <ul className="list-disc list-inside space-y-2 pl-2 text-slate-600">
                                <li><strong>Cryptographic Upload Signing:</strong> Images (1 to 3 photos, max 5MB each, JPEG/PNG/WebP) are uploaded securely to <strong>Cloudinary</strong> using server-generated HMAC-SHA1 cryptographic signatures, preventing unauthorized asset manipulation.</li>
                                <li><strong>Two-Phase Upload Atomicity:</strong> If any photo in an upload fails or if the corresponding database record cannot be saved, all previously uploaded images in that batch are immediately rolled back and deleted from cloud storage.</li>
                                <li><strong>Zero-Orphan Deletion Policy:</strong> When a report is rejected by moderators or deleted by staff, all associated image files are <strong>permanently purged from Cloudinary</strong>.</li>
                                <li><strong>Privacy Advice:</strong> Users are advised to avoid capturing identifiable faces of bystanders, residential windows, or private vehicle license plates.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 7: Third-Party Infrastructure */}
                    <section id="third-parties" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">7</span>
                            Third-Party Service Providers & Sub-Processors
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>We utilize trusted infrastructure service providers to operate CitiFIX securely:</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                        <Server size={15} className="text-orange-600" />
                                        Cloudflare (Workers & Edge CDN)
                                    </h3>
                                    <p className="text-slate-600">Serverless compute hosting, global CDN, DDoS mitigation, and SSL/TLS encryption.</p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                        <Database size={15} className="text-orange-600" />
                                        PostgreSQL Database (Supabase)
                                    </h3>
                                    <p className="text-slate-600">Encrypted relational storage for accounts, sessions, report data, and audit records.</p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                        <Shield size={15} className="text-orange-600" />
                                        Cloudinary Media Services
                                    </h3>
                                    <p className="text-slate-600">Signed image storage, WebP optimization, and CDN delivery for verified report photos.</p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                        <MapPin size={15} className="text-orange-600" />
                                        OpenFreeMap & MapLibre
                                    </h3>
                                    <p className="text-slate-600">Open vector map tiles based on OpenStreetMap data for street and geographic rendering.</p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                        <Lock size={15} className="text-orange-600" />
                                        Google & GitHub (OAuth 2.0)
                                    </h3>
                                    <p className="text-slate-600">Optional social authentication providers used strictly for citizen identity verification.</p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                        <Bell size={15} className="text-orange-600" />
                                        Discord Webhook Notifications
                                    </h3>
                                    <p className="text-slate-600">Encrypted webhook alerts to private internal moderator channels for authenticity review.</p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 font-medium">
                                * CitiFIX does NOT use commercial behavioral tracking pixels (such as Google Analytics or Meta Pixel), third-party advertising networks, or data brokers.
                            </p>
                        </div>
                    </section>

                    {/* Section 8: Cookies & Storage */}
                    <section id="cookies" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">8</span>
                            Cookies & Browser Storage
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                CitiFIX utilizes <strong>strictly essential cookies and storage</strong> necessary for platform functionality:
                            </p>
                            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                                <li><strong>Session Cookie (<code>better-auth.session_token</code>):</strong> An HTTP-only, secure, SameSite cookie that maintains your authenticated state while using the application. It expires automatically upon session expiration or logout.</li>
                                <li><strong>Client Storage (<code>localStorage</code>):</strong> Used solely for client-side UI preferences (such as dark mode or active map filter presets). We do not store tracking IDs or personal profiles in browser storage.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 9: Data Retention & Account Erasure */}
                    <section id="retention-deletion" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">9</span>
                            Data Retention & Account Erasure (Right to be Forgotten)
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                <strong>Civic Record Integrity:</strong> Public infrastructure reports constitute an essential historical record of municipal hazards and municipal repair performance. To balance citizen privacy with community infrastructure tracking:
                            </p>
                            <ul className="list-disc list-inside space-y-2 pl-2 text-slate-600">
                                <li><strong>Self-Service Account Erasure:</strong> You may permanently delete your account at any time via the profile settings. Upon deletion, all personal identification data (name, email address, password hash, OAuth account links, and active sessions) are permanently erased from the database.</li>
                                <li><strong>Report Anonymization (<code>SET NULL</code>):</strong> Reports previously submitted by the deleted account are retained on the public map to maintain historical civic integrity, with the author relationship permanently severed and set to <em>Anonymous (NULL)</em>.</li>
                                <li><strong>Submitted Report Withdrawal:</strong> You may edit or withdraw your own submitted report at any time while it remains in <code>submitted</code> status prior to staff review.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 10: Rights Under RA 10173 */}
                    <section id="rights" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">10</span>
                            Your Data Privacy Rights under RA 10173
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                Under the <strong>Philippine Data Privacy Act of 2012 (RA 10173)</strong>, you are entitled to the following statutory rights:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <strong className="text-slate-900 block mb-1">Right to be Informed</strong>
                                    <span className="text-slate-600">You have the right to know how your personal data is collected, stored, and processed.</span>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <strong className="text-slate-900 block mb-1">Right of Access</strong>
                                    <span className="text-slate-600">You may inspect your account profile, linked credentials, and submitted reports anytime.</span>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <strong className="text-slate-900 block mb-1">Right to Rectification</strong>
                                    <span className="text-slate-600">You have the right to dispute and request correction of inaccurate personal information.</span>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <strong className="text-slate-900 block mb-1">Right to Erasure or Blocking</strong>
                                    <span className="text-slate-600">You may trigger self-service account deletion to erase your personal identifiers.</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600">
                                To exercise your statutory privacy rights, please contact our Data Protection team at <a href="mailto:support@betteriligancity.org" className="text-orange-600 font-semibold underline hover:text-orange-700">support@betteriligancity.org</a>. You also have the right to file a complaint with the National Privacy Commission (NPC) at <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">privacy.gov.ph</a>.
                            </p>
                        </div>
                    </section>

                    {/* Section 11: Age Requirement */}
                    <section id="age-limit" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">11</span>
                            Age Requirement & Protection of Minors
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                CitiFIX is designed and intended for individuals who are at least <strong>18 years of age</strong>. We do not knowingly collect personal data from minors. If you believe a minor has registered an account or submitted personal data, please notify us immediately at <a href="mailto:support@betteriligancity.org" className="text-orange-600 underline">support@betteriligancity.org</a> to have the account and data permanently removed.
                            </p>
                        </div>
                    </section>

                    {/* Section 12: Security Safeguards */}
                    <section id="security" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">12</span>
                            Security Safeguards & Technical Measures
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>We implement comprehensive organizational and technical security controls to protect civic data:</p>
                            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                                <li><strong>Role-Based Access Control (RBAC):</strong> Server-side route guards (<code>requireUser</code>, <code>requireRole</code>) enforce strict authorization on moderation queues and user data endpoints.</li>
                                <li><strong>Parameterized Queries:</strong> Enforced across all database interactions via Drizzle ORM to protect against SQL injection vulnerabilities.</li>
                                <li><strong>Cryptographic HMAC Signatures:</strong> Photo uploads require unique server-generated signatures with secret keys never exposed to clients.</li>
                                <li><strong>Geographic Boundary Enforcement:</strong> Point-in-polygon mathematical verification confirms that submitted coordinates fall within official Iligan City boundaries.</li>
                                <li><strong>Immutable Audit Logging:</strong> Administrative actions are immutably logged with actor IDs and timestamps for full accountability.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 13: Policy Updates & Contact */}
                    <section id="contact" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">13</span>
                            Policy Updates & Contact Information
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                We may periodically update this Privacy Policy to reflect enhancements in application features, infrastructure updates, or regulatory developments. The updated policy will always be published on this page with a revised effective date.
                            </p>

                            <div className="mt-4 p-5 bg-orange-50 rounded-2xl border border-orange-200">
                                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Mail size={18} className="text-orange-600" />
                                    Data Protection & Privacy Contact
                                </h3>
                                <p className="text-sm text-slate-700 mb-2">
                                    For privacy inquiries, data subject requests, or account deletion support:
                                </p>
                                <div className="text-sm space-y-1.5 font-medium text-slate-800">
                                    <p><strong>Organization:</strong> BetterIliganCity (under <a href="https://www.bettergov.ph" className="text-orange-600 hover:text-orange-700 hover:underline">BetterGov Civic Tech</a>)</p>
                                    <p><strong>Contact Email:</strong> <a href="mailto:support@betteriligancity.org" className="text-orange-600 hover:text-orange-700 hover:underline">support@betteriligancity.org</a></p>
                                    <p><strong>Location:</strong> Iligan City, Lanao del Norte, Republic of the Philippines</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Bottom Navigation */}
                <div className="mt-14 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} BetterIliganCity · BetterGov Civic Tech. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/terms" className="hover:text-slate-800 underline">Terms and Conditions</Link>
                        <Link href="/" className="hover:text-slate-800 underline">Back to Map App</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
