import { ArrowLeft, Shield, Heart, Lock, Eye, Download, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/Button';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <MobileLayout>
                <div className="mobile-container pb-32">
                    <div className="px-4">
                        <header className="flex items-center justify-between pt-8 pb-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="rounded-full w-10 h-10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                            >
                                <ArrowLeft size={20} />
                            </Button>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy Policy</h1>
                            <div className="w-10"></div>
                        </header>

                        <div className="space-y-6">
                            {/* Header Card */}
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center mr-4">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Our Garden of Trust</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: June 8, 2025</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    At Habitly, we believe your privacy is as precious as the habits you're nurturing. This policy explains how we collect, use, and protect your information.
                                </p>
                            </div>

                            {/* Information We Collect */}
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Eye className="h-5 w-5 mr-2 text-blue-500" />
                                    Information We Collect
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Information You Give Us</h4>
                                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                                            <li>• Account details (email, username, preferences)</li>
                                            <li>• Your beautiful habits and completion status</li>
                                            <li>• Your Google account email and basic profile info (if you sign in with Google)</li>
                                            <li>• App settings and notification preferences</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Information We Collect Automatically</h4>
                                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                                            <li>• Device type and operating system</li>
                                            <li>• Anonymous usage patterns to improve the app</li>
                                            <li>• Technical data for bug fixes and stability</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* How We Use Your Information */}
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Heart className="h-5 w-5 mr-2 text-pink-500" />
                                    How We Use Your Information
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        "Track your habits and show your beautiful progress",
                                        "Send gentle reminders (only if you want them!)",
                                        "Improve our app to serve you better",
                                        "Provide support when you reach out",
                                        "Celebrate your achievements and streaks"
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-start">
                                            <div className="w-2 h-2 rounded-full bg-pink-400 mt-2 mr-3 flex-shrink-0"></div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Data Protection */}
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Lock className="h-5 w-5 mr-2 text-green-500" />
                                    How We Protect Your Data
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: "🔐", title: "Encryption", desc: "All data encrypted in transit and at rest" },
                                        { icon: "🏰", title: "Secure Storage", desc: "Industry-standard cloud security" },
                                        { icon: "👥", title: "Limited Access", desc: "Only essential team members" },
                                        { icon: "🔍", title: "Regular Audits", desc: "Continuous security monitoring" }
                                    ].map((item, index) => (
                                        <div key={index} className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                                            <div className="text-2xl mb-2">{item.icon}</div>
                                            <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">{item.title}</h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-300">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Your Rights */}
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Download className="h-5 w-5 mr-2 text-purple-500" />
                                    Your Privacy Rights
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    You have complete control over your data:
                                </p>
                                <div className="space-y-3">
                                    {[
                                        { icon: "📥", title: "Access", desc: "Download all your habit data anytime" },
                                        { icon: "✏️", title: "Update", desc: "Change or correct your information" },
                                        { icon: "🗑️", title: "Delete", desc: "Remove your account and all data" },
                                        { icon: "🔕", title: "Opt-out", desc: "Unsubscribe from notifications" },
                                        { icon: "📤", title: "Export", desc: "Get your data in a readable format" }
                                    ].map((right, index) => (
                                        <div key={index} className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                                            <span className="text-xl mr-3">{right.icon}</span>
                                            <div>
                                                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">{right.title}</h4>
                                                <p className="text-xs text-gray-600 dark:text-gray-300">{right.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Data Sharing */}
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Sharing Your Information
                                </h3>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                        🌿 We never sell your personal data
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    We only share information when:
                                </p>
                                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span><strong>You choose to</strong> export or share your achievements</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span><strong>Legal requirements</strong> (we'll notify you if possible)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span><strong>Trusted service providers</strong> help us run Habitly (under strict agreements)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span><strong>Google Sign-In:</strong> We use your Google account only to authenticate and personalize your experience. We do not access or store your Google password or any private data not explicitly granted by you.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-6 backdrop-blur-sm border border-pink-200/50 dark:border-pink-700/50 shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Mail className="h-5 w-5 mr-2 text-pink-500" />
                                    Questions About Privacy?
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    We're here to help! Reach out anytime with privacy questions.
                                </p>
                                <Button
                                    onClick={() => window.location.href = 'mailto:support@myhabitly.com?subject=Privacy Question'}
                                    className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl"
                                >
                                    Contact Team
                                </Button>
                            </div>

                            {/* Our Promise */}
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Our Promise to You 🌸
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    At Habitly, we're committed to transparency, respecting your choices, and protecting your data like it's our own.
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    Thank you for trusting us with your data. Let's continue growing together! 🌱
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


            </MobileLayout>
        </div>
    );
};

export default PrivacyPolicy;
