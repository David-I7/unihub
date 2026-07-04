# Professor profiles store derived rating summaries

UniHub stores individual professor reviews as the source of truth and stores derived rating averages and review counts on the professor profile for faster reads. The backend updates the professor rating summary in the same transaction as review creation, update, or deletion.

