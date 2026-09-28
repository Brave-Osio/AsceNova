import { motion } from 'framer-motion';
import LoginForm from '../../features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">Log In</h1>
        <p className="mt-1.5 text-brand-text-secondary">Continue your fitness journey.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="card mt-8 rounded-3xl p-8"
      >
        <LoginForm />
      </motion.div>
    </section>
  );
}
