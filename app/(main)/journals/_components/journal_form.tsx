'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export const JournalForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('journals')
        .insert({
          title,
          content,
          user_id: user.id
        });

      if (error) throw error;
      
      // Reset form
      setTitle('');
      setContent('');
      alert('Journal saved successfully!');
      
    } catch (error) {
      console.error('Error saving journal:', error);
      alert('Error saving journal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Journal title"
          className="w-full p-2 rounded border"
          required
        />
      </div>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts..."
          className="w-full h-64 p-2 rounded border"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Saving...' : 'Save Journal'}
      </button>
    </form>
  );
};