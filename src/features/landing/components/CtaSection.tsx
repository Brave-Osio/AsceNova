import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket, ArrowRight, Bot } from 'lucide-react';
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
        <div className="card rounded-3xl p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary-light">
            <Rocket size={22} />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-brand-text sm:text-3xl">
            Ready to build the streak?
          </h2>
          <p className="mt-4 text-brand-text-secondary max-w-md mx-auto leading-relaxed">
            Your rank doesn't care how much you weigh. It only cares whether you show up — every single day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              to={ROUTES.setup}
              className="flex items-center gap-2 rounded-full bg-brand-primary px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary-light"
            >
              Start Your Journey <ArrowRight size={16} />
            </Link>
            <Link
              to={ROUTES.coach}
              className="flex items-center gap-2 rounded-full border border-brand-border bg-brand-card-alt px-8 py-3.5 text-sm font-bold text-brand-text-secondary transition-colors hover:text-brand-text"
            >
              <Bot size={16} /> Talk to Coach
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
