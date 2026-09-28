import { motion } from 'framer-motion';
import RegisterForm from '../../features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">Create Your Account</h1>
        <p className="mt-1.5 text-brand-text-secondary">Start tracking, training, and leveling up.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="card mt-8 rounded-3xl p-8"
      >
        <RegisterForm />
      </motion.div>
    </section>
  );
}
