import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, MapPin, Trash2, Mail } from "lucide-react";
import TopNav from "@/components/terms-and-privacy/TopNav";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Learn how CitiFIX BetterIligan (BetterGov) collects, protects, and handles personal information and civic reporting data.",
    openGraph: {
        title: "Privacy Policy | CitiFIX BetterIligan",
        description: "Official Privacy Policy for CitiFIX BetterIligan civic infrastructure reporting platform.",
    },
};

export default function PrivacyPolicyPage() {
    const effectiveDate = "October 2, 2026";

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
                        <span>Official Legal Document</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                        Privacy Policy
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
                        This Privacy Policy explains how <strong>BetterIliganCity</strong> (a municipal civic tech initiative under the <strong>BetterGov</strong> organization) collects, uses, protects, and discloses personal information and civic data through the <strong>CitiFIX</strong> platform.
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
                            <span className="text-slate-500 block">Applicable Law:</span>
                            <span className="font-semibold text-slate-800">Philippine DPA (RA 10173)</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Privacy Contact:</span>
                            <a href="mailto:chriscent@betteriligancity.org" className="font-semibold text-orange-600 hover:underline">
                                chriscent@betteriligancity.org
                            </a>
                        </div>
                    </div>
                </div>

                {/* Document Body */}
                <div className="space-y-12 text-slate-700 leading-relaxed">

                    {/* Section 1: Introduction */}
                    <section id="introduction" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">1</span>
                            Introduction & Governance
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                <strong>CitiFIX</strong> (also referenced as &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the Platform&rdquo;) is an open civic reporting system developed and operated by <strong>BetterIliganCity</strong>, a municipal chapter of the <strong>BetterGov</strong> civic technology organization.
                            </p>
                            <p>
                                Our mission is to empower residents of Iligan City to document, track, and collaborate on resolving public infrastructure issues—such as road hazards, broken streetlights, sanitation concerns, drainage blockages, and public safety issues.
                            </p>
                            <p>
                                We are committed to processing data responsibly and in strict compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> of the Philippines and its Implementing Rules and Regulations (IRR).
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
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="p-2 w-fit rounded-lg bg-emerald-100 text-emerald-700 mb-3">
                                    <Lock size={18} />
                                </div>
                                <h3 className="font-semibold text-slate-900 text-sm mb-1">Reporter Anonymity</h3>
                                <p className="text-xs text-slate-600 leading-normal">
                                    Your name, email address, and personal account ID are strictly omitted from all public maps and public API responses.
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="p-2 w-fit rounded-lg bg-blue-100 text-blue-700 mb-3">
                                    <MapPin size={18} />
                                </div>
                                <h3 className="font-semibold text-slate-900 text-sm mb-1">Volatile Device Location</h3>
                                <p className="text-xs text-slate-600 leading-normal">
                                    Your browser GPS position is used solely to pan your map view client-side and is never sent to or stored on our servers.
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
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
                            <p>We collect only the minimum information necessary to authenticate users, facilitate civic reporting, and maintain platform security:</p>

                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-900 text-sm">
                                    A. Account & Identification Information
                                </div>
                                <div className="p-4 space-y-2 text-sm text-slate-600">
                                    <p>When you register or sign in, we process:</p>
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li><strong>Full Name</strong> (provided by you or retrieved from your authorized OAuth provider).</li>
                                        <li><strong>Email Address</strong> (used for account identification and authentication).</li>
                                        <li><strong>Password Credentials</strong> (securely hashed via industry-standard scrypt/argon2id algorithms; we never store plain-text passwords).</li>
                                        <li><strong>OAuth Profile Image</strong> (if you sign in via Google or GitHub, for display in your personal user menu).</li>
                                        <li><strong>System User Identifier</strong> (an internal alphanumeric ID generated by Better-Auth).</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-900 text-sm">
                                    B. Civic Report Information
                                </div>
                                <div className="p-4 space-y-2 text-sm text-slate-600">
                                    <p>When you submit an infrastructure report, we store:</p>
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li><strong>Issue Title and Description</strong> describing the public hazard.</li>
                                        <li><strong>Taxonomy Classification</strong> (Category e.g., Road Hazards, and Problem Type e.g., Pothole).</li>
                                        <li><strong>Severity Rating</strong> (&ldquo;low&rdquo;, &ldquo;medium&rdquo;, &ldquo;high&rdquo;, &ldquo;critical&rdquo;).</li>
                                        <li><strong>Exact Report Pin Location</strong> (Latitude and Longitude coordinates selected on the map).</li>
                                        <li><strong>Location Descriptors</strong> (Optional barangay or street address notes).</li>
                                        <li><strong>Uploaded Photographs</strong> (1 to 3 JPEG, PNG, or WebP images under 5MB each).</li>
                                        <li><strong>Submission & Verification Timestamps</strong>.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-900 text-sm">
                                    C. Technical & Security Audit Data
                                </div>
                                <div className="p-4 space-y-2 text-sm text-slate-600">
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li><strong>Session Tokens & Expiry</strong> (stored in database sessions for authentication).</li>
                                        <li><strong>IP Address & User-Agent</strong> (recorded with active sessions to detect unauthorized access and prevent spam).</li>
                                        <li><strong>Administrative Audit Logs</strong> (records staff moderation actions such as verifying, reviewing, rejecting, or deleting reports).</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Device Location vs Report Location */}
                    <section id="location-distinction" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">4</span>
                            Device Geolocation vs. Report Pin Location
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>We maintain a strict technical separation between your physical device location and the location of the report:</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                                <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                                        <Eye size={16} className="text-slate-500" />
                                        Your Device Location (Private)
                                    </h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        When you grant browser geolocation permissions, your browser provides GPS coordinates strictly to your local device memory. This is used exclusively to pan the map to your vicinity. <strong>It is never transmitted to our backend, never logged, and never saved in any database.</strong>
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-50/70 rounded-xl border border-orange-200">
                                    <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                                        <MapPin size={16} className="text-orange-600" />
                                        Report Pin Location (Public)
                                    </h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        The pin you manually place or adjust on the map represents the physical site of the civic hazard. This coordinate is validated against the Iligan City boundary polygon, saved in our database, and <strong>publicly visible to all users once the report is verified</strong>.
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 italic">
                                Note: We do not utilize any external reverse-geocoding services that track or log user location queries.
                            </p>
                        </div>
                    </section>

                    {/* Section 5: Public vs Private Visibility */}
                    <section id="visibility" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">5</span>
                            Public vs. Private Information
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>To ensure transparency in municipal governance while protecting individual citizen privacy, CitiFIX enforces strict data projection rules:</p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <thead>
                                        <tr className="bg-slate-100/70 text-slate-800 border-b border-slate-200">
                                            <th className="p-3 font-semibold">Data Category</th>
                                            <th className="p-3 font-semibold">Publicly Visible?</th>
                                            <th className="p-3 font-semibold">Who Can Access?</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600">
                                        <tr>
                                            <td className="p-3 font-medium text-slate-900">Reporter Name & Email</td>
                                            <td className="p-3 text-red-600 font-semibold">NO (Redacted)</td>
                                            <td className="p-3">Only you in your personal session; not shown even to public visitors.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-slate-900">Reporter User ID</td>
                                            <td className="p-3 text-red-600 font-semibold">NO (Redacted)</td>
                                            <td className="p-3">Designated staff moderators only (in administrative review queue).</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-slate-900">Verified Report Details & Coordinates</td>
                                            <td className="p-3 text-emerald-600 font-semibold">YES</td>
                                            <td className="p-3">Public map visitors, community members, and municipal staff.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-slate-900">Uploaded Photos on Verified Reports</td>
                                            <td className="p-3 text-emerald-600 font-semibold">YES</td>
                                            <td className="p-3">Publicly served through Cloudinary Content Delivery Network (CDN).</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-slate-900">Pending / Rejected / Draft Reports</td>
                                            <td className="p-3 text-red-600 font-semibold">NO</td>
                                            <td className="p-3">The reporting user (via &ldquo;My Reports&rdquo;) and staff moderators.</td>
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
                            Photographic Evidence & Cloud Storage
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                Photographic evidence is essential for validating civic issues and preventing spurious submissions:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li><strong>Direct Signed Uploads:</strong> Photos are validated on the client (max 3 images, 5MB each, JPEG/PNG/WebP) and uploaded securely to <strong>Cloudinary</strong> using server-generated cryptographic HMAC-SHA1 signatures.</li>
                                <li><strong>Two-Phase Atomicity:</strong> If any image in a multi-image upload fails or if the database record cannot be saved, all previously uploaded images in that batch are immediately destroyed to prevent orphaned files.</li>
                                <li><strong>Permanent Destruction upon Rejection/Deletion:</strong> When a report is rejected by moderators or deleted by an administrator, the corresponding images are <strong>permanently destroyed</strong> from Cloudinary servers via their management API.</li>
                                <li><strong>Image Content Notice:</strong> Users should refrain from uploading photographs containing identifiable faces of private individuals, vehicle license plates, or interior private property without consent.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 7: Third-Party Infrastructure */}
                    <section id="third-parties" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">7</span>
                            Third-Party Service Providers & Infrastructure
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>We work with trusted infrastructure providers to operate CitiFIX securely:</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-1">Cloudflare (Workers & CDN)</h3>
                                    <p className="text-slate-600">Edge serverless compute, DDoS mitigation, and SSL/TLS encryption.</p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-1">PostgreSQL Database (Supabase)</h3>
                                    <p className="text-slate-600">Encrypted relational storage for accounts, sessions, reports, and audit logs.</p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-1">Cloudinary</h3>
                                    <p className="text-slate-600">Secure media storage, image optimization, and CDN delivery for verified report photos.</p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-1">OpenFreeMap & MapLibre</h3>
                                    <p className="text-slate-600">Open vector map tiles for rendering streets and geographical features in Iligan City.</p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-1">Google & GitHub (OAuth)</h3>
                                    <p className="text-slate-600">Optional social authentication providers used solely for identity verification.</p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-1">AWS S3 (DEM Elevation)</h3>
                                    <p className="text-slate-600">Terrain hillshade elevation tiles when 3D terrain rendering is enabled.</p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 font-medium">
                                * We do NOT use third-party analytics trackers (such as Google Analytics or Facebook Pixel), advertising networks, or data brokers.
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
                                CitiFIX uses <strong>strictly essential authentication cookies only</strong>:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li><strong>Session Cookie (`better-auth.session_token`):</strong> An HTTP-only, secure, SameSite cookie that keeps you logged in while navigating the platform. It expires automatically upon session expiration or logout.</li>
                                <li><strong>Zero Tracking Storage:</strong> We do not write tracking identifiers, behavioral profiles, or advertising tokens to your browser&apos;s `localStorage`, `sessionStorage`, or `IndexedDB`.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 9: Data Retention & Account Deletion */}
                    <section id="retention-deletion" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">9</span>
                            Data Retention & Account Erasure
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                <strong>Civic Report Log Integrity:</strong> Public infrastructure reports constitute a vital historical civic record. To preserve transparency regarding municipal hazard resolution:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li><strong>Account Erasure Behavior:</strong> When a user requests account deletion, all personal identification records (name, email, password hash, OAuth tokens, active sessions) are permanently deleted from the database.</li>
                                <li><strong>Report Anonymization (`SET NULL`):</strong> Historical reports submitted by the deleted account remain on the platform to maintain the integrity of civic hazard maps, with the author attribute permanently set to <em>Anonymous (NULL)</em>.</li>
                                <li><strong>Unverified Report Deletion:</strong> You may delete your own submitted reports directly through the &ldquo;My Reports&rdquo; dashboard at any time before they are reviewed or verified by staff.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 10: Rights Under RA 10173 */}
                    <section id="rights" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">10</span>
                            Your Data Privacy Rights (RA 10173)
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                Under the <strong>Philippine Data Privacy Act of 2012</strong>, you are entitled to specific statutory rights as a data subject:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <strong className="text-slate-900 block mb-1">Right to be Informed</strong>
                                    <span className="text-slate-600">You have the right to know whether personal data pertaining to you is being processed.</span>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <strong className="text-slate-900 block mb-1">Right of Access</strong>
                                    <span className="text-slate-600">You may inspect your account details and reports anytime via the platform dashboard.</span>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <strong className="text-slate-900 block mb-1">Right to Rectification</strong>
                                    <span className="text-slate-600">You have the right to dispute and request correction of inaccurate personal information.</span>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <strong className="text-slate-900 block mb-1">Right to Erasure or Blocking</strong>
                                    <span className="text-slate-600">You may request the permanent removal of your account and personal identifiers.</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600">
                                To exercise any of these rights, email our Data Privacy Officer at <a href="mailto:chriscent@betteriligancity.org" className="text-orange-600 font-semibold underline">chriscent@betteriligancity.org</a>. We process verified privacy requests promptly.
                            </p>
                        </div>
                    </section>

                    {/* Section 11: Age Requirement */}
                    <section id="age-limit" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">11</span>
                            Age Requirement & Minors
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>
                                CitiFIX is intended for use by individuals who are at least <strong>18 years of age</strong>. We do not knowingly collect personal information from minors. If you believe a minor has created an account, please contact us immediately to have the personal data removed.
                            </p>
                        </div>
                    </section>

                    {/* Section 12: Security Safeguards */}
                    <section id="security" className="scroll-mt-20">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">12</span>
                            Security Safeguards
                        </h2>
                        <div className="space-y-3 text-sm sm:text-base">
                            <p>We employ multiple layers of technical, operational, and organizational security controls:</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li><strong>Role-Based Access Control (RBAC):</strong> Strict backend API guards (`requireUser`, `requireRole`) prevent unauthorized access to moderation queues and user records.</li>
                                <li><strong>Cryptographic Signing:</strong> Cloudinary photo uploads require unique, server-generated HMAC-SHA1 signatures using secret keys never exposed to the client.</li>
                                <li><strong>SQL Injection Prevention:</strong> Parameterized queries enforced across all database transactions via Drizzle ORM.</li>
                                <li><strong>Geofencing Validation:</strong> Point-in-polygon verification ensures submissions fall strictly within official Iligan City boundaries.</li>
                                <li><strong>Immutable Audit Logging:</strong> Administrative moderation actions are logged to an audit table with actor IDs, action types, and timestamps.</li>
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
                                We may periodically update this Privacy Policy to reflect changes in our technical implementation, legal requirements, or civic features. The revised version will be published here with an updated effective date.
                            </p>

                            <div className="mt-4 p-5 bg-orange-50 rounded-2xl border border-orange-200">
                                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Mail size={18} className="text-orange-600" />
                                    Data Protection & Privacy Contact
                                </h3>
                                <p className="text-sm text-slate-700 mb-2">
                                    For inquiries, data correction requests, or account deletion, please contact:
                                </p>
                                <div className="text-sm space-y-1 font-medium text-slate-800">
                                    <p><strong>Organization:</strong> BetterIliganCity (under BetterGov)</p>
                                    <p><strong>Email:</strong> <a href="mailto:chriscent@betteriligancity.org" className="text-orange-600 hover:underline">chriscent@betteriligancity.org</a></p>
                                    <p><strong>Jurisdiction:</strong> Iligan City, Lanao del Norte, Republic of the Philippines</p>
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
