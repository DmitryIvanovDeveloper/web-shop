import { mockPatchNotes } from '../../shared/mocks/data';

export default function PatchNotesPage() {
  return (
    <div>
      <h2>Patch Notes (Mock)</h2>
      <ul>
        {mockPatchNotes.map(p => (
          <li key={p.version}>
            <strong>{p.version}</strong> — {p.date}
            <ul>
              {p.changes.map((c, i) => (<li key={i}>{c}</li>))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
