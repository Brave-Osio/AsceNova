import { motion } from 'framer-motion';
import ForgotPasswordForm from '../../features/auth/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <section className="relative mx-auto max-w-md px-4 py-16 sm:py-24">
      <div className="orb w-72 h-72 bg-violet-600/10 -top-16 -right-24" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 mb-3">
          🔑 Reset access
        </span>
        <h1 className="text-3xl font-extrabold text-white">Forgot Password</h1>
        <p className="mt-1.5 text-gray-400">We'll help you get back in.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="glass-strong relative mt-8 rounded-3xl border border-white/8 p-8"
      >
        <ForgotPasswordForm />
      </motion.div>
    </section>
  );
}
