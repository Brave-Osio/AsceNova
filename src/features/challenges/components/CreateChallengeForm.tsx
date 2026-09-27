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
  const [emails, setEmails] = useState<string[]>([]);

  const options = catalog.map((c) => ({ value: c.id, label: `${c.icon} ${c.title}` }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!challengeId) return;
    await create(challengeId, emails);
    setEmails([]);
  }

  if (catalog.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} className="glass flex flex-col gap-4 rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Start a Challenge</div>
      <OptionSelector
        label="Challenge"
        value={challengeId || catalog[0].id}
        options={options}
        onChange={setChallengeId}
      />
      <TagInput
        label="Invite friends (optional)"
        value={emails}
        onChange={setEmails}
        placeholder="friend@email.com"
      />
      <div>
        <Button type="submit" loading={isCreating}>
          Start Challenge
        </Button>
      </div>
    </form>
  );
}
