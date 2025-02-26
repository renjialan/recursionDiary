import { JournalForm } from '../_components/journal_form';

export default function NewJournalPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">New Journal Entry</h1>
      <JournalForm />
    </div>
  );
}