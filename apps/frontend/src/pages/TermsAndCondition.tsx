import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/Button';

const TermsAndConditions = () => {
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
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Terms & Conditions</h1>
                            <div className="w-10"></div>
                        </header>

                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Contact:</strong> support@myhabitly.com
                                </p>
                            </div>

                            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                <li>• You own all your habit data and progress</li>
                                <li>• Export your data anytime you want</li>
                                <li>• Delete your account and data whenever needed</li>
                                <li>• We'll never sell your personal information</li>
                                <li>• If you sign in with Google, we only request basic profile info and email for authentication purposes</li>
                                <li>• Your Google data is used strictly for login and not shared or sold</li>
                            </ul>

                            <div className="grid grid-cols-1 gap-2">
                                <Button
                                    onClick={() => window.location.href = 'mailto:support@myhabitly.com?subject=Terms Question'}
                                    className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl"
                                >
                                    General Inquiries
                                </Button>
                            </div>

                            {/* Add Google API Compliance section */}
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Google API Compliance
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    If you choose to sign in with Google, Habitly complies with Google's API Services User Data Policy, including the Limited Use requirements. We only request the minimum data necessary and do not share, sell, or use your Google information for any unauthorized purpose.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </MobileLayout>
        </div>
    );
};

export default TermsAndConditions;
