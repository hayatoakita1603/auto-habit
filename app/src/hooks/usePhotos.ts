import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { loadPhotoPaths } from '../services/photoService';

export const usePhotos = (user: User | null) => {
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);

  const refresh = useCallback(() => {
    if (!user) return;
    loadPhotoPaths(user.uid).then(setPhotoPaths);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { photoPaths, refresh };
};
