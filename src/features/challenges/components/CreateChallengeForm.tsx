import { useState } from 'react';
import OptionSelector from '../../../components/ui/OptionSelector';
import TagInput from '../../../components/ui/TagInput';
import Button from '../../../components/ui/Button';
import { useChallenges } from '../hooks/useChallenges';
import { useChallengeActions } from '../hooks/useChallengeActions';

export default function CreateChallengeForm() {
  const { catalog } = useChallenges();
  const { create, isCreating } = useChallengeActions();
  const [challengeId, setChallengeId] = useState('');
  const [usernames, setUsernames] = useState<string[]>([]);

  const options = catalog.map((c) => ({ value: c.id, label: `${c.icon} ${c.title}` }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await create(challengeId || catalog[0].id, usernames);
    if (ok) setUsernames([]);
  }

  if (catalog.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4 rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Start a Challenge</div>
      <OptionSelector
        label="Challenge"
        value={challengeId || catalog[0].id}
        options={options}
        onChange={setChallengeId}
      />
      <TagInput
        label="Invite friends by username (optional)"
        value={usernames}
        onChange={setUsernames}
        placeholder="Type a username, press Enter"
      />
      <div>
        <Button type="submit" loading={isCreating}>
          Start Challenge
        </Button>
      </div>
    </form>
  );
}
