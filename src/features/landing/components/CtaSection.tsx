import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

export default function CtaSection() {
  return (
    <section className="px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl"
      >
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/25 p-10 text-center">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/10" />
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative">
            <span className="text-4xl">🚀</span>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              Ready to build the streak?
            </h2>
            <p className="mt-4 text-gray-300 max-w-md mx-auto leading-relaxed">
              Your rank doesn't care how much you weigh. It only cares whether you show up — every single day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link
                to={ROUTES.setup}
                className="group relative rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-bold text-white overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:scale-105"
              >
                <span className="relative z-10">Start Your Journey →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                to={ROUTES.coach}
                className="rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-bold text-gray-200 hover:bg-white/10 transition-all hover:scale-105"
              >
                🤖 Talk to Coach
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
