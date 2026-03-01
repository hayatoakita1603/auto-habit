import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { loadPhotoPaths } from '../services/photoService';

export const usePhotos = (user: User | null) => {
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    loadPhotoPaths(user.uid).then(setPhotoPaths);
  }, [user]);

  return { photoPaths };
};
