import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <div className="w-full bg-[#0d1a14] px-8 pt-8 pb-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap justify-between items-start gap-8 pb-4">
                    <div>
                        <h1 className="text-[#e8f4ed] text-2xl font-light tracking-tight font-serif m-0">
                            Made with love
                        </h1>
                        <div className="w-8 h-px bg-green-400 my-3 rounded-full" />
                        <p className="text-white/40 text-sm tracking-wide m-0">
                            © 2026 All rights reserved.
                        </p>
                    </div>

                    <div>
                        <p className="text-white/35 text-[0.65rem] font-semibold tracking-[3px] uppercase mb-3">
                            Connect
                        </p>
                        <div className="flex gap-2">
                            {["Facebook", "Twitter", "Email"].map((label) => (
                                <Link
                                    key={label}
                                    to="#"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/15 text-[13px] text-white/60 no-underline transition-all duration-200 hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5"
                                >
                                    <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;