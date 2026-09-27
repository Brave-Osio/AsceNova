import { useState } from 'react';
import TextField from '../../../components/ui/TextField';
import TextArea from '../../../components/ui/TextArea';
import Checkbox from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import { useAdminAchievements } from '../hooks/useAdminAchievements';
import { useUpdateAchievement } from '../hooks/useUpdateAchievement';
import type { AdminAchievement } from '../../../types/admin.types';

interface EditState {
  title: string;
  description: string;
  icon: string;
  xpReward: string;
  isActive: boolean;
}

function toEditState(a: AdminAchievement): EditState {
  return { title: a.title, description: a.description, icon: a.icon, xpReward: String(a.xpReward), isActive: a.isActive };
}

function AchievementRow({ achievement }: { achievement: AdminAchievement }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditState>(toEditState(achievement));
  const { mutate, isPending } = useUpdateAchievement();

  function startEditing() {
    setForm(toEditState(achievement));
    setIsEditing(true);
  }

  function handleSave() {
    mutate(
      {
        id: achievement.id,
        input: {
          title: form.title,
          description: form.description,
          icon: form.icon,
          xpReward: Number(form.xpReward),
          isActive: form.isActive,
        },
      },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">{achievement.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{achievement.title}</span>
              {!achievement.isActive && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{achievement.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">+{achievement.xpReward} XP</span>
          <Button size="sm" variant="secondary" onClick={startEditing}>
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-white/5 py-4 last:border-0">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Icon (emoji)" value={form.icon} onChange={(v) => setForm((f) => ({ ...f, icon: v }))} />
        <TextField label="Title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
      </div>
      <div className="mt-3">
        <TextArea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
      </div>
      <div className="mt-3 flex items-center gap-6">
        <div className="w-32">
          <TextField
            label="XP Reward"
            type="number"
            value={form.xpReward}
            onChange={(v) => setForm((f) => ({ ...f, xpReward: v }))}
          />
        </div>
        <Checkbox label="Active" checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
      </div>
      <div className="mt-4 flex gap-2">
        <Button size="sm" loading={isPending} onClick={handleSave}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/**
 * Metadata-only editor (title/description/icon/XP/active-toggle) —
 * unlock logic stays hardcoded in progressService.ts's ACHIEVEMENT_RULES,
 * so this deliberately doesn't support creating new achievements (a new
 * row with no matching code rule would never unlock for anyone).
 */
export default function AchievementEditor() {
  const { achievements, isLoading } = useAdminAchievements();

  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Achievements</div>
      <div className="mt-3">
        {isLoading ? (
          <p className="py-4 text-center text-sm text-gray-500">Loading…</p>
        ) : achievements.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">No achievements found.</p>
        ) : (
          achievements.map((a) => <AchievementRow key={a.id} achievement={a} />)
        )}
      </div>
    </div>
  );
}
