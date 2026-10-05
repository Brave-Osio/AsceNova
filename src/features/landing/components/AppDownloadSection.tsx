import { motion } from 'framer-motion';
import { Download, Smartphone } from 'lucide-react';
import { ANDROID_APK_URL } from '../../../constants/app';

const INSTALL_STEPS = [
  'Tap Download and open the file when it finishes.',
  'If Android asks, allow installs from your browser ("Install unknown apps").',
  'If Play Protect shows a prompt, choose Install anyway.',
];

export default function AppDownloadSection() {
  return (
    <section className="px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl"
      >
        <div className="card rounded-3xl p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary-light">
            <Smartphone size={22} />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-brand-text sm:text-3xl">Get the Android app</h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-brand-text-secondary">
            Take your streak with you. Install AsceNova on your Android phone — no setup needed, just an internet
            connection.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href={ANDROID_APK_URL}
              className="flex items-center gap-2 rounded-full bg-brand-primary px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary-light"
            >
              <Download size={16} /> Download for Android
            </a>
          </div>
          <ol className="mx-auto mt-6 max-w-sm list-inside list-decimal space-y-1 text-left text-xs text-brand-text-muted">
            {INSTALL_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </motion.div>
    </section>
  );
}
